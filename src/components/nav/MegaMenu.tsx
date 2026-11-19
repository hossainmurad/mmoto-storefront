"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n/client"
import { fmt, num } from "@/lib/i18n/format"
import type { PageLink } from "@/lib/nav-config"
import { catName, categoryHref, type NavCategory } from "@/lib/nav-types"
import { Icon } from "./icons"
import s from "./nav.module.css"


const OPEN_DELAY = 120 // ms of hover before a panel opens (stops flicker when the mouse passes over)
const CLOSE_DELAY = 200 // ms grace period so the mouse can travel from the bar into the panel

/**
 * Desktop category bar (≥1024px) with one mega menu panel per top category.
 *
 * Pattern: "disclosure navigation" (not ARIA menu roles). Each top item is a
 * real link to the category page plus a separate toggle button, so:
 *  - mouse: hover opens the panel, click on the label navigates
 *  - keyboard: Tab to the toggle, Enter/Space/ArrowDown opens, Escape closes
 *  - touch tablets: tap the toggle to open
 */
export function MegaMenu({ categories, pages }: { categories: NavCategory[]; pages: PageLink[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const toggles = useRef<Record<string, HTMLButtonElement | null>>({})
  const pathname = usePathname()
  const baseId = useId()
  const focusFirst = useRef<string | null>(null)
  const { t, locale, href } = useI18n()
  const name = (c: NavCategory) => catName(c, locale)
  const link = (c: NavCategory) => categoryHref(c, locale)

  // After a keyboard open (ArrowDown), move focus to the first link in that panel.
  useEffect(() => {
    if (openId && focusFirst.current === openId) {
      focusFirst.current = null
      document.getElementById(`${baseId}-${openId}`)?.querySelector<HTMLAnchorElement>("a")?.focus()
    }
  }, [openId, baseId])

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  const schedule = (fn: () => void, ms: number) => {
    clear()
    timer.current = setTimeout(fn, ms)
  }
  const close = useCallback((focusId?: string) => {
    clear()
    setOpenId(null)
    if (focusId) toggles.current[focusId]?.focus()
  }, [])

  // Close on route change.
  useEffect(() => close(), [pathname, close])

  // Close on outside click.
  useEffect(() => {
    if (!openId) return
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [openId, close])

  // Escape also works when the panel was opened by hover (focus is not inside the bar).
  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(navRef.current?.contains(document.activeElement) ? openId : undefined)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [openId, close])

  useEffect(() => clear, [])

  const onToggleKey = (e: React.KeyboardEvent, c: NavCategory) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      focusFirst.current = c.id
      setOpenId(c.id)
    }
  }

  // Close when keyboard focus leaves the whole bar.
  const onBlur = (e: React.FocusEvent) => {
    if (openId && !navRef.current?.contains(e.relatedTarget as Node)) close()
  }

  return (
    <nav ref={navRef} className={s.catBar} aria-label={t.nav.shopByCategory} onBlur={onBlur}>
      <div className={`${s.wrap} ${s.catBarIn}`}>
        <ul className={s.catList}>
          {categories.map((c) => {
            const open = openId === c.id
            const panelId = `${baseId}-${c.id}`
            const active = pathname === link(c) || pathname.startsWith(`${link(c)}/`)
            const hasPanel = c.children.length > 0
            return (
              <li
                key={c.id}
                className={s.catItem}
                onMouseEnter={() => hasPanel && schedule(() => setOpenId(c.id), openId ? 0 : OPEN_DELAY)}
                onMouseLeave={() => schedule(() => setOpenId(null), CLOSE_DELAY)}
              >
                <div className={`${s.catTrigger} ${open ? s.isOpen : ""} ${active ? s.isActive : ""}`}>
                  <Link href={link(c)} aria-current={active ? "page" : undefined}>
                    {name(c)}
                  </Link>
                  {hasPanel && (
                    <button
                      ref={(el) => { toggles.current[c.id] = el }}
                      type="button"
                      className={s.catToggle}
                      aria-expanded={open}
                      aria-controls={panelId}
                      aria-label={fmt(t.nav.subcategories, { name: name(c) })}
                      onClick={() => (open ? close() : setOpenId(c.id))}
                      onKeyDown={(e) => onToggleKey(e, c)}
                    >
                      <Icon name="chevronDown" size={16} />
                    </button>
                  )}
                </div>

                {hasPanel && (
                  <div
                    id={panelId}
                    className={s.panel}
                    hidden={!open}
                    onMouseEnter={clear}
                  >
                    <div className={`${s.wrap} ${s.panelIn}`}>
                      <div className={s.panelMain}>
                        <div className={s.panelHead}>
                          <p className={s.panelTitle}>{name(c)}</p>
                          <Link href={link(c)} className={s.panelAll}>
                            {fmt(t.nav.shopAll, { name: name(c) })} <Icon name="arrowRight" size={16} />
                          </Link>
                        </div>
                        <ul className={s.subGrid}>
                          {c.children.map((sub) => (
                            <li key={sub.id} className={s.subItem}>
                              <Link href={link(sub)} className={sub.children.length ? s.subHead : s.subLink}>
                                {name(sub)}
                              </Link>
                              {sub.children.length > 0 && (
                                <ul>
                                  {sub.children.map((leaf) => (
                                    <li key={leaf.id}>
                                      <Link href={link(leaf)} className={s.leafLink}>{name(leaf)}</Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link href={link(c)} className={s.promo}>
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.image} alt="" className={s.promoImg} />
                        ) : (
                          <span className={s.promoMark} aria-hidden="true" />
                        )}
                        <span className={s.promoText}>
                          <span className={s.promoKicker}>{fmt(t.nav.categoriesCount, { n: num(locale, c.children.length) })}</span>
                          <span className={s.promoTitle}>{name(c)}</span>
                          <span className={s.promoCta}>{t.nav.shopNow} <Icon name="arrowRight" size={16} /></span>
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <ul className={s.pageList}>
          {pages.map((p) => (
            <li key={p.href}>
              <Link
                href={href(p.href)}
                className={`${s.pageLink} ${p.accent ? s.accent : ""}`}
                aria-current={pathname === href(p.href) ? "page" : undefined}
              >
                {t.nav[p.key]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {openId && <div className={s.scrim} aria-hidden="true" onMouseEnter={() => schedule(() => setOpenId(null), 60)} />}
    </nav>
  )
}
