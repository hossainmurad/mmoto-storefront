import { NextResponse } from "next/server"
import { cartCount, getCart } from "@/lib/medusa/cart"

/**
 * Number of items in the visitor's cart, for the header badge. Loaded by the
 * browser after the page renders, so the pages themselves stay static.
 */
export async function GET() {
  try {
    return NextResponse.json({ cart: cartCount(await getCart()) }, { headers: { "cache-control": "no-store" } })
  } catch (err) {
    console.error("[cart-count]", err)
    return NextResponse.json({ cart: 0 }, { headers: { "cache-control": "no-store" } })
  }
}
