import Link from "next/link"
import { CartLineControls } from "@/components/shop/CartLineControls"
import { DemoNote, Empty } from "@/components/shop/Notice"
import s from "@/components/shop/shop.module.css"
import { fmt, price } from "@/lib/i18n/format"
import { getI18n } from "@/lib/i18n/server"
import { getCart } from "@/lib/medusa/cart"
import { medusaConfigured } from "@/lib/medusa/client"

// Per-visitor (reads the cart cookie).
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.cart.title, robots: { index: false } }
}

/** Cart: lines with quantity controls and the subtotal. Checkout is not built yet (see TODO below). */
export default async function CartPage() {
  const { locale, t, href } = await getI18n()
  const cart = await getCart(locale)
  const items = cart?.items ?? []
  const money = (n: number) => price(locale, n, cart?.currency_code ?? "bdt")
  const subtotal = cart?.item_subtotal ?? cart?.subtotal ?? items.reduce((n, i) => n + i.unit_price * i.quantity, 0)

  return (
    <div className="page">
      <h1 className="title">{t.cart.title}</h1>
      {!medusaConfigured && <DemoNote t={t} />}
        {!items.length ? (
        <Empty>
          {t.cart.empty}
          <br />
          <Link href={href("/")}>{t.cart.continue}</Link>
        </Empty>
      ) : (
        <div className={s.cartLayout}>
          <ul className={s.lines}>
            {items.map((i) => (
              <li key={i.id} className={s.line}>
                <div className={s.lineImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {i.thumbnail && <img src={i.thumbnail} alt="" />}
                </div>
                <div className={s.lineInfo}>
                  {i.product_handle ? (
                    <Link href={href(`/products/${i.product_handle}`)} className={s.lineTitle}>{i.title}</Link>
                  ) : (
                    <span className={s.lineTitle}>{i.title}</span>
                  )}
                  {i.variant_title && i.variant_title !== "Default" && <span className={s.meta}>{i.variant_title}</span>}
                  <span className={s.meta}>{fmt(t.cart.each, { price: money(i.unit_price) })}</span>
                </div>
                <div className={s.lineControls}>
                  <strong>{money(i.total ?? i.unit_price * i.quantity)}</strong>
                  <CartLineControls lineId={i.id} quantity={i.quantity} title={i.title} />
                </div>
              </li>
            ))}
          </ul>
          <aside className={s.summary} aria-label={t.cart.subtotal}>
            <div className={s.sumRow}>
              <span>{t.cart.subtotal}</span>
              <span>{money(subtotal)}</span>
            </div>
            <p className={s.meta}>{t.cart.shippingNote}</p>
            {/* TODO: checkout page (address, delivery, COD / bKash / Nagad). Add the button back when it exists:
                <Link href={href("/checkout")} className={`${s.btn} ${s.btnBlock}`}>{t.cart.checkout}</Link> */}
            <Link href={href("/")} className={`${s.btn} ${s.btnGhost} ${s.btnBlock}`}>{t.cart.continue}</Link>
          </aside>
        </div>
      )}
    </div>
  )
}
