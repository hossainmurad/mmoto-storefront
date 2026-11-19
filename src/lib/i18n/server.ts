import { notFound } from "next/navigation"
import { lang } from "next/root-params"
import { isLocale, localePath, type Locale } from "./config"
import bn from "./dictionaries/bn"
import en from "./dictionaries/en"

const DICTS = { en, bn }

/** Current locale from the [lang] root segment. Server Components only. */
export async function getLocale(): Promise<Locale> {
  const l = await lang()
  if (!isLocale(l)) notFound()
  return l
}

/** Locale, its dictionary and a link helper, in one call for pages. */
export async function getI18n() {
  const locale = await getLocale()
  return { locale, t: DICTS[locale], href: (path: string) => localePath(locale, path) }
}

export function dictFor(locale: Locale) {
  return DICTS[locale]
}
