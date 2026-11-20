import { PAGE_SIZE, Pager } from "@/components/shop/Pager"
import { ProductGrid } from "@/components/shop/ProductCard"
import {
  activeCount,
  applyFilters,
  buildFacets,
  filtersToQuery,
  toFilterItem,
  type Filters,
  type Subcategory,
} from "@/lib/filters"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { ShopProduct } from "@/lib/shop-types"
import { ActiveFilters, NoMatch } from "./ActiveFilters"
import { FilterSidebar } from "./FilterSidebar"
import { FilterToolbar } from "./FilterToolbar"
import f from "./filters.module.css"

/**
 * A filterable product listing: sidebar (desktop) or drawer (mobile), sort,
 * active filter chips, grid and pager. Server component: give it every product
 * of the listing (newest first) and the parsed URL filters; it filters, sorts
 * and paginates here. Reusable for category, search and deals pages.
 */
export function FilteredProducts({ products, subcategories = [], filters, page, basePath, locale, t }: {
  products: ShopProduct[]
  /** direct subcategories for the Category group (empty hides it) */
  subcategories?: Subcategory[]
  filters: Filters
  page: number
  /** the listing's URL without query, e.g. /bn/categories/helmets */
  basePath: string
  locale: Locale
  t: Dictionary
}) {
  const items = products.map((p) => toFilterItem(p, subcategories))
  const facets = buildFacets(products, items, subcategories)
  const results = applyFilters(products, items, filters)
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const shown = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  return (
    <div className={f.layout}>
      <FilterSidebar facets={facets} filters={filters} />
      <div className={f.main}>
        <FilterToolbar facets={facets} filters={filters} items={items} />
        <ActiveFilters filters={filters} facets={facets} count={results.length} />
        {shown.length ? (
          <>
            <ProductGrid products={shown} locale={locale} t={t} className={f.grid} />
            <Pager
              page={current}
              total={pages}
              hrefFor={(n) => basePath + filtersToQuery(filters, n)}
              locale={locale}
              t={t}
            />
          </>
        ) : activeCount(filters) > 0 ? (
          <NoMatch filters={filters} />
        ) : (
          <div className={f.empty}><p>{t.category.empty}</p></div>
        )}
      </div>
    </div>
  )
}
