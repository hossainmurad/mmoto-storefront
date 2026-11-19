import "server-only"
import { FALLBACK_CATEGORIES } from "../nav-config"

import type { NavCategory } from "../nav-types"
export type { NavCategory }

type MedusaCategory = {
  id: string
  name: string
  handle: string
  rank?: number | null
  metadata?: Record<string, unknown> | null
  category_children?: MedusaCategory[]
}

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

function toNav(c: MedusaCategory, parentPath: string[] = []): NavCategory {
  const path = [...parentPath, c.handle]
  const children = [...(c.category_children ?? [])]
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((child) => toNav(child, path))
  const image = typeof c.metadata?.nav_image === "string" ? (c.metadata.nav_image as string) : undefined
  const nameBn = typeof c.metadata?.name_bn === "string" ? (c.metadata.name_bn as string) : undefined
  return { id: c.id, name: c.name, nameBn, handle: c.handle, path, image, children }
}

/**
 * Loads the whole category tree in one request (top-level categories with all
 * descendants) and caches it for an hour. Revalidate on demand with the
 * "categories" tag from a Medusa webhook / subscriber when categories change.
 *
 * Falls back to the static tree in nav-config.ts when Medusa is not configured
 * or unreachable, so the header never breaks.
 */
export async function getCategoryTree(): Promise<NavCategory[]> {
  if (!BACKEND_URL || !PUBLISHABLE_KEY) return FALLBACK_CATEGORIES

  const params = new URLSearchParams({
    parent_category_id: "null",
    include_descendants_tree: "true",
    fields: "id,name,handle,rank,metadata,*category_children",
    limit: "100",
  })

  try {
    const res = await fetch(`${BACKEND_URL}/store/product-categories?${params}`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      next: { revalidate: 3600, tags: ["categories"] },
    })
    if (!res.ok) throw new Error(`Medusa responded ${res.status}`)
    const data = (await res.json()) as { product_categories: MedusaCategory[] }
    const tree = data.product_categories
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((c) => toNav(c))
    return tree.length ? tree : FALLBACK_CATEGORIES
  } catch (err) {
    console.error("[nav] Could not load categories from Medusa, using fallback.", err)
    return FALLBACK_CATEGORIES
  }
}

/** Finds a category by its URL path, e.g. ["motorcycle-parts", "motorcycle-exhaust"]. */
export function findByPath(tree: NavCategory[], path: string[]): NavCategory[] | null {
  const trail: NavCategory[] = []
  let level = tree
  for (const handle of path) {
    const hit = level.find((c) => c.handle === handle)
    if (!hit) return null
    trail.push(hit)
    level = hit.children
  }
  return trail
}
