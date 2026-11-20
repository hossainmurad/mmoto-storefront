/**
 * Product filters for listing pages (category now; search and deals later).
 * Pure functions, safe on the server and in the browser, so the drawer's
 * "Show N products" uses exactly the same matching as the page.
 *
 * URL format (all optional):
 *   ?min=1000&max=9000&cat=full-face,modular&opt.Size=M,L&opt.Color=Black&stock=1&sale=1&sort=price-asc&page=2
 */
import { isOnSale, type ShopProduct } from "./shop-types"

export const SORTS = ["newest", "price-asc", "price-desc", "sale"] as const
export type Sort = (typeof SORTS)[number]

export type Filters = {
  min?: number
  max?: number
  /** subcategory handles */
  cat: string[]
  /** option title -> selected values, e.g. { Size: ["M", "L"] } */
  opt: Record<string, string[]>
  stock: boolean
  sale: boolean
  sort: Sort
}

export const NO_FILTERS: Filters = { cat: [], opt: {}, stock: false, sale: false, sort: "newest" }

/** Price slider bounds are rounded out to this step. */
export const PRICE_STEP = 100

type SearchParams = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const list = (v: string | string[] | undefined) =>
  [...new Set((first(v) ?? "").split(",").map((s) => s.trim()).filter(Boolean))]
const amount = (v: string | string[] | undefined) => {
  const s = first(v)
  if (!s) return undefined
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined
}

export function parseFilters(sp: SearchParams): Filters {
  const opt: Record<string, string[]> = {}
  for (const [k, v] of Object.entries(sp)) {
    if (!k.startsWith("opt.") || k.length <= 4) continue
    const values = list(v)
    if (values.length) opt[k.slice(4)] = values
  }
  const sort = first(sp.sort)
  return {
    min: amount(sp.min),
    max: amount(sp.max),
    cat: list(sp.cat),
    opt,
    stock: first(sp.stock) === "1",
    sale: first(sp.sale) === "1",
    sort: (SORTS as readonly string[]).includes(sort ?? "") ? (sort as Sort) : "newest",
  }
}

/** Query string for these filters ("" when nothing is set). Page 1 is left out. */
export function filtersToQuery(f: Filters, page = 1) {
  const join = (vals: string[]) => vals.map(encodeURIComponent).join(",")
  const parts: string[] = []
  if (f.min !== undefined) parts.push(`min=${f.min}`)
  if (f.max !== undefined) parts.push(`max=${f.max}`)
  if (f.cat.length) parts.push(`cat=${join(f.cat)}`)
  for (const k of Object.keys(f.opt).sort()) {
    if (f.opt[k].length) parts.push(`${encodeURIComponent(`opt.${k}`)}=${join(f.opt[k])}`)
  }
  if (f.stock) parts.push("stock=1")
  if (f.sale) parts.push("sale=1")
  if (f.sort !== "newest") parts.push(`sort=${f.sort}`)
  if (page > 1) parts.push(`page=${page}`)
  return parts.length ? `?${parts.join("&")}` : ""
}

/** Number of active filters (sort doesn't count). A price range counts as one. */
export function activeCount(f: Filters) {
  return (
    (f.min !== undefined || f.max !== undefined ? 1 : 0) +
    f.cat.length +
    Object.values(f.opt).reduce((n, v) => n + v.length, 0) +
    (f.stock ? 1 : 0) +
    (f.sale ? 1 : 0)
  )
}

export const clearFilters = (f: Filters): Filters => ({ ...NO_FILTERS, sort: f.sort })

export function toggleValue(values: string[], v: string) {
  return values.includes(v) ? values.filter((x) => x !== v) : [...values, v]
}

// ---- matching ----

/** What filtering needs to know about one product. Small enough to send to the browser. */
export type FilterItem = {
  price: number | null
  /** handles of the subcategories it belongs to */
  cats: string[]
  /** option title -> values it comes in */
  opts: Record<string, string[]>
  stock: boolean
  sale: boolean
}

export type Subcategory = { handle: string; label: string; ids: string[] }

