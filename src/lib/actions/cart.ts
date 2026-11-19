"use server"

import { refresh } from "next/cache"
import { cookies } from "next/headers"
import { CART_COOKIE, getCart } from "../medusa/cart"
import { medusa, medusaConfigured } from "../medusa/client"
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

export type CartResult = { ok: boolean; error?: string }

export async function addToCart(variantId: string, quantity = 1): Promise<CartResult> {
  if (!medusaConfigured) return { ok: false, error: "not-configured" }
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
