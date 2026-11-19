import Link from "next/link"
import { notFound } from "next/navigation"
import { BuyBox } from "@/components/shop/BuyBox"
import { Gallery } from "@/components/shop/Gallery"
import s from "@/components/shop/shop.module.css"
import { getI18n } from "@/lib/i18n/server"
import { getProduct } from "@/lib/medusa/products"

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props) {
  const { handle } = await params
  const { locale } = await getI18n()
  const p = await getProduct(locale, handle).catch(() => null)
  if (!p) return { title: "Product" }
  return {
    title: p.title,
    description: p.description?.slice(0, 160),
    openGraph: p.thumbnail ? { images: [p.thumbnail] } : undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const [{ handle }, { locale, t, href }] = await Promise.all([params, getI18n()])
  const product = await getProduct(locale, handle)
  if (!product) notFound()

  return (
    <div className="page">
      <nav className="crumb" aria-label={t.nav.breadcrumb}>
        <Link href={href("/")}>{t.nav.home}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.title}</span>
      </nav>
      <div className={s.pdp}>
        <Gallery images={product.images} alt={product.title} />
        <div className={s.buy}>
          <h1 className="title" style={{ fontSize: "clamp(36px, 6vw, 56px)" }}>{product.title}</h1>
          <BuyBox product={product} />
          {product.description && (
            <section aria-labelledby="desc">
              <h2 id="desc" className={s.h2} style={{ fontSize: 26, marginBottom: 8 }}>{t.product.description}</h2>
              <p className={s.prose}>{product.description}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
