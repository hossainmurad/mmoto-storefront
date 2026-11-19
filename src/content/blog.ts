import type { Locale } from "@/lib/i18n/config"

/**
 * Blog posts. Add a post by appending to POSTS; it appears on /blog and at
 * /blog/<slug> (and /bn/blog/<slug>). Each paragraph is one string in body.
 * Bangla is optional per post: missing Bangla text falls back to English.
 * When posts outgrow this file, move them to a CMS and keep getPosts/getPost.
 */
export type Post = {
  slug: string
  /** ISO date, e.g. "2026-12-01" */
  date: string
  title: Partial<Record<Locale, string>> & { en: string }
  excerpt: Partial<Record<Locale, string>> & { en: string }
  body: Partial<Record<Locale, string[]>> & { en: string[] }
}

const POSTS: Post[] = [
  // {
  //   slug: "how-to-choose-a-helmet-size",
  //   date: "2026-12-01",
  //   title: { en: "How to choose the right helmet size", bn: "সঠিক হেলমেট সাইজ কীভাবে বাছবেন" },
  //   excerpt: { en: "Measure your head in two minutes…" },
  //   body: { en: ["First paragraph…", "Second paragraph…"] },
  // },
]

export function getPosts() {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug) ?? null
}

export const pick = <T,>(v: Partial<Record<Locale, T>> & { en: T }, locale: Locale): T => v[locale] ?? v.en
