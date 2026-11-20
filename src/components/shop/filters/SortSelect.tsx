"use client"

import type { Filters, Sort } from "@/lib/filters"
import { useI18n } from "@/lib/i18n/client"
import f from "./filters.module.css"
import { useApplyFilters } from "./useApplyFilters"

/** Sort order. Applies immediately on every screen size. */
export function SortSelect({ filters }: { filters: Filters }) {
  const { t } = useI18n()
  const { apply } = useApplyFilters()
  const options: { value: Sort; label: string }[] = [
    { value: "newest", label: t.filters.sortNewest },
    { value: "price-asc", label: t.filters.sortPriceAsc },
    { value: "price-desc", label: t.filters.sortPriceDesc },
    { value: "sale", label: t.filters.sortSale },
  ]
  return (
    <label className={f.sort}>
      {t.filters.sortBy}
      <select value={filters.sort} onChange={(e) => apply({ ...filters, sort: e.target.value as Sort })}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}
