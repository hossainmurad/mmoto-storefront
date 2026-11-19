import { ClearList } from "@/components/shop/ClearList"
import { DemoNote, Empty } from "@/components/shop/Notice"
import { ProductGrid } from "@/components/shop/ProductCard"
import { getI18n } from "@/lib/i18n/server"
import { getListProducts } from "@/lib/lists-server"
import { medusaConfigured } from "@/lib/medusa/client"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.wishlist.title, robots: { index: false } }
}

export default async function WishlistPage() {
  const { locale, t } = await getI18n()
  const products = await getListProducts("wishlist", locale)

  return (
    <div className="page">
      <h1 className="title">{t.wishlist.title}</h1>
      {!medusaConfigured && <DemoNote t={t} />}
        {products.length ? (
        <>
          <ClearList list="wishlist" />
          <ProductGrid products={products} locale={locale} t={t} refreshOnToggle />
        </>
      ) : (
        <Empty>{t.wishlist.empty}</Empty>
      )}
    </div>
  )
}
