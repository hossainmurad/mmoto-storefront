"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { addToCart } from "@/lib/actions/cart"
import { useI18n } from "@/lib/i18n/client"
import { fmt } from "@/lib/i18n/format"
import { COUNTS_EVENT } from "@/lib/lists"
import type { ShopProduct } from "@/lib/shop-types"
import { ListToggle } from "./ListToggle"
import { Price } from "./Price"
import { Qty } from "./Qty"
import s from "./shop.module.css"

/** Option pickers (size, colour…), price, quantity and Add to cart for one product. */
export function BuyBox({ product }: { product: ShopProduct }) {
  const { t, locale, href } = useI18n()
  const first = product.variants.find((v) => v.inStock) ?? product.variants[0]
  const [chosen, setChosen] = useState<Record<string, string>>(first?.options ?? {})
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState<"idle" | "added" | "error">("idle")
  const [pending, start] = useTransition()

  const variant = useMemo(
    () =>
      product.variants.length === 1
        ? product.variants[0]
        : product.variants.find((v) => product.options.every((o) => v.options[o.id] === chosen[o.id])),
    [product, chosen],
  )
  // Values that exist with the other current choices, so impossible combinations can be greyed out.
  const exists = (optionId: string, value: string) =>
    product.variants.some((v) =>
      product.options.every((o) => (o.id === optionId ? v.options[o.id] === value : !chosen[o.id] || v.options[o.id] === chosen[o.id])),
    )

  const canBuy = !!variant && variant.inStock
  const onAdd = () => {
    if (!variant) return
    setStatus("idle")
    start(async () => {
      const res = await addToCart(variant.id, qty)
      setStatus(res.ok ? "added" : "error")
      if (res.ok) window.dispatchEvent(new Event(COUNTS_EVENT))
    })
  }

  return (
    <div className={s.buy}>
      <Price money={variant?.price ?? product.price} locale={locale} noPrice={t.product.noPrice} className={s.pdpPrice} />

      {product.variants.length > 1 &&
        product.options.map((o) => (
          <fieldset key={o.id} className={s.optGroup}>
            <legend>{fmt(t.product.chooseOption, { name: o.label ?? o.title })}</legend>
            <div className={s.optValues}>
              {o.values.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={s.optValue}
                  aria-pressed={chosen[o.id] === v}
                  style={exists(o.id, v) ? undefined : { opacity: 0.45 }}
                  onClick={() => {
                    setChosen((c) => ({ ...c, [o.id]: v }))
                    setStatus("idle")
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </fieldset>
        ))}

      <div className={s.buyRow}>
        <Qty value={qty} onChange={setQty} label={t.product.quantity} />
        <button type="button" className={s.btn} disabled={!canBuy || pending} onClick={onAdd}>
          {pending ? t.product.adding : !variant ? t.product.unavailable : !variant.inStock ? t.product.outOfStock : t.product.addToCart}
        </button>
        <ListToggle list="wishlist" productId={product.id} />
        <ListToggle list="compare" productId={product.id} />
      </div>

      <p className={`${s.status} ${status === "added" ? s.statusOk : status === "error" ? s.statusErr : ""}`} role="status">
        {status === "added" && (
          <>
            {t.product.added} · <Link href={href("/cart")}>{t.product.viewCart}</Link>
          </>
        )}
        {status === "error" && t.store.error}
      </p>
      <p className={s.meta}>{t.product.codNote}</p>
    </div>
  )
}
