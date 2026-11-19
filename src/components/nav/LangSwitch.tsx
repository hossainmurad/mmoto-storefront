"use client"

import { usePathname, useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/client"
import { localePath, stripLocale, type Locale } from "@/lib/i18n/config"
import s from "./nav.module.css"

/** Switches between English and Bangla on the same page, keeping the query (e.g. ?q=). */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const other: Locale = locale === "en" ? "bn" : "en"
  const target = localePath(other, stripLocale(pathname))

  return (
    <a
      href={target}
      lang={other}
      hrefLang={other}
      className={`${s.langSwitch} ${className}`}
      onClick={(e) => {
        e.preventDefault()
        router.push(target + location.search)
      }}
    >
      <span className={s.srOnly}>{t.nav.language}: </span>
      {t.nav.switchTo}
    </a>
  )
}
