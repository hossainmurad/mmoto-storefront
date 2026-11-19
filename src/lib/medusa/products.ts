import "server-only"
import type { Locale } from "../i18n/config"
import type { Money, ShopProduct, ShopVariant } from "../shop-types"
import { medusa, medusaConfigured } from "./client"
import { demoGet, demoList } from "./demo"
import { getRegion } from "./region"

type MedusaPrice = { calculated_amount?: number | null; original_amount?: number | null; currency_code?: string | null }
type MedusaVariant = {
  id: string
  title?: string | null
  options?: { option_id?: string | null; value: string }[] | null
  calculated_price?: MedusaPrice | null
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
  inventory_quantity?: number | null
}
type MedusaProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
  images?: { url: string }[] | null
  options?: { id: string; title: string; values?: { value: string }[] | null }[] | null
  variants?: MedusaVariant[] | null
}

const LIST_FIELDS =
  "id,title,handle,thumbnail,metadata,variants.id,variants.title,*variants.calculated_price,+variants.inventory_quantity,variants.manage_inventory,variants.allow_backorder"
const DETAIL_FIELDS = `${LIST_FIELDS},description,*images,*options,*options.values,*variants.options`

/** Product data is cached for 5 minutes; revalidate the "products" tag from Medusa to refresh sooner. */
const CACHE = { revalidate: 300, tags: ["products"] }

function money(p?: MedusaPrice | null): Money | undefined {
  if (!p || p.calculated_amount == null || !p.currency_code) return undefined
  return { amount: p.calculated_amount, original: p.original_amount ?? p.calculated_amount, currency: p.currency_code }
}

function normalize(p: MedusaProduct, locale: Locale): ShopProduct {
  const meta = p.metadata ?? {}
  const localized = (key: string, base?: string | null) =>
    locale === "bn" && typeof meta[`${key}_bn`] === "string" ? (meta[`${key}_bn`] as string) : base ?? undefined

  const variants: ShopVariant[] = (p.variants ?? []).map((v) => ({
    id: v.id,
    title: v.title ?? "",
    options: Object.fromEntries((v.options ?? []).filter((o) => o.option_id).map((o) => [o.option_id!, o.value])),
    price: money(v.calculated_price),
    inStock: !v.manage_inventory || !!v.allow_backorder || v.inventory_quantity == null || v.inventory_quantity > 0,
  }))
  const priced = variants.filter((v) => v.price).sort((a, b) => a.price!.amount - b.price!.amount)
  const images = (p.images ?? []).map((i) => i.url)

  return {
    id: p.id,
    title: localized("title", p.title)!,
    handle: p.handle,
    thumbnail: p.thumbnail ?? images[0],
    description: localized("description", p.description),
    images: images.length ? images : p.thumbnail ? [p.thumbnail] : [],
    options: (p.options ?? []).map((o) => ({ id: o.id, title: o.title, values: (o.values ?? []).map((v) => v.value) })),
    variants,
    price: priced[0]?.price,
    inStock: variants.length === 0 || variants.some((v) => v.inStock),
  }
}

export type ProductQuery = {
  q?: string
  categoryId?: string[]
  collectionId?: string[]
  ids?: string[]
  limit?: number
  offset?: number
}

/** Lists products with prices for the store region. Uses the demo catalogue when Medusa is not set up. */
export async function listProducts(locale: Locale, query: ProductQuery = {}): Promise<{ products: ShopProduct[]; count: number }> {
  if (query.ids && query.ids.length === 0) return { products: [], count: 0 }
  if (!medusaConfigured) return demoList(locale, query)
  const region = await getRegion()
  const { products, count } = await medusa<{ products: MedusaProduct[]; count: number }>("/store/products", {
    query: {
      fields: LIST_FIELDS,
      region_id: region?.id,
      q: query.q,
      category_id: query.categoryId,
      collection_id: query.collectionId,
      id: query.ids,
      limit: query.limit ?? 24,
      offset: query.offset ?? 0,
      order: query.q ? undefined : "-created_at",
    },
    ...CACHE,
  })
  return { products: products.map((p) => normalize(p, locale)), count }
}

export async function getProduct(locale: Locale, handle: string): Promise<ShopProduct | null> {
  if (!medusaConfigured) return demoGet(locale, handle)
  const region = await getRegion()
  const { products } = await medusa<{ products: MedusaProduct[] }>("/store/products", {
    query: { handle, fields: DETAIL_FIELDS, region_id: region?.id, limit: 1 },
    ...CACHE,
  })
  return products[0] ? normalize(products[0], locale) : null
}

/** Products in the product collection with this handle (used for Deals: create a "deals" collection in Medusa). */
export async function listCollectionProducts(locale: Locale, handle: string, limit = 48) {
  if (!medusaConfigured) return demoList(locale, { deals: true, limit })
  const { collections } = await medusa<{ collections: { id: string }[] }>("/store/collections", {
    query: { handle, fields: "id", limit: 1 },
    ...CACHE,
  })
  if (!collections[0]) return { products: [] as ShopProduct[], count: 0 }
  return listProducts(locale, { collectionId: [collections[0].id], limit })
}
