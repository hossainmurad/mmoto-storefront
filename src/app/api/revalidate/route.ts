import { revalidateTag } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Call this from a Medusa subscriber on product-category.created/updated/deleted:
 *   POST /api/revalidate?tag=categories   header: x-revalidate-secret: <REVALIDATE_SECRET>
 * so menu changes made in Medusa Admin show up without waiting for the 1 hour cache.
 */
export async function POST(req: NextRequest) {
  if (!process.env.REVALIDATE_SECRET || req.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const tag = req.nextUrl.searchParams.get("tag") ?? "categories"
  revalidateTag(tag, "max")
  return NextResponse.json({ ok: true, tag })
}
