import Link from "next/link"
import { ProductGrid } from "@/components/shop/ProductCard"
import s from "@/components/shop/shop.module.css"
import { getI18n } from "@/lib/i18n/server"
import { getCategoryTree } from "@/lib/medusa/categories"
import { listProducts } from "@/lib/medusa/products"
import { catName, categoryHref } from "@/lib/nav-types"

export default async function Home() {
  const { locale, t } = await getI18n()
  const [categories, latest] = await Promise.all([
    getCategoryTree(),
    listProducts(locale, { limit: 8 }).catch(() => ({ products: [], count: 0 })),
  ])
  return (
    <div className="page">
      <h1 className="title">{t.home.title}</h1>
      <p className={s.lead}>{t.home.intro}</p>
      <ul className="tiles">
        {categories.map((c) => (
          <li key={c.id}><Link href={categoryHref(c, locale)}>{catName(c, locale)}</Link></li>
        ))}
      </ul>

      {latest.products.length > 0 && (
        <section className={s.section} aria-labelledby="latest">
          <h2 id="latest" className={s.h2}>{t.home.latest}</h2>
          <ProductGrid products={latest.products} locale={locale} t={t} />
        </section>
      )}
    </div>
  )
}
