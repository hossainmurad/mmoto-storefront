import Link from "next/link"
import { ClearList } from "@/components/shop/ClearList"
import { ListToggle } from "@/components/shop/ListToggle"
import { DemoNote, Empty } from "@/components/shop/Notice"
import { Price } from "@/components/shop/Price"
import s from "@/components/shop/shop.module.css"
import { getI18n } from "@/lib/i18n/server"
import { getListProducts } from "@/lib/lists-server"
import { medusaConfigured } from "@/lib/medusa/client"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.compare.title, robots: { index: false } }
}

export default async function ComparePage() {
  const { locale, t, href } = await getI18n()
  const products = await getListProducts("compare", locale)

  return (
    <div className="page">
      <h1 className="title">{t.compare.title}</h1>
      {!medusaConfigured && <DemoNote t={t} />}
        {!products.length ? (
        <Empty>{t.compare.empty}</Empty>
      ) : (
        <>
          <ClearList list="compare" />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">{t.compare.product}</span></th>
                  {products.map((p) => (
                    <th key={p.id} scope="col">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.thumbnail && <img src={p.thumbnail} alt="" className={s.cmpImg} />}
                      <Link href={href(`/products/${p.handle}`)}>{p.title}</Link>
                      <div style={{ marginTop: 8 }}>
                        <ListToggle list="compare" productId={p.id} refreshPage />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{t.compare.price}</th>
                  {products.map((p) => (
                    <td key={p.id}><Price money={p.price} locale={locale} noPrice={t.product.noPrice} /></td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t.compare.availability}</th>
                  {products.map((p) => (
                    <td key={p.id}>{p.inStock ? t.compare.inStock : t.product.outOfStock}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t.compare.options}</th>
                  {products.map((p) => (
                    <td key={p.id}>
                      {p.variants.length > 1 ? p.variants.map((v) => v.title).join(", ") : "–"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
