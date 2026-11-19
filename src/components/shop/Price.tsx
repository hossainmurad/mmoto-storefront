import type { Locale } from "@/lib/i18n/config"
import { price } from "@/lib/i18n/format"
import { isOnSale, type Money } from "@/lib/shop-types"
import s from "./shop.module.css"

/** Price with the original struck through when on sale. Works in server and client components. */
export function Price({ money, locale, noPrice, className = "" }: { money?: Money; locale: Locale; noPrice: string; className?: string }) {
  if (!money) return <span className={`${s.price} ${className}`}>{noPrice}</span>
  const sale = isOnSale(money)
  return (
    <span className={`${s.price} ${className}`}>
      <span className={sale ? s.nowSale : s.now}>{price(locale, money.amount, money.currency)}</span>
      {sale && <s className={s.was}>{price(locale, money.original, money.currency)}</s>}
    </span>
  )
}
