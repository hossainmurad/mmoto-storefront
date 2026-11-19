import { Empty, NotConnected } from "@/components/shop/Notice"
import { ProductGrid } from "@/components/shop/ProductCard"
import s from "@/components/shop/shop.module.css"
import { getI18n } from "@/lib/i18n/server"
import { medusaConfigured } from "@/lib/medusa/client"
import { listCollectionProducts } from "@/lib/medusa/products"
import { DEALS_COLLECTION } from "@/lib/nav-config"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.deals.title, description: t.deals.intro }
}

/** Products in the "deals" collection (Medusa Admin > Products > Collections). */
export default async function DealsPage() {
  const { locale, t } = await getI18n()
  const { products } = await listCollectionProducts(locale, DEALS_COLLECTION)

  return (
    <div className="page">
      <h1 className="title">{t.deals.title}</h1>
      <p className={s.lead}>{t.deals.intro}</p>
      {!medusaConfigured ? (
        <NotConnected t={t} />
      ) : products.length ? (
        <ProductGrid products={products} locale={locale} t={t} />
      ) : (
        <Empty>{t.deals.empty}</Empty>
      )}
    </div>
  )
}
