import "server-only"
import { cookies } from "next/headers"
import { medusa, medusaConfigured, MedusaError } from "./client"

/** Customer login token (JWT from Medusa /auth). httpOnly, so page scripts can't read it. */
export const AUTH_COOKIE = "_medusa_jwt"

export type Customer = { id: string; email: string; first_name?: string | null; last_name?: string | null }
export type Order = {
  id: string
  display_id?: number | null
  created_at: string
  status: string
  fulfillment_status?: string | null
  total: number
  currency_code: string
  items?: { id: string; title: string; quantity: number }[] | null
}

export async function getAuthToken() {
  return (await cookies()).get(AUTH_COOKIE)?.value
}

/** The signed-in customer, or null (signed out, token expired, or Medusa not configured). */
export async function getCustomer(): Promise<Customer | null> {
  if (!medusaConfigured) return null
  const token = await getAuthToken()
  if (!token) return null
  try {
    const { customer } = await medusa<{ customer: Customer }>("/store/customers/me", {
      token,
      query: { fields: "id,email,first_name,last_name" },
    })
    return customer
  } catch (err) {
    if (err instanceof MedusaError && (err.status === 401 || err.status === 404)) return null
    throw err
  }
}

export async function getOrders(): Promise<Order[]> {
  const token = await getAuthToken()
  if (!medusaConfigured || !token) return []
  const { orders } = await medusa<{ orders: Order[] }>("/store/orders", {
    token,
    query: {
      fields: "id,display_id,created_at,status,fulfillment_status,total,currency_code,*items",
      order: "-created_at",
      limit: 20,
    },
  })
  return orders
}
