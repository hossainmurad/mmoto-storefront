import Link from "next/link"
import { notFound } from "next/navigation"
import { Empty, NotConnected } from "@/components/shop/Notice"
import { PAGE_SIZE, Pager, pageFrom } from "@/components/shop/Pager"
import { ProductGrid } from "@/components/shop/ProductCard"
import s from "@/components/shop/shop.module.css"
import { fmt, num } from "@/lib/i18n/format"
import { getI18n } from "@/lib/i18n/server"
import { findByPath, getCategoryTree } from "@/lib/medusa/categories"
import { medusaConfigured } from "@/lib/medusa/client"
import { listProducts } from "@/lib/medusa/products"
import { catName, categoryHref, type NavCategory } from "@/lib/nav-types"

type Props = { params: Promise<{ handle: string[] }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props) {
  const { handle } = await params
  const { locale } = await getI18n()
  const cat = findByPath(await getCategoryTree(), handle)?.at(-1)
  return { title: cat ? catName(cat, locale) : "Category" }
}

/** Ids of a category and everything under it, so parent pages list their subcategories' products too. */
function withDescendants(c: NavCategory): string[] {
  return [c.id, ...c.children.flatMap(withDescendants)].filter((id) => !id.startsWith("fallback_"))
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ handle }, sp, { locale, t, href }] = await Promise.all([params, searchParams, getI18n()])
  const trail = findByPath(await getCategoryTree(), handle)
  if (!trail) notFound()
  const cat = trail[trail.length - 1]
  const page = pageFrom(sp.page)

  const ids = withDescendants(cat)
  const { products, count } = ids.length
    ? await listProducts(locale, { categoryId: ids, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
    : { products: [], count: 0 }

  return (
    <div className="page">
      <nav className="crumb" aria-label={t.nav.breadcrumb}>
        <Link href={href("/")}>{t.nav.home}</Link>
        {trail.map((c, i) => (
          <span key={c.id} style={{ display: "contents" }}>
            <span aria-hidden="true">/</span>
            {i === trail.length - 1 ? (
              <span aria-current="page">{catName(c, locale)}</span>
            ) : (
              <Link href={categoryHref(c, locale)}>{catName(c, locale)}</Link>
            )}
          </span>
        ))}
      </nav>
      <h1 className="title">{catName(cat, locale)}</h1>

      {cat.children.length > 0 && (
        <ul className="tiles">
          {cat.children.map((c) => (
            <li key={c.id}><Link href={categoryHref(c, locale)}>{catName(c, locale)}</Link></li>
          ))}
        </ul>
      )}

      <section className={s.section} aria-labelledby="products">
        <h2 id="products" className={s.h2}>{t.category.products}</h2>
        {!medusaConfigured ? (
          <NotConnected t={t} />
        ) : products.length ? (
          <>
            <p className={s.meta}>{fmt(t.category.count, { n: num(locale, count) })}</p>
            <ProductGrid products={products} locale={locale} t={t} />
            <Pager
              page={page}
              total={Math.ceil(count / PAGE_SIZE)}
              hrefFor={(n) => `${categoryHref(cat, locale)}${n > 1 ? `?page=${n}` : ""}`}
              locale={locale}
              t={t}
            />
          </>
        ) : (
          <Empty>{t.category.empty}</Empty>
        )}
      </section>
    </div>
  )
}
