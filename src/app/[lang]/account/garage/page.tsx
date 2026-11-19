import { Garage } from "@/components/shop/Garage"
import s from "@/components/shop/shop.module.css"
import { getI18n } from "@/lib/i18n/server"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.garage.title, robots: { index: false } }
}

export default async function GaragePage() {
  const { t } = await getI18n()
  return (
    <div className="page">
      <h1 className="title">{t.garage.title}</h1>
      <p className={s.lead}>{t.garage.intro}</p>
      <Garage />
    </div>
  )
}
