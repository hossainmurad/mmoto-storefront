import Link from "next/link"
import { LoginForm, RegisterForm } from "@/components/shop/AuthForms"
import { Empty, NotConnected } from "@/components/shop/Notice"
import s from "@/components/shop/shop.module.css"
import { logout } from "@/lib/actions/account"
import { date, fmt, num, price } from "@/lib/i18n/format"
import { getI18n } from "@/lib/i18n/server"
import { medusaConfigured } from "@/lib/medusa/client"
import { getCustomer, getOrders } from "@/lib/medusa/customer"

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t.account.title, robots: { index: false } }
}

export default async function AccountPage() {
  const { locale, t, href } = await getI18n()

  if (!medusaConfigured) {
    return (
      <div className="page">
        <h1 className="title">{t.account.title}</h1>
        <NotConnected t={t} />
      </div>
    )
  }

  const customer = await getCustomer()

  if (!customer) {
    return (
      <div className="page">
        <h1 className="title">{t.account.title}</h1>
        <div className={s.twoCol}>
          <section className={s.panel} aria-labelledby="signin">
            <h2 id="signin" className={s.h2}>{t.account.signInTitle}</h2>
            <LoginForm />
          </section>
          <section className={s.panel} aria-labelledby="register">
            <h2 id="register" className={s.h2}>{t.account.registerTitle}</h2>
            <RegisterForm />
          </section>
        </div>
      </div>
    )
  }

  const orders = await getOrders()
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email

  return (
    <div className="page">
      <h1 className="title">{fmt(t.account.hello, { name })}</h1>
      <p className={s.lead}>{customer.email}</p>
      <div className={s.chips}>
        <Link href={href("/account/garage")} className={`${s.btn} ${s.btnGhost}`}>{t.account.garageLink}</Link>
        <Link href={href("/wishlist")} className={`${s.btn} ${s.btnGhost}`}>{t.account.wishlistLink}</Link>
        <form action={logout}>
          <button type="submit" className={`${s.btn} ${s.btnGhost}`}>{t.account.signOut}</button>
        </form>
      </div>

      <section className={s.section} aria-labelledby="orders">
        <h2 id="orders" className={s.h2}>{t.account.orders}</h2>
        {orders.length ? (
          <ul className={s.rows}>
            {orders.map((o) => (
              <li key={o.id}>
                <span>
                  <span className={s.rowTitle}>{fmt(t.account.order, { id: num(locale, o.display_id ?? 0) })}</span>
                  <br />
                  <span className={s.meta}>
                    {fmt(t.account.placedOn, { date: date(locale, o.created_at) })} · {o.fulfillment_status ?? o.status}
                  </span>
                </span>
                <strong>{price(locale, o.total, o.currency_code)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>{t.account.noOrders}</Empty>
        )}
      </section>
    </div>
  )
}
