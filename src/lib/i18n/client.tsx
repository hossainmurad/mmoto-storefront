"use client"

import { createContext, useContext, useMemo } from "react"
import { localePath, type Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

const Ctx = createContext<{ locale: Locale; t: Dictionary } | null>(null)

/** Set once in the root layout so client components can read the locale and text. */
export function I18nProvider({ locale, t, children }: { locale: Locale; t: Dictionary; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t }), [locale, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useI18n must be used inside <I18nProvider>")
  return { ...v, href: (path: string) => localePath(v.locale, path) }
}
