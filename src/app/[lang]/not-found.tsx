import Link from "next/link"
import s from "@/components/shop/shop.module.css"
import { getI18n } from "@/lib/i18n/server"

export default async function NotFound() {
  const { t, href } = await getI18n()
  return (
    <div className="page">
      <h1 className="title">{t.notFound.title}</h1>
      <p className={s.lead}>{t.notFound.body}</p>
      <p style={{ marginTop: 24 }}>
        <Link href={href("/")} className={s.btn}>{t.notFound.home}</Link>
      </p>
    </div>
  )
}
