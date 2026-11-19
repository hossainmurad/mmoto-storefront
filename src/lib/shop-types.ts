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
  options: { id: string; title: string; values: string[] }[]
  variants: ShopVariant[]
  /** Lowest variant price. */
  price?: Money
  inStock: boolean
}

export const isOnSale = (m?: Money) => !!m && m.original > m.amount
