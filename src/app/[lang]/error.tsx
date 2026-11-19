"use client"

import { useEffect } from "react"
import s from "@/components/shop/shop.module.css"
import { useI18n } from "@/lib/i18n/client"

/** Shown when a page fails to load (for example Medusa is down). The header stays usable. */
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n()
  useEffect(() => console.error(error), [error])
  return (
    <div className="page">
      <p className={s.notice} role="alert">{t.store.error}</p>
      <button type="button" className={s.btn} style={{ marginTop: 16 }} onClick={reset}>↻</button>
    </div>
  )
}
