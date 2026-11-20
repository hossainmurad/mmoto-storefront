"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { filtersToQuery, type Filters } from "@/lib/filters"
import { useBrowserPathname } from "@/lib/i18n/client"

/**
 * Puts filters in the URL (page resets to 1) with router.replace and no scroll
 * jump. The server renders the filtered list; `pending` is true until it arrives.
 */
export function useApplyFilters() {
  const router = useRouter()
  const pathname = useBrowserPathname()
  const [pending, start] = useTransition()
  const apply = (f: Filters) => start(() => router.replace(pathname + filtersToQuery(f), { scroll: false }))
  return { apply, pending }
}
