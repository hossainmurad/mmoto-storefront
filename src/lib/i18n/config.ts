/**
 * Languages. English lives at the plain URLs (/categories/helmets), Bangla
 * under /bn (/bn/categories/helmets). src/proxy.ts rewrites the plain URLs
 * to /en internally so every page sits under app/[lang].
 * Safe to import from client components.
 */
export const LOCALES = ["en", "bn"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

export const LOCALE_LABEL: Record<Locale, string> = { en: "English", bn: "বাংলা" }
/** Used for Intl number/price formatting. en-IN groups like Bangla (45,12,000), as is usual in Bangladesh. */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-IN", bn: "bn-BD" }

export const isLocale = (v: string | undefined): v is Locale => !!v && (LOCALES as readonly string[]).includes(v)

/** Adds the locale prefix to an app path: ("bn", "/cart") -> "/bn/cart"; English stays unprefixed. */
export function localePath(locale: Locale, path: string) {
  if (locale === DEFAULT_LOCALE) return path
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

/** Removes a locale prefix from a browser path: "/bn/cart" -> "/cart". */
export function stripLocale(pathname: string) {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/"
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1)
  }
  return pathname
}
