import s from "@/components/shop/shop.module.css"
import { getI18n } from "@/lib/i18n/server"
import { CONTACT, HOTLINE } from "@/lib/nav-config"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.contact.title, description: t.contact.intro }
}

/** Contact details come from CONTACT and HOTLINE in src/lib/nav-config.ts. Empty values are hidden. */
export default async function ContactPage() {
  const { t } = await getI18n()
  const rows = [
    { label: t.contact.hotline, value: HOTLINE.label, href: HOTLINE.href },
    CONTACT.whatsapp && { label: t.contact.whatsapp, value: `+${CONTACT.whatsapp}`, href: `https://wa.me/${CONTACT.whatsapp}` },
    CONTACT.email && { label: t.contact.email, value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    CONTACT.address && { label: t.contact.address, value: CONTACT.address },
    CONTACT.hours && { label: t.contact.hours, value: CONTACT.hours },
  ].filter((r): r is { label: string; value: string; href?: string } => !!r)

  return (
    <div className="page">
      <h1 className="title">{t.contact.title}</h1>
      <p className={s.lead}>{t.contact.intro}</p>
      <ul className={s.rows} style={{ maxWidth: 640 }}>
        {rows.map((r) => (
          <li key={r.label}>
            <span className={s.rowTitle}>{r.label}</span>
            {r.href ? <a href={r.href}>{r.value}</a> : <span style={{ whiteSpace: "pre-line" }}>{r.value}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
