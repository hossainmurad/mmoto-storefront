import Link from "next/link"
import { Empty } from "@/components/shop/Notice"
import s from "@/components/shop/shop.module.css"
import { getPosts, pick } from "@/content/blog"
import { date } from "@/lib/i18n/format"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.blog.title, description: t.blog.intro }
}

export default async function BlogPage() {
  const { locale, t, href } = await getI18n()
  const posts = getPosts()
  return (
    <div className="page">
      <h1 className="title">{t.blog.title}</h1>
      <p className={s.lead}>{t.blog.intro}</p>
      {posts.length ? (
        <ul className={s.posts}>
          {posts.map((p) => (
            <li key={p.slug} className={s.post}>
              <p className={s.meta}><time dateTime={p.date}>{date(locale, p.date)}</time></p>
              <Link href={href(`/blog/${p.slug}`)}>{pick(p.title, locale)}</Link>
              <p style={{ marginTop: 8 }}>{pick(p.excerpt, locale)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{t.blog.empty}</Empty>
      )}
    </div>
  )
}
