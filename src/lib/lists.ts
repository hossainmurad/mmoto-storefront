/**
 * Wishlist and compare lists: product ids kept in plain cookies, so the
 * browser can update them instantly and the server can render the pages.
 * Saved per device. (To sync wishlists to accounts, store them in customer
 * metadata in Medusa later.)
 */
export type ListName = "wishlist" | "compare"

export const LIST_COOKIE: Record<ListName, string> = { wishlist: "mm_wishlist", compare: "mm_compare" }
export const LIST_MAX: Record<ListName, number> = { wishlist: 100, compare: 4 }
/** Fired on window whenever a list or the cart changes, so header counts update. */
export const COUNTS_EVENT = "mm:counts"

export function parseList(value: string | undefined) {
  return (value ?? "").split(",").map((s) => s.trim()).filter((s) => /^[\w-]+$/.test(s))
}

// ---- browser only ----

export function readList(name: ListName): string[] {
  if (typeof document === "undefined") return []
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${LIST_COOKIE[name]}=`))
  return parseList(hit ? decodeURIComponent(hit.split("=")[1]) : undefined)
}

export function writeList(name: ListName, ids: string[]) {
  const secure = location.protocol === "https:" ? "; secure" : ""
  document.cookie = `${LIST_COOKIE[name]}=${encodeURIComponent(ids.join(","))}; path=/; max-age=31536000; samesite=lax${secure}`
  window.dispatchEvent(new Event(COUNTS_EVENT))
}

/** Adds or removes a product. Returns the new state, or "full" when the list is at its limit. */
export function toggleInList(name: ListName, id: string): boolean | "full" {
  const ids = readList(name)
  if (ids.includes(id)) {
    writeList(name, ids.filter((x) => x !== id))
    return false
  }
  if (ids.length >= LIST_MAX[name]) return "full"
  writeList(name, [...ids, id])
  return true
}
