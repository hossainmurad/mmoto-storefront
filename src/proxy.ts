import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config"

/**
 * Language routing. Every page lives under app/[lang]:
 *  - /bn/...      Bangla, served as is
 *  - /en/...      redirected to the plain URL so English has one address
 *  - anything else is English: rewritten to /en/... internally (the URL stays plain)
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const first = pathname.split("/")[1]

  if (first === DEFAULT_LOCALE) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/"
    return NextResponse.redirect(url, 308)
  }
  if ((LOCALES as readonly string[]).includes(first)) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip API routes, Next internals and files with an extension (favicon.ico, images).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
