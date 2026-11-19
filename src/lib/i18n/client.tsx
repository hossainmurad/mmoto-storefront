"use client"

import { usePathname } from "next/navigation"
import { createContext, useContext, useMemo } from "react"
import { DEFAULT_LOCALE, localePath, type Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

const Ctx = createContext<{ locale: Locale; t: Dictionary } | null>(null)

/** Set once in the root layout so client components can read the locale and text. */
export function I18nProvider({ locale, t, children }: { locale: Locale; t: Dictionary; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t }), [locale, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/**
 * usePathname() without the internal /en prefix. English pages are served at
 * plain URLs through a rewrite (src/proxy.ts), so on the server usePathname()
 * returns "/en/deals" while the browser sees "/deals". Rendering with the raw
 * value causes hydration mismatches; this returns "/deals" in both places.
 * Bangla paths ("/bn/deals") are the same on both sides and stay as they are.
 */
export function useBrowserPathname() {
  const p = usePathname()
  const prefix = `/${DEFAULT_LOCALE}`
  if (p === prefix) return "/"
  return p.startsWith(`${prefix}/`) ? p.slice(prefix.length) : p
}

export function useI18n() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useI18n must be used inside <I18nProvider>")
  return { ...v, href: (path: string) => localePath(v.locale, path) }
}
