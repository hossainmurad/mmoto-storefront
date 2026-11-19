"use server"

import { refresh } from "next/cache"
import { cookies } from "next/headers"
import { CART_COOKIE, DEMO_CART_COOKIE, getCart, readDemoLines } from "../medusa/cart"
import { medusa, medusaConfigured } from "../medusa/client"
import { demoVariant } from "../medusa/demo"
import { getRegion } from "../medusa/region"

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
}

async function ensureCartId() {
  const existing = await getCart()
  if (existing) return existing.id
  const region = await getRegion()
  const { cart } = await medusa<{ cart: { id: string } }>("/store/carts", {
    method: "POST",
    body: region ? { region_id: region.id } : {},
  })
  ;(await cookies()).set(CART_COOKIE, cart.id, COOKIE_OPTS)
  return cart.id
}

/** Demo mode: set a line's quantity in the cookie cart (0 removes it). */
async function setDemoLine(variantId: string, quantity: number, add = false) {
  if (!demoVariant("en", variantId)) return { ok: false, error: "failed" }
  const lines = await readDemoLines()
  const current = lines.find((l) => l[0] === variantId)?.[1] ?? 0
  const next = Math.min(99, add ? current + quantity : quantity)
  const rest = lines.filter((l) => l[0] !== variantId)
  const updated = next > 0 ? (current ? lines.map((l) => (l[0] === variantId ? [variantId, next] : l)) : [...rest, [variantId, next]]) : rest
  ;(await cookies()).set(DEMO_CART_COOKIE, JSON.stringify(updated), COOKIE_OPTS)
  refresh()
  return { ok: true }
}

export type CartResult = { ok: boolean; error?: string }

export async function addToCart(variantId: string, quantity = 1): Promise<CartResult> {
  if (!medusaConfigured) return setDemoLine(variantId, quantity, true)
  try {
    const id = await ensureCartId()
    await medusa(`/store/carts/${id}/line-items`, { method: "POST", body: { variant_id: variantId, quantity } })
    refresh()
    return { ok: true }
  } catch (err) {
    console.error("[cart] add failed", err)
    return { ok: false, error: "failed" }
  }
}

export async function updateLineItem(lineId: string, quantity: number): Promise<CartResult> {
  if (!medusaConfigured) return setDemoLine(lineId, quantity)
  const cart = await getCart()
  if (!cart) return { ok: false, error: "no-cart" }
  try {
    if (quantity <= 0) await medusa(`/store/carts/${cart.id}/line-items/${lineId}`, { method: "DELETE" })
    else await medusa(`/store/carts/${cart.id}/line-items/${lineId}`, { method: "POST", body: { quantity } })
    refresh()
    return { ok: true }
  } catch (err) {
    console.error("[cart] update failed", err)
    return { ok: false, error: "failed" }
  }
}
