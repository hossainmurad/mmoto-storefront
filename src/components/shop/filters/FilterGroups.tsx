"use client"

import { useId, useState } from "react"
import { Icon } from "@/components/nav/icons"
import { toggleValue, type Facets, type Filters } from "@/lib/filters"
import { useI18n } from "@/lib/i18n/client"
import { num } from "@/lib/i18n/format"
import f from "./filters.module.css"
import { PriceRange } from "./PriceRange"

/** Values shown per attribute group before "Show more". */
const VISIBLE_VALUES = 6
/** Above this many subcategories the Category group gets a search box. */
const FIND_THRESHOLD = 8

export type GroupId = "price" | "category" | "status" | `opt:${string}`

/** One collapsible filter group: a fieldset whose legend holds the toggle button. */
function Group({ title, defaultOpen, children }: { title: string; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()
  return (
    <fieldset className={f.group}>
      <legend className={f.legend}>
        <button type="button" className={f.groupBtn} aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(!open)}>
          {title}
          <Icon name="chevronDown" size={18} />
        </button>
      </legend>
      <div id={bodyId} className={f.groupBody} hidden={!open}>
        {children}
      </div>
    </fieldset>
  )
}

function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  const { locale } = useI18n()
  return (
    <li>
      <label className={f.check}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className={f.checkLabel}>{label}</span>
        <span className={f.count} aria-hidden="true">{num(locale, count)}</span>
        <span className={f.srOnly}>({num(locale, count)})</span>
      </label>
    </li>
  )
}

/** Attribute values with "Show more" after the first few (selected values always show). */
function OptionList({ title, values, selected, onToggle }: {
  title: string
  values: { value: string; count: number }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  const { t } = useI18n()
  const shown = values.filter((v) => v.count > 0 || selected.includes(v.value))
  const hiddenSelected = shown.slice(VISIBLE_VALUES).some((v) => selected.includes(v.value))
  const [expanded, setExpanded] = useState(hiddenSelected)
  const visible = expanded ? shown : shown.slice(0, VISIBLE_VALUES)
  return (
    <>
      <ul className={f.options}>
        {visible.map((v) => (
          <Check key={v.value} label={v.value} count={v.count} checked={selected.includes(v.value)} onChange={() => onToggle(v.value)} />
        ))}
      </ul>
      {shown.length > VISIBLE_VALUES && (
        <button type="button" className={f.more} aria-expanded={expanded} onClick={() => setExpanded(!expanded)} aria-label={`${expanded ? t.filters.showLess : t.filters.showMore}: ${title}`}>
          {expanded ? t.filters.showLess : t.filters.showMore}
        </button>
      )}
    </>
  )
}

function CategoryList({ cats, selected, onToggle, idPrefix }: {
  cats: Facets["cats"]
  selected: string[]
  onToggle: (handle: string) => void
  idPrefix: string
}) {
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const shown = cats.filter((c) => c.count > 0 || selected.includes(c.handle))
  const needle = query.trim().toLocaleLowerCase()
  const visible = needle ? shown.filter((c) => c.label.toLocaleLowerCase().includes(needle)) : shown
  return (
    <>
      {shown.length > FIND_THRESHOLD && (
        <>
          <label htmlFor={`${idPrefix}-findcat`} className={f.srOnly}>{t.filters.findCategory}</label>
          <input
            id={`${idPrefix}-findcat`}
            type="search"
            className={f.find}
            placeholder={t.filters.findCategory}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </>
      )}
      <ul className={f.options}>
        {visible.map((c) => (
          <Check key={c.handle} label={c.label} count={c.count} checked={selected.includes(c.handle)} onChange={() => onToggle(c.handle)} />
        ))}
      </ul>
    </>
  )
}

/**
 * All filter groups, top to bottom: price, category, attributes, product status.
 * Controlled: `value` is the current selection and `onChange` gets the next one.
 * The sidebar applies changes straight away; the drawer keeps them until "Show N products".
 */
export function FilterGroups({ facets, value, onChange, openByDefault, idPrefix }: {
  facets: Facets
  value: Filters
  onChange: (next: Filters) => void
  openByDefault: (id: GroupId) => boolean
  /** keeps input ids unique when the sidebar and drawer are both on the page */
  idPrefix: string
}) {
  const { t } = useI18n()
  const cats = facets.cats.filter((c) => c.count > 0 || value.cat.includes(c.handle))

  return (
    <div>
      {facets.bounds && (
        <Group title={t.filters.filterByPrice} defaultOpen={openByDefault("price")}>
          <PriceRange
            bounds={facets.bounds}
            min={value.min}
            max={value.max}
            idPrefix={`${idPrefix}-price`}
            onCommit={(min, max) => {
              if (min !== value.min || max !== value.max) onChange({ ...value, min, max })
            }}
          />
        </Group>
      )}

      {cats.length > 0 && (
        <Group title={t.filters.filterByCategory} defaultOpen={openByDefault("category")}>
          <CategoryList
            cats={facets.cats}
            selected={value.cat}
            idPrefix={idPrefix}
            onToggle={(h) => onChange({ ...value, cat: toggleValue(value.cat, h) })}
          />
        </Group>
      )}

      {facets.options.map((o) => (
        <Group key={o.title} title={o.label} defaultOpen={openByDefault(`opt:${o.title}`)}>
          <OptionList
            title={o.label}
            values={o.values}
            selected={value.opt[o.title] ?? []}
            onToggle={(v) => {
              const next = toggleValue(value.opt[o.title] ?? [], v)
              const opt = { ...value.opt, [o.title]: next }
              if (!next.length) delete opt[o.title]
              onChange({ ...value, opt })
            }}
          />
        </Group>
      ))}

      {(facets.stock > 0 || facets.sale > 0 || value.stock || value.sale) && (
        <Group title={t.filters.productStatus} defaultOpen={openByDefault("status")}>
          <ul className={f.options}>
            {(facets.stock > 0 || value.stock) && (
              <Check label={t.filters.inStock} count={facets.stock} checked={value.stock} onChange={() => onChange({ ...value, stock: !value.stock })} />
            )}
            {(facets.sale > 0 || value.sale) && (
              <Check label={t.filters.onSale} count={facets.sale} checked={value.sale} onChange={() => onChange({ ...value, sale: !value.sale })} />
            )}
          </ul>
        </Group>
      )}
    </div>
  )
}
