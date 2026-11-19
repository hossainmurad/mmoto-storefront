"use client"

import { useState, useTransition } from "react"
import { updateLineItem } from "@/lib/actions/cart"
import { useI18n } from "@/lib/i18n/client"
import { fmt } from "@/lib/i18n/format"
import { COUNTS_EVENT } from "@/lib/lists"
import { Qty } from "./Qty"
import s from "./shop.module.css"

/** Quantity stepper and Remove for one cart line. The page re-renders from the server after each change. */
export function CartLineControls({ lineId, quantity, title }: { lineId: string; quantity: number; title: string }) {
  const { t } = useI18n()
  const [pending, start] = useTransition()
  const [error, setError] = useState(false)

  const set = (n: number) =>
    start(async () => {
      const res = await updateLineItem(lineId, n)
      setError(!res.ok)
      window.dispatchEvent(new Event(COUNTS_EVENT))
    })

  return (
    <>
      <Qty value={quantity} onChange={set} label={fmt(t.cart.quantity, { name: title })} disabled={pending} />
      <button type="button" className={s.linkBtn} onClick={() => set(0)} disabled={pending}>
        {t.cart.remove}
      </button>
      {error && <span className={s.statusErr} role="alert">{t.store.error}</span>}
    </>
  )
}
