import "server-only"
import { medusa, medusaConfigured } from "./client"

type Region = { id: string; name: string; currency_code: string }

/**
 * The region prices are calculated for. Uses MEDUSA_REGION_ID if set,
 * otherwise the first region in BDT, otherwise the first region.
 */
export async function getRegion(): Promise<Region | null> {
  if (!medusaConfigured) return null
  try {
    const { regions } = await medusa<{ regions: Region[] }>("/store/regions", {
      query: { fields: "id,name,currency_code", limit: 50 },
      revalidate: 3600,
      tags: ["regions"],
    })
    const wanted = process.env.MEDUSA_REGION_ID
    return (
      regions.find((r) => r.id === wanted) ??
      regions.find((r) => r.currency_code?.toLowerCase() === "bdt") ??
      regions[0] ??
      null
    )
  } catch (err) {
    console.error("[medusa] Could not load regions.", err)
    return null
  }
}
