"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n/client"
import { fmt, num } from "@/lib/i18n/format"
import type { PageLink } from "@/lib/nav-config"
import { catName, categoryHref, type NavCategory } from "@/lib/nav-types"
import { Icon } from "./icons"
import { LangSwitch } from "./LangSwitch"
import s from "./nav.module.css"

/**
 * Mobile / tablet menu (<1024px): a slide-in drawer with drill-down levels.
 * Tap a category to see its subcategories, "Back" to go up. Works for any
 * depth of Medusa category tree.
 *
 * Accessibility: modal dialog, focus moves in on open and back to the menu
 * button on close, Tab is trapped inside, Escape closes, page scroll locked.
 */
export function MobileMenu({
  categories,
  pages,
  hotline,
}: {
  categories: NavCategory[]
  pages: PageLink[]
  hotline: { label: string; href: string }
}) {
  const { t, locale, href } = useI18n()
  const [open, setOpen] = useState(false)
  const [stack, setStack] = useState<NavCategory[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const pathname = usePathname()

  const current = stack[stack.length - 1]
  const items = current ? current.children : categories
  const name = (c: NavCategory) => catName(c, locale)

  const close = () => {
    setOpen(false)
    openerRef.current?.focus()
  }

  // Close on navigation.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Reset level when closed, lock scroll while open.
  useEffect(() => {
    if (!open) {
      setStack([])
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Move focus to the level heading when drilling in or out, so screen readers announce it.
  useEffect(() => {
    if (open && stack.length) headingRef.current?.focus()
  }, [stack, open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      if (stack.length) setStack(stack.slice(0, -1))
      else close()
      return
    }
    if (e.key !== "Tab" || !panelRef.current) return
    const f = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex="0"]',
    )
    if (!f.length) return
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className={`${s.iconBtn} ${s.menuBtn}`}
        aria-label={t.nav.openMenu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" />
      </button>

      <div className={s.drawerRoot} data-open={open} hidden={!open}>
        <div className={s.drawerScrim} onClick={close} aria-hidden="true" />
        <div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.menu}
          className={s.drawer}
          onKeyDown={onKeyDown}
        >
          <div className={s.drawerTop}>
            {current ? (
              <button type="button" className={s.backBtn} onClick={() => setStack(stack.slice(0, -1))}>
                <Icon name="chevronLeft" size={20} />
                {stack.length > 1 ? name(stack[stack.length - 2]) : t.nav.allCategories}
              </button>
            ) : (
              <Link href={href("/")} className={s.drawerLogo} onClick={close}>
                <span className={s.logoMark} aria-hidden="true" />
                MMOTO
              </Link>
            )}
            <button type="button" className={s.closeBtn} aria-label={t.nav.closeMenu} onClick={close} data-autofocus>
              <Icon name="close" />
            </button>
          </div>

          <div className={s.drawerBody}>
            <h2 ref={headingRef} tabIndex={-1} className={s.drawerHeading}>
              {current ? name(current) : t.nav.shopByCategory}
            </h2>

            <ul className={s.drawerList}>
              {current && (
                <li>
                  <Link href={categoryHref(current, locale)} className={`${s.drawerLink} ${s.drawerAll}`} onClick={close}>
                    {fmt(t.nav.shopAll, { name: name(current) })}
                    <Icon name="arrowRight" size={18} />
                  </Link>
                </li>
              )}
              {items.map((c) => (
                <li key={c.id}>
                  {c.children.length ? (
                    <button type="button" className={s.drawerLink} onClick={() => setStack([...stack, c])}>
                      <span>{name(c)}</span>
                      <span className={s.drawerCount}>
                        {num(locale, c.children.length)}
                        <Icon name="chevronRight" size={18} />
                      </span>
                    </button>
                  ) : (
                    <Link href={categoryHref(c, locale)} className={s.drawerLink} onClick={close}>
                      {name(c)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {!current && (
              <>
                <ul className={`${s.drawerList} ${s.drawerPages}`}>
                  {pages.map((p) => (
                    <li key={p.href}>
                      <Link href={href(p.href)} className={`${s.drawerLink} ${p.accent ? s.accentText : ""}`} onClick={close}>
                        {t.nav[p.key]}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className={s.drawerAccount}>
                  <Link href={href("/account")} className={s.drawerChip} onClick={close}><Icon name="user" size={20} /> {t.nav.account}</Link>
                  <Link href={href("/wishlist")} className={s.drawerChip} onClick={close}><Icon name="heart" size={20} /> {t.nav.wishlist}</Link>
                  <Link href={href("/compare")} className={s.drawerChip} onClick={close}><Icon name="compare" size={20} /> {t.nav.compare}</Link>
                  <Link href={href("/account/garage")} className={s.drawerChip} onClick={close}><Icon name="bike" size={20} /> {t.nav.garage}</Link>
                </div>
                <div className={s.drawerFoot}>
                  <a href={hotline.href} className={s.drawerHotline}>
                    <Icon name="phone" size={18} /> {t.nav.needHelp} {hotline.label}
                  </a>
                  <LangSwitch className={s.drawerLang} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
