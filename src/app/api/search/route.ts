import { NextResponse, type NextRequest } from "next/server"
import { isLocale, localePath } from "@/lib/i18n/config"
import { price } from "@/lib/i18n/format"
import { getCategoryTree } from "@/lib/medusa/categories"
import { listProducts } from "@/lib/medusa/products"
import { catName, categoryHref, type NavCategory } from "@/lib/nav-types"

export type Suggestions = {
  categories: { id: string; label: string; parent?: string; href: string }[]
  products: { id: string; title: string; href: string; thumbnail?: string; price?: string }[]
}

/** Search suggestions for the header box: GET /api/search?q=helmet&lang=en */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80)
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en"
  const locale = isLocale(langParam) ? langParam : "en"
  const empty: Suggestions = { categories: [], products: [] }
  if (q.length < 2) return NextResponse.json(empty)

  const needle = q.toLocaleLowerCase()
  const tree = await getCategoryTree()
  const categories: Suggestions["categories"] = []
  const walk = (list: NavCategory[], parent?: NavCategory) => {
    for (const c of list) {
      if ([c.name, c.nameBn].some((n) => n?.toLocaleLowerCase().includes(needle))) {
        categories.push({
          id: c.id,
          label: catName(c, locale),
          parent: parent ? catName(parent, locale) : undefined,
          href: categoryHref(c, locale),
        })
      }
      walk(c.children, c)
    }
  }
  walk(tree)

  let products: Suggestions["products"] = []
  try {
    const res = await listProducts(locale, { q, limit: 5 })
    products = res.products.map((p) => ({
      id: p.id,
      title: p.title,
      href: localePath(locale, `/products/${p.handle}`),
      thumbnail: p.thumbnail,
      price: p.price ? price(locale, p.price.amount, p.price.currency) : undefined,
    }))
  } catch (err) {
    console.error("[search] product suggestions failed", err)
  }

  return NextResponse.json({ categories: categories.slice(0, 4), products } satisfies Suggestions)
}
