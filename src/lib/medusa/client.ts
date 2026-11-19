import "server-only"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

/** True when the backend URL and publishable key are set. Pages show a "not connected" note otherwise. */
export const medusaConfigured = !!(BACKEND_URL && PUBLISHABLE_KEY)

export class MedusaError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

type Query = Record<string, string | number | boolean | undefined | null | (string | number)[]>

type Options = {
  method?: "GET" | "POST" | "DELETE"
  query?: Query
  body?: unknown
  /** Customer JWT for /store/customers/me, /store/orders and so on. */
  token?: string
  /** Cache the response (seconds) and tag it. Leave out for uncached (cart, customer). */
  revalidate?: number
  tags?: string[]
}

function toSearch(query: Query = {}) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue
    if (Array.isArray(v)) v.forEach((x) => p.append(`${k}[]`, String(x)))
    else p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ""
}

/** Calls the Medusa v2 Store API (or /auth). Throws MedusaError on a non-2xx response. */
export async function medusa<T>(path: string, opts: Options = {}): Promise<T> {
  if (!medusaConfigured) throw new MedusaError(503, "Medusa is not configured")
  const headers: Record<string, string> = { "x-publishable-api-key": PUBLISHABLE_KEY! }
  if (opts.body !== undefined) headers["content-type"] = "application/json"
  if (opts.token) headers.authorization = `Bearer ${opts.token}`

  const cached = opts.revalidate !== undefined && !opts.token && (opts.method ?? "GET") === "GET"
  const res = await fetch(`${BACKEND_URL}${path}${toSearch(opts.query)}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    ...(cached ? { next: { revalidate: opts.revalidate, tags: opts.tags } } : { cache: "no-store" as const }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new MedusaError(res.status, `Medusa ${opts.method ?? "GET"} ${path} -> ${res.status} ${text.slice(0, 200)}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
