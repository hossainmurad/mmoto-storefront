/** Product shapes the UI renders. Safe to import in client components. */

export type Money = { amount: number; original: number; currency: string }

export type ShopVariant = {
  id: string
  title: string
  /** option id -> chosen value, e.g. { opt_size: "L" } */
  options: Record<string, string>
  price?: Money
  inStock: boolean
}

export type ShopProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
  description?: string
  images: string[]
  /**
   * title is the option's key (as in Medusa, e.g. "Size"); filters use it in the URL.
   * label is an optional display name in the current language.
   */
  options: { id: string; title: string; label?: string; values: string[] }[]
  variants: ShopVariant[]
  /** Lowest variant price. */
  price?: Money
  inStock: boolean
  /** Category ids the product is in. Only filled by listCategoryProductsForFilters. */
  categoryIds?: string[]
}

export const isOnSale = (m?: Money) => !!m && m.original > m.amount
