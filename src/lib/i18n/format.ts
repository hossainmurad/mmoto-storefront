import { INTL_LOCALE, type Locale } from "./config"

/** Fills {placeholders}: fmt("Shop all {name}", { name: "Helmets" }). */
export function fmt(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}

/** Digits in the reader's script (Bangla numerals for bn). */
export function num(locale: Locale, n: number) {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(n)
}

/**
 * Medusa v2 stores amounts in the main currency unit (1500 = ৳1,500), not cents.
 * BDT prices show without decimals; other currencies keep theirs.
 */
export function price(locale: Locale, amount: number, currency: string) {
  const code = currency.toUpperCase()
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: code === "BDT" ? 0 : 2,
  }).format(amount)
}

export function date(locale: Locale, iso: string) {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: "medium" }).format(new Date(iso))
}
