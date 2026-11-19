"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n/client"
import { fmt, num } from "@/lib/i18n/format"
import { COUNTS_EVENT, readList } from "@/lib/lists"
import { Icon } from "./icons"
import s from "./nav.module.css"

type Counts = { cart: number; wishlist: number; compare: number }

/**
 * Account, wishlist, compare and cart buttons with live counts.
 * Wishlist and compare come from cookies in the browser; the cart count from
 * /api/cart-count. They refresh on load and whenever COUNTS_EVENT fires
 * (after add to cart, or a wishlist / compare change).
 */
export function HeaderIcons() {
  const { t, locale, href } = useI18n()
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      const lists = { wishlist: readList("wishlist").length, compare: readList("compare").length }
      setCounts((c) => ({ cart: c?.cart ?? 0, ...lists }))
      try {
        const res = await fetch("/api/cart-count", { cache: "no-store" })
        const { cart } = (await res.json()) as { cart: number }
        if (alive) setCounts((c) => ({ ...(c ?? { wishlist: 0, compare: 0 }), cart }))
      } catch {
        /* keep the last known count */
      }
    }
    load()
    window.addEventListener(COUNTS_EVENT, load)
    return () => {
      alive = false
      window.removeEventListener(COUNTS_EVENT, load)
    }
  }, [])

  const label = (name: string, n: number) => fmt(t.nav.countLabel, { label: name, n: num(locale, n) })
  const badge = (n: number | undefined) =>
    n ? <span className={s.badge} aria-hidden="true">{num(locale, n)}</span> : null

  return (
    <nav aria-label={t.nav.accountNav} className={s.icons}>
      <Link href={href("/account")} className={`${s.iconBtn} ${s.hideMobile}`} aria-label={t.nav.account}>
        <Icon name="user" />
      </Link>
      <Link href={href("/wishlist")} className={`${s.iconBtn} ${s.hideMobile}`} aria-label={label(t.nav.wishlist, counts?.wishlist ?? 0)}>
        <Icon name="heart" />
        {badge(counts?.wishlist)}
      </Link>
      <Link href={href("/compare")} className={`${s.iconBtn} ${s.hideMobile}`} aria-label={label(t.nav.compare, counts?.compare ?? 0)}>
        <Icon name="compare" />
        {badge(counts?.compare)}
      </Link>
      <Link href={href("/cart")} className={s.iconBtn} aria-label={label(t.nav.cart, counts?.cart ?? 0)}>
        <Icon name="cart" />
        {badge(counts?.cart)}
      </Link>
    </nav>
  )
}
