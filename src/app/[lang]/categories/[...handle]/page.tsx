import Link from "next/link"
import { notFound } from "next/navigation"
import { FilteredProducts } from "@/components/shop/filters/FilteredProducts"
import { DemoNote, Empty } from "@/components/shop/Notice"
import { pageFrom } from "@/components/shop/Pager"
import s from "@/components/shop/shop.module.css"
import { parseFilters, type Subcategory } from "@/lib/filters"
import { getI18n } from "@/lib/i18n/server"
import { findByPath, getCategoryTree } from "@/lib/medusa/categories"
import { medusaConfigured } from "@/lib/medusa/client"
import { listCategoryProductsForFilters } from "@/lib/medusa/products"
import { catName, categoryHref, type NavCategory } from "@/lib/nav-types"

type Props = {
  params: Promise<{ handle: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params
  const { locale } = await getI18n()
  const cat = findByPath(await getCategoryTree(), handle)?.at(-1)
  return { title: cat ? catName(cat, locale) : "Category" }
}

/** Ids of a category and everything under it, so parent pages list their subcategories' products too. */
function withDescendants(c: NavCategory): string[] {
  // Fallback-tree ids only mean something to the demo catalogue, not to Medusa.
  return [c.id, ...c.children.flatMap(withDescendants)].filter((id) => !medusaConfigured || !id.startsWith("fallback_"))
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ handle }, sp, { locale, t, href }] = await Promise.all([params, searchParams, getI18n()])
  const trail = findByPath(await getCategoryTree(), handle)
  if (!trail) notFound()
  const cat = trail[trail.length - 1]

  // Whole category (up to 1000 products); filtering, sorting and paging happen in FilteredProducts.
  const products = await listCategoryProductsForFilters(locale, withDescendants(cat))
  const subcategories: Subcategory[] = cat.children.map((c) => ({
    handle: c.handle,
    label: catName(c, locale),
    ids: withDescendants(c),
  }))

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
        {!medusaConfigured && <DemoNote t={t} />}
        {products.length ? (
          <FilteredProducts
            products={products}
            subcategories={subcategories}
            filters={parseFilters(sp)}
            page={pageFrom(sp.page)}
            basePath={categoryHref(cat, locale)}
            locale={locale}
            t={t}
          />
        ) : (
          <Empty>{t.category.empty}</Empty>
        )}
      </section>
    </div>
  )
}
