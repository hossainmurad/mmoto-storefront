import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import s from "./shop.module.css"

/** Shown where products would be when Medusa isn't configured yet. */
export function NotConnected({ t }: { t: Dictionary }) {
  return (
    <div className={s.notice} role="note">
      <strong>{t.store.notConnectedTitle}</strong>
      {t.store.notConnectedBody}
    </div>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className={s.empty}>{children}</div>
}
