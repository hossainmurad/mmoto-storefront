"use client"

import { useActionState } from "react"
import { login, register, type AuthState } from "@/lib/actions/account"
import { useI18n } from "@/lib/i18n/client"
import s from "./shop.module.css"

function ErrorBox({ state }: { state: AuthState }) {
  const { t } = useI18n()
  if (!state?.error) return null
  return <p className={s.error} role="alert">{t.account[state.error]}</p>
}

export function LoginForm() {
  const { t } = useI18n()
  const [state, action, pending] = useActionState(login, null)
  return (
    <form action={action} className={s.form} noValidate>
      <ErrorBox state={state} />
      <div className={s.field}>
        <label htmlFor="li-email">{t.account.email}</label>
        <input id="li-email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <div className={s.field}>
        <label htmlFor="li-pass">{t.account.password}</label>
        <input id="li-pass" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit" className={s.btn} disabled={pending}>{pending ? t.common.pending : t.account.signIn}</button>
    </form>
  )
}

export function RegisterForm() {
  const { t } = useI18n()
  const [state, action, pending] = useActionState(register, null)
  return (
    <form action={action} className={s.form} noValidate>
      <ErrorBox state={state} />
      <div className={s.row2}>
        <div className={s.field}>
          <label htmlFor="re-first">{t.account.firstName}</label>
          <input id="re-first" name="first_name" autoComplete="given-name" required />
        </div>
        <div className={s.field}>
          <label htmlFor="re-last">{t.account.lastName}</label>
          <input id="re-last" name="last_name" autoComplete="family-name" />
        </div>
      </div>
      <div className={s.field}>
        <label htmlFor="re-email">{t.account.email}</label>
        <input id="re-email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <div className={s.field}>
        <label htmlFor="re-pass">{t.account.password}</label>
        <input id="re-pass" name="password" type="password" autoComplete="new-password" minLength={8} required aria-describedby="re-pass-hint" />
        <span id="re-pass-hint" className={s.hint}>{t.account.passwordHint}</span>
      </div>
      <button type="submit" className={`${s.btn} ${s.btnGhost}`} disabled={pending}>{pending ? t.common.pending : t.account.createAccount}</button>
    </form>
  )
}
