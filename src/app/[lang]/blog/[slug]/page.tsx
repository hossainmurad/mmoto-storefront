import Link from "next/link"
import { notFound } from "next/navigation"
import s from "@/components/shop/shop.module.css"
import { getPost, pick } from "@/content/blog"
import { date } from "@/lib/i18n/format"
import { getI18n } from "@/lib/i18n/server"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const { locale } = await getI18n()
  const post = getPost(slug)
  return post ? { title: pick(post.title, locale), description: pick(post.excerpt, locale) } : {}
}

export default async function PostPage({ params }: Props) {
  const [{ slug }, { locale, t, href }] = await Promise.all([params, getI18n()])
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <article className={`page ${s.article}`}>
      <nav className="crumb" aria-label={t.nav.breadcrumb}>
        <Link href={href("/blog")}>{t.blog.back}</Link>
      </nav>
      <h1 className="title">{pick(post.title, locale)}</h1>
      <p className={s.meta} style={{ marginTop: 12 }}><time dateTime={post.date}>{date(locale, post.date)}</time></p>
      {pick(post.body, locale).map((para, i) => <p key={i}>{para}</p>)}
    </article>
  )
}
