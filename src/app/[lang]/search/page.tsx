import Link from "next/link"
import { Empty, NotConnected } from "@/components/shop/Notice"
import { PAGE_SIZE, Pager, pageFrom } from "@/components/shop/Pager"
import { ProductGrid } from "@/components/shop/ProductCard"
import s from "@/components/shop/shop.module.css"
import { fmt, num } from "@/lib/i18n/format"
import { getI18n } from "@/lib/i18n/server"
import { getCategoryTree } from "@/lib/medusa/categories"
import { medusaConfigured } from "@/lib/medusa/client"
import { listProducts } from "@/lib/medusa/products"
import { catName, categoryHref, type NavCategory } from "@/lib/nav-types"

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.search.title, robots: { index: false } }
}

export default async function SearchPage({ searchParams }: Props) {
  const [sp, { locale, t, href }] = await Promise.all([searchParams, getI18n()])
  const q = (sp.q ?? "").trim().slice(0, 80)
  const page = pageFrom(sp.page)

  if (!q) {
    return (
      <div className="page">
        <h1 className="title">{t.search.title}</h1>
        <p className={s.lead}>{t.search.hint}</p>
      </div>
    )
  }

  const needle = q.toLocaleLowerCase()
  const matches: NavCategory[] = []
  const walk = (list: NavCategory[]) =>
    list.forEach((c) => {
      if ([c.name, c.nameBn].some((n) => n?.toLocaleLowerCase().includes(needle))) matches.push(c)
      walk(c.children)
    })
  walk(await getCategoryTree())

  const { products, count } = await listProducts(locale, { q, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })

  return (
    <div className="page">
      <h1 className="title">{fmt(t.search.resultsFor, { q })}</h1>

      {matches.length > 0 && (
        <section className={s.section} aria-labelledby="cat-matches">
          <h2 id="cat-matches" className={s.h2}>{t.search.categories}</h2>
          <ul className="tiles">
            {matches.slice(0, 12).map((c) => (
              <li key={c.id}><Link href={categoryHref(c, locale)}>{catName(c, locale)}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <section className={s.section} aria-labelledby="prod-matches">
        <h2 id="prod-matches" className={s.h2}>{t.search.products}</h2>
        {!medusaConfigured ? (
          <NotConnected t={t} />
        ) : products.length ? (
          <>
            <p className={s.meta} role="status">{fmt(t.search.count, { n: num(locale, count) })}</p>
            <ProductGrid products={products} locale={locale} t={t} />
            <Pager
              page={page}
              total={Math.ceil(count / PAGE_SIZE)}
              hrefFor={(n) => href(`/search?q=${encodeURIComponent(q)}${n > 1 ? `&page=${n}` : ""}`)}
              locale={locale}
              t={t}
            />
          </>
        ) : (
          <Empty>{fmt(t.search.noResults, { q })}</Empty>
        )}
      </section>
    </div>
  )
}
