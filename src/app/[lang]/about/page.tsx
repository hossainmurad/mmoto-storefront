import Link from "next/link"
import s from "@/components/shop/shop.module.css"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.about.title }
}

/** About text lives in the dictionaries (about.body) so both languages stay in step. */
export default async function AboutPage() {
  const { t, href } = await getI18n()
  return (
    <div className={`page ${s.article}`}>
      <h1 className="title">{t.about.title}</h1>
      {t.about.body.map((p, i) => <p key={i}>{p}</p>)}
      <p>
        <Link href={href("/")} className={s.btn}>{t.about.cta}</Link>
      </p>
    </div>
  )
}
