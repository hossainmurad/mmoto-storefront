import "server-only"
import { cookies } from "next/headers"
import type { Locale } from "./i18n/config"
import { LIST_COOKIE, parseList, type ListName } from "./lists"
import { listProducts } from "./medusa/products"

/** Products saved in the wishlist or compare cookie, in the order they were added. */
export async function getListProducts(name: ListName, locale: Locale) {
  const ids = parseList((await cookies()).get(LIST_COOKIE[name])?.value)
  if (!ids.length) return []
  const { products } = await listProducts(locale, { ids, limit: ids.length })
  return ids.map((id) => products.find((p) => p.id === id)).filter((p) => !!p)
}
