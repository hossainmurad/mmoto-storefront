"use client"

import { useRef, useState } from "react"
import { Icon } from "@/components/nav/icons"
import { activeCount, type Facets, type FilterItem, type Filters } from "@/lib/filters"
import { useI18n } from "@/lib/i18n/client"
import { fmt, num } from "@/lib/i18n/format"
import { FilterDrawer } from "./FilterDrawer"
import f from "./filters.module.css"
import { SortSelect } from "./SortSelect"
import { useApplyFilters } from "./useApplyFilters"

/**
 * Bar above the grid: "Filters" button with the active count (mobile only,
 * opens the drawer) and the sort select (all sizes).
 */
export function FilterToolbar({ facets, filters, items }: { facets: Facets; filters: Filters; items: FilterItem[] }) {
  const { t, locale } = useI18n()
  const { apply } = useApplyFilters()
  const [open, setOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  const n = activeCount(filters)

  const close = () => {
    setOpen(false)
    openerRef.current?.focus()
  }

  return (
    <div className={f.toolbar}>
      <button
        ref={openerRef}
        type="button"
        className={f.filtersBtn}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={n ? fmt(t.filters.filtersActive, { n: num(locale, n) }) : t.filters.filters}
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" size={18} />
        {t.filters.filters}
        {n > 0 && <span className={f.badge} aria-hidden="true">{num(locale, n)}</span>}
      </button>
      <SortSelect filters={filters} />
      {open && (
        <FilterDrawer
          facets={facets}
          filters={filters}
          items={items}
          onClose={close}
          onApply={(next) => {
            apply(next)
            close()
          }}
        />
      )}
    </div>
  )
}
