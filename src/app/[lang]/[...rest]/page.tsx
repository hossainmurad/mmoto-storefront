import { notFound } from "next/navigation"

/** Any URL without a page shows the localized not-found page (with the site header). */
export default function CatchAll() {
  notFound()
}
