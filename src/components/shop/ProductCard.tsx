import Link from "next/link"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localePath, type Locale } from "@/lib/i18n/config"
import { isOnSale, type ShopProduct } from "@/lib/shop-types"
import { ListToggle } from "./ListToggle"
import { Price } from "./Price"
import s from "./shop.module.css"

type CardProps = {
  p: ShopProduct
  locale: Locale
  t: Dictionary
  priority?: boolean
  /** Re-render the page after a wishlist/compare toggle (on the wishlist page, so removed items disappear). */
  refreshOnToggle?: boolean
}

export function ProductCard({ p, locale, t, priority = false, refreshOnToggle = false }: CardProps) {
  return (
    <article className={s.card}>
      <div className={s.cardImg}>
        {p.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.thumbnail} alt="" loading={priority ? "eager" : "lazy"} />
        ) : (
          <span className={s.noImg} aria-hidden="true">MMOTO</span>
        )}
        {!p.inStock ? (
          <span className={`${s.tag} ${s.tagMuted}`}>{t.product.outOfStock}</span>
        ) : isOnSale(p.price) ? (
          <span className={s.tag}>{t.product.sale}</span>
        ) : null}
      </div>
      <div className={s.cardActions}>
        <ListToggle list="wishlist" productId={p.id} refreshPage={refreshOnToggle} />
        <ListToggle list="compare" productId={p.id} />
      </div>
      <div className={s.cardBody}>
        <Link href={localePath(locale, `/products/${p.handle}`)} className={s.cardTitle}>{p.title}</Link>
        <Price money={p.price} locale={locale} noPrice={t.product.noPrice} />
      </div>
    </article>
  )
}

export function ProductGrid({ products, className = "", ...rest }: { products: ShopProduct[]; className?: string } & Omit<CardProps, "p" | "priority">) {
  return (
    <ul className={`${s.grid} ${className}`}>
      {products.map((p, i) => (
        <li key={p.id}><ProductCard p={p} {...rest} priority={i < 4} /></li>
      ))}
    </ul>
  )
}
