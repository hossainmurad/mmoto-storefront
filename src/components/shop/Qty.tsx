"use client"

import { useI18n } from "@/lib/i18n/client"
import { num } from "@/lib/i18n/format"
import s from "./shop.module.css"

/** − / + quantity stepper. */
export function Qty({ value, onChange, label, min = 1, max = 20, disabled = false }: {
  value: number
  onChange: (n: number) => void
  label: string
  min?: number
  max?: number
  disabled?: boolean
}) {
  const { locale } = useI18n()
  return (
    <div className={s.qty} role="group" aria-label={label}>
      <button type="button" aria-label="−1" disabled={disabled || value <= min} onClick={() => onChange(value - 1)}>−</button>
      <output aria-live="polite">{num(locale, value)}</output>
      <button type="button" aria-label="+1" disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}
