import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { fmt, num } from "@/lib/i18n/format"
import s from "./shop.module.css"

/** Previous / next links. `hrefFor(page)` builds the URL for a page number. */
export function Pager({ page, total, hrefFor, locale, t }: {
  page: number
  total: number
  hrefFor: (page: number) => string
  locale: Locale
  t: Dictionary
}) {
  if (total <= 1) return null
  return (
    <nav className={s.pager} aria-label={fmt(t.search.page, { n: num(locale, page), total: num(locale, total) })}>
      {page > 1 ? <Link href={hrefFor(page - 1)} rel="prev">← {t.search.prev}</Link> : <span />}
      <span className={s.meta}>{fmt(t.search.page, { n: num(locale, page), total: num(locale, total) })}</span>
      {page < total ? <Link href={hrefFor(page + 1)} rel="next">{t.search.next} →</Link> : <span />}
    </nav>
  )
}

export const PAGE_SIZE = 24

export function pageFrom(v: string | string[] | undefined) {
  const n = Number(Array.isArray(v) ? v[0] : v)
  return Number.isInteger(n) && n > 0 ? n : 1
}
