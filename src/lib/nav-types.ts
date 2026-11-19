import { localePath, type Locale } from "./i18n/config"

/** One node of the category tree the navigation renders. Safe to import in client components. */
export type NavCategory = {
  id: string
  name: string
  /** Bangla name, from category metadata.name_bn in Medusa. Falls back to name. */
  nameBn?: string
  handle: string
  /** Full URL path segments from the root, e.g. ["motorcycle-parts", "exhaust"]. */
  path: string[]
  /** Optional promo image for the mega menu, from category metadata.nav_image. */
  image?: string
  children: NavCategory[]
}

export function categoryHref(c: Pick<NavCategory, "path">, locale: Locale = "en") {
  return localePath(locale, `/categories/${c.path.join("/")}`)
}

export function catName(c: Pick<NavCategory, "name" | "nameBn">, locale: Locale) {
  return locale === "bn" && c.nameBn ? c.nameBn : c.name
}
