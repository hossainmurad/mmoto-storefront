"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Icon } from "@/components/nav/icons"
import { useI18n } from "@/lib/i18n/client"
import { fmt, num } from "@/lib/i18n/format"
import { COUNTS_EVENT, LIST_MAX, readList, toggleInList, type ListName } from "@/lib/lists"
import s from "./shop.module.css"

/**
 * Heart (wishlist) or compare toggle for a product. State lives in a cookie
 * (see src/lib/lists.ts), so it survives reloads and the wishlist / compare
 * pages can render it on the server. `refreshPage` re-renders the current page
 * after a change (used on the wishlist and compare pages themselves).
 */
export function ListToggle({ list, productId, refreshPage = false }: { list: ListName; productId: string; refreshPage?: boolean }) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [on, setOn] = useState(false)

  useEffect(() => {
    const sync = () => setOn(readList(list).includes(productId))
    sync()
    window.addEventListener(COUNTS_EVENT, sync)
    return () => window.removeEventListener(COUNTS_EVENT, sync)
  }, [list, productId])

  const label =
    list === "wishlist"
      ? on ? t.product.removeFromWishlist : t.product.addToWishlist
      : on ? t.product.removeFromCompare : t.product.addToCompare

  return (
    <button
      type="button"
      className={s.iconToggle}
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => {
        const res = toggleInList(list, productId)
        if (res === "full") {
          alert(fmt(t.product.compareFull, { n: num(locale, LIST_MAX[list]) }))
          return
        }
        setOn(res)
        if (refreshPage) router.refresh()
      }}
    >
      <Icon name={list === "wishlist" ? "heart" : "compare"} size={20} />
    </button>
  )
}