export function toFilterItem(p: ShopProduct, subcats: Subcategory[]): FilterItem {
  const opts: Record<string, string[]> = {}
  for (const o of p.options) {
    const fromVariants = p.variants.map((v) => v.options[o.id]).filter((v): v is string => !!v)
    opts[o.title] = [...new Set(fromVariants.length ? fromVariants : o.values)]
  }
  return {
    price: p.price?.amount ?? null,
    cats: subcats.filter((s) => p.categoryIds?.some((id) => s.ids.includes(id))).map((s) => s.handle),
    opts,
    stock: p.inStock,
    sale: isOnSale(p.price),
  }
}

export function matches(item: FilterItem, f: Filters) {
  if (f.min !== undefined && (item.price === null || item.price < f.min)) return false
  if (f.max !== undefined && (item.price === null || item.price > f.max)) return false
  if (f.cat.length && !item.cats.some((c) => f.cat.includes(c))) return false
  for (const [title, vals] of Object.entries(f.opt)) {
    if (vals.length && !(item.opts[title] ?? []).some((v) => vals.includes(v))) return false
  }
  if (f.stock && !item.stock) return false
  if (f.sale && !item.sale) return false
  return true
}

/**
 * Filters and sorts. `products` must be in newest-first order (as fetched);
 * that order is kept for "newest" and as the tie-breaker for the others.
 */
export function applyFilters<T>(products: T[], items: FilterItem[], f: Filters): T[] {
  const idx = products.map((_, i) => i).filter((i) => matches(items[i], f))
  const price = (i: number) => items[i].price
  const cmp: Record<Sort, (a: number, b: number) => number> = {
    newest: (a, b) => a - b,
    "price-asc": (a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity) || a - b,
    "price-desc": (a, b) => (price(b) ?? -Infinity) - (price(a) ?? -Infinity) || a - b,
    sale: (a, b) => Number(items[b].sale) - Number(items[a].sale) || a - b,
  }
  return idx.sort(cmp[f.sort]).map((i) => products[i])
}

// ---- facets ----

export type Facets = {
  /** price slider bounds, rounded out to PRICE_STEP; null when no product has a price */
  bounds: { min: number; max: number } | null
  cats: { handle: string; label: string; count: number }[]
  options: { title: string; label: string; values: { value: string; count: number }[] }[]
  stock: number
  sale: number
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "5XL"]

/** Letter sizes first (in size order), then numbers (numerically), then everything else alphabetically. */
function compareValues(a: string, b: string) {
  const rank = (v: string) => (SIZE_ORDER.includes(v.toUpperCase()) ? 0 : Number.isNaN(Number(v)) ? 2 : 1)
  const ra = rank(a)
  const rb = rank(b)
  if (ra !== rb) return ra - rb
  if (ra === 0) return SIZE_ORDER.indexOf(a.toUpperCase()) - SIZE_ORDER.indexOf(b.toUpperCase())
  if (ra === 1) return Number(a) - Number(b)
  return a.localeCompare(b)
}

/**
 * Counts for every filter option, from the category's full product list
 * (not narrowed by the other active filters).
 */
export function buildFacets(products: ShopProduct[], items: FilterItem[], subcats: Subcategory[]): Facets {
  const prices = items.map((i) => i.price).filter((p): p is number => p !== null)
  const bounds = prices.length
    ? {
        min: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
        max: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
      }
    : null
  if (bounds && bounds.max === bounds.min) bounds.max += PRICE_STEP

  const labels = new Map<string, string>()
  const counts = new Map<string, Map<string, number>>()
  products.forEach((p, i) => {
    for (const o of p.options) if (!labels.has(o.title)) labels.set(o.title, o.label ?? o.title)
    for (const [title, values] of Object.entries(items[i].opts)) {
      const m = counts.get(title) ?? new Map<string, number>()
      for (const v of values) m.set(v, (m.get(v) ?? 0) + 1)
      counts.set(title, m)
    }
  })

  return {
    bounds,
    cats: subcats.map((s) => ({ handle: s.handle, label: s.label, count: items.filter((i) => i.cats.includes(s.handle)).length })),
    options: [...counts.entries()].map(([title, m]) => ({
      title,
      label: labels.get(title) ?? title,
      values: [...m.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => compareValues(a.value, b.value)),
    })),
    stock: items.filter((i) => i.stock).length,
    sale: items.filter((i) => i.sale).length,
  }
}
