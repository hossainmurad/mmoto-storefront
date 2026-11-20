"use client"

import { Icon } from "@/components/nav/icons"
import { clearFilters, type Facets, type Filters } from "@/lib/filters"
import { useI18n } from "@/lib/i18n/client"
import { fmt, num } from "@/lib/i18n/format"
import f from "./filters.module.css"
import { useApplyFilters } from "./useApplyFilters"

type Chip = { key: string; label: string; without: Filters }

/**
 * Result count (announced to screen readers when it changes) and one removable
 * chip per active filter, plus "Clear all".
 */
export function ActiveFilters({ filters, facets, count }: { filters: Filters; facets: Facets; count: number }) {
  const { t, locale } = useI18n()
  const { apply, pending } = useApplyFilters()

  const chips: Chip[] = []
  if (filters.min !== undefined || filters.max !== undefined) {
    const lo = filters.min ?? facets.bounds?.min ?? 0
    // A minimum above every price (e.g. an old link) shouldn't read as "৳ 99,000 – ৳ 9,800".
    const hi = filters.max ?? Math.max(facets.bounds?.max ?? 0, lo)
    chips.push({ key: "price", label: `৳ ${num(locale, lo)} – ৳ ${num(locale, hi)}`, without: { ...filters, min: undefined, max: undefined } })
  }
  for (const h of filters.cat) {
    const label = facets.cats.find((c) => c.handle === h)?.label ?? h
    chips.push({ key: `cat:${h}`, label, without: { ...filters, cat: filters.cat.filter((x) => x !== h) } })
  }
  for (const [title, vals] of Object.entries(filters.opt)) {
    const name = facets.options.find((o) => o.title === title)?.label ?? title
    for (const v of vals) {
      const rest = vals.filter((x) => x !== v)
      const opt = { ...filters.opt, [title]: rest }
      if (!rest.length) delete opt[title]
      chips.push({ key: `opt:${title}:${v}`, label: `${name} ${v}`, without: { ...filters, opt } })
    }
  }
  if (filters.stock) chips.push({ key: "stock", label: t.filters.inStock, without: { ...filters, stock: false } })
  if (filters.sale) chips.push({ key: "sale", label: t.filters.onSale, without: { ...filters, sale: false } })

  return (
    <div className={f.summary}>
      <p className={`${f.resultCount} ${pending ? f.pending : ""}`} role="status" aria-live="polite">
        {count === 1 ? t.category.countOne : fmt(t.category.count, { n: num(locale, count) })}
      </p>
      {chips.length > 0 && (
        <>
          <ul className={f.chips} aria-label={t.filters.activeFilters}>
            {chips.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  className={f.chip}
                  aria-label={fmt(t.filters.removeFilter, { name: c.label })}
                  onClick={() => apply(c.without)}
                >
                  {c.label}
                  <Icon name="close" size={14} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={f.clear} onClick={() => apply(clearFilters(filters))}>
            {t.filters.clearAll}
          </button>
        </>
      )}
    </div>
  )
}

/** Shown instead of an empty grid when the filters exclude everything. */
export function NoMatch({ filters }: { filters: Filters }) {
  const { t } = useI18n()
  const { apply } = useApplyFilters()
  return (
    <div className={f.empty}>
      <p>{t.filters.noMatch}</p>
      <button type="button" className={f.emptyBtn} onClick={() => apply(clearFilters(filters))}>
        {t.filters.clearAll}
      </button>
    </div>
  )
}
