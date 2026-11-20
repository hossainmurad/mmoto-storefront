"use client"

import { useEffect, useState } from "react"
import { activeCount, clearFilters, filtersToQuery, type Facets, type Filters } from "@/lib/filters"
import { useI18n } from "@/lib/i18n/client"
import { FilterGroups } from "./FilterGroups"
import f from "./filters.module.css"
import { useApplyFilters } from "./useApplyFilters"

/**
 * Desktop filter column (1024px and up; hidden below by CSS). Every change is
 * applied straight away. The local copy updates instantly so checkboxes don't
 * wait for the server round trip.
 */
export function FilterSidebar({ facets, filters }: { facets: Facets; filters: Filters }) {
  const { t } = useI18n()
  const { apply } = useApplyFilters()
  const [value, setValue] = useState(filters)
  const key = filtersToQuery(filters)

  // Follow the URL (back button, chip removal, mobile drawer).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setValue(filters), [key])

  const change = (next: Filters) => {
    setValue(next)
    apply(next)
  }

  return (
    <aside className={f.sidebar} aria-labelledby="filters-side-title">
      <div className={f.sideHead}>
        <h2 id="filters-side-title" className={f.sideTitle}>{t.filters.filters}</h2>
        {activeCount(value) > 0 && (
          <button type="button" className={f.clear} onClick={() => change(clearFilters(value))}>
            {t.filters.clearAll}
          </button>
        )}
      </div>
      <FilterGroups facets={facets} value={value} onChange={change} openByDefault={() => true} idPrefix="side" />
    </aside>
  )
}
