"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Icon } from "@/components/nav/icons"
import { clearFilters, matches, type Facets, type FilterItem, type Filters } from "@/lib/filters"
import { useI18n } from "@/lib/i18n/client"
import { fmt, num } from "@/lib/i18n/format"
import { FilterGroups } from "./FilterGroups"
import f from "./filters.module.css"

/**
 * Mobile filters (below 1024px): a modal dialog sliding in from the left.
 * Changes stay local until "Show N products"; closing discards them.
 * N is counted in the browser from `items` with the same matching the server uses.
 *
 * Accessibility: focus moves in on open and back to the opener on close,
 * Tab is trapped, Escape closes, page scroll is locked.
 */
export function FilterDrawer({ facets, filters, items, onApply, onClose }: {
  facets: Facets
  filters: Filters
  items: FilterItem[]
  onApply: (f: Filters) => void
  onClose: () => void
}) {
  const { t, locale } = useI18n()
  const [value, setValue] = useState(filters)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const count = useMemo(() => items.filter((i) => matches(i, value)).length, [items, value])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== "Tab" || !panelRef.current) return
    const els = [...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, select")].filter(
      (el) => el.offsetParent !== null,
    )
    if (!els.length) return
    const first = els[0]
    const last = els[els.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className={f.drawerRoot}>
      <div className={f.scrim} onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className={f.drawer} onKeyDown={onKeyDown}>
        <div className={f.drawerTop}>
          <h2 id={titleId} className={f.drawerTitle}>{t.filters.filters}</h2>
          <button type="button" className={f.closeBtn} aria-label={t.filters.closeFilters} onClick={onClose} data-autofocus>
            <Icon name="close" />
          </button>
        </div>
        <div className={f.drawerBody}>
          <FilterGroups
            facets={facets}
            value={value}
            onChange={setValue}
            openByDefault={(id) => id === "price" || id === "status"}
            idPrefix="drawer"
          />
        </div>
        <div className={f.drawerFoot}>
          <button type="button" className={f.clear} onClick={() => setValue(clearFilters(value))}>
            {t.filters.clearAll}
          </button>
          <button type="button" className={f.showBtn} onClick={() => onApply(value)}>
            {fmt(t.filters.showProducts, { n: num(locale, count) })}
          </button>
        </div>
      </div>
    </div>
  )
}
