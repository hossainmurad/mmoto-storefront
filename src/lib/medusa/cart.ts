import "server-only"
import { cookies } from "next/headers"
import type { Locale } from "../i18n/config"
import { medusa, medusaConfigured, MedusaError } from "./client"
import { demoVariant } from "./demo"

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

/** Demo mode (no Medusa): cart lines live in this cookie as [[variantId, qty], ...]. */
export const DEMO_CART_COOKIE = "mm_demo_cart"

export async function readDemoLines(): Promise<[string, number][]> {
  try {
    const v = JSON.parse((await cookies()).get(DEMO_CART_COOKIE)?.value ?? "[]")
    return Array.isArray(v) ? v.filter((l) => typeof l[0] === "string" && Number.isInteger(l[1]) && l[1] > 0) : []
  } catch {
    return []
  }
}

async function getDemoCart(locale: Locale): Promise<Cart | null> {
  const items: CartItem[] = []
  for (const [variantId, quantity] of await readDemoLines()) {
    const hit = demoVariant(locale, variantId)
    if (!hit?.variant.price) continue
    const unit = hit.variant.price.amount
    items.push({
      id: variantId,
      title: hit.product.title,
      quantity,
      unit_price: unit,
      total: unit * quantity,
      product_handle: hit.product.handle,
      variant_title: hit.variant.title,
    })
  }
  return items.length ? { id: "demo", currency_code: "bdt", items, item_subtotal: items.reduce((n, i) => n + i.total!, 0) } : null
}

/** The visitor's cart, or null when there is none (or it was completed / deleted in Medusa). */
export async function getCart(locale: Locale = "en"): Promise<Cart | null> {
  if (!medusaConfigured) return getDemoCart(locale)
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
