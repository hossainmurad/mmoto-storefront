import "server-only"
import { cookies } from "next/headers"
import { medusa, medusaConfigured, MedusaError } from "./client"

/** Same cookie name as the official Medusa Next.js starter, so carts carry over. */
export const CART_COOKIE = "_medusa_cart_id"

export type CartItem = {
  id: string
  title: string
  subtitle?: string | null
  thumbnail?: string | null
  quantity: number
  unit_price: number
  total?: number | null
  product_handle?: string | null
  variant_title?: string | null
}
export type Cart = {
  id: string
  currency_code: string
  items: CartItem[]
  subtotal?: number | null
  item_subtotal?: number | null
}

const CART_FIELDS =
  "id,currency_code,subtotal,item_subtotal,*items,items.product_handle,items.variant_title,items.thumbnail,items.total"

/** The visitor's cart, or null when there is none (or it was completed / deleted in Medusa). */
export async function getCart(): Promise<Cart | null> {
  if (!medusaConfigured) return null
  const id = (await cookies()).get(CART_COOKIE)?.value
  if (!id) return null
  try {
    const { cart } = await medusa<{ cart: Cart }>(`/store/carts/${id}`, { query: { fields: CART_FIELDS } })
    return cart
  } catch (err) {
    if (err instanceof MedusaError && err.status === 404) return null
    throw err
  }
}

export const cartCount = (cart: Cart | null) => cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0
