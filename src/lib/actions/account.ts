"use server"

import { refresh } from "next/cache"
import { cookies } from "next/headers"
import { CART_COOKIE } from "../medusa/cart"
import { medusa, medusaConfigured } from "../medusa/client"
import { AUTH_COOKIE } from "../medusa/customer"

/** Error keys map to text in dictionary.account (loginFailed, registerFailed, missing, shortPassword). */
export type AuthState = { error?: "loginFailed" | "registerFailed" | "missing" | "shortPassword" } | null

const field = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim()

async function signIn(email: string, password: string) {
  const { token } = await medusa<{ token: string }>("/auth/customer/emailpass", {
    method: "POST",
    body: { email, password },
  })
  const jar = await cookies()
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  // Attach the guest cart to the customer so it follows them across devices.
  const cartId = jar.get(CART_COOKIE)?.value
  if (cartId) {
    await medusa(`/store/carts/${cartId}/customer`, { method: "POST", token }).catch(() => {})
  }
}

export async function login(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = field(fd, "email")
  const password = String(fd.get("password") ?? "")
  if (!email || !password) return { error: "missing" }
  if (!medusaConfigured) return { error: "loginFailed" }
  try {
    await signIn(email, password)
  } catch {
    return { error: "loginFailed" }
  }
  refresh()
  return null
}

export async function register(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = field(fd, "email")
  const password = String(fd.get("password") ?? "")
  const first_name = field(fd, "first_name")
  const last_name = field(fd, "last_name")
  if (!email || !password || !first_name) return { error: "missing" }
  if (password.length < 8) return { error: "shortPassword" }
  if (!medusaConfigured) return { error: "registerFailed" }
  try {
    // 1. Create the login identity. 2. Create the customer with that token. 3. Sign in for a full token.
    const { token } = await medusa<{ token: string }>("/auth/customer/emailpass/register", {
      method: "POST",
      body: { email, password },
    })
    await medusa("/store/customers", { method: "POST", token, body: { email, first_name, last_name } })
    await signIn(email, password)
  } catch (err) {
    console.error("[account] register failed", err)
    return { error: "registerFailed" }
  }
  refresh()
  return null
}

export async function logout() {
  ;(await cookies()).delete(AUTH_COOKIE)
  refresh()
}
