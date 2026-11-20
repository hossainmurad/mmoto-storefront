"use client"

import { useEffect, useRef, useState } from "react"
import { PRICE_STEP } from "@/lib/filters"
import { useI18n } from "@/lib/i18n/client"
import { num } from "@/lib/i18n/format"
import f from "./filters.module.css"

type Props = {
  bounds: { min: number; max: number }
  /** applied values; undefined = at the bound */
  min?: number
  max?: number
  /** called when a handle is released or a number input is left (undefined = no limit) */
  onCommit: (min: number | undefined, max: number | undefined) => void
  idPrefix: string
}

/**
 * Two-handle price slider (two native range inputs on one track, so both work
 * with the keyboard) plus Min / Max number inputs, kept in sync. Nothing is
 * applied while dragging or typing: only on release, blur or Enter.
 */
export function PriceRange({ bounds, min: minProp, max: maxProp, onCommit, idPrefix }: Props) {
  const { t, locale } = useI18n()
  // URL values outside the category's prices (old links) are shown at the nearest bound.
  const within = (n: number | undefined) => (n === undefined ? undefined : Math.min(bounds.max, Math.max(bounds.min, n)))
  const min = within(minProp)
  const max = within(maxProp)
  const [lo, setLo] = useState(min ?? bounds.min)
  const [hi, setHi] = useState(max ?? bounds.max)
  const [loText, setLoText] = useState(String(lo))
  const [hiText, setHiText] = useState(String(hi))
  const loRef = useRef<HTMLInputElement>(null)
  const hiRef = useRef<HTMLInputElement>(null)
  // Latest values for the native change listeners.
  const latest = useRef({ lo, hi })
  latest.current = { lo, hi }

  // Follow the applied values (URL changes, Clear all).
  useEffect(() => {
    const l = min ?? bounds.min
    const h = max ?? bounds.max
    setLo(l)
    setHi(h)
    setLoText(String(l))
    setHiText(String(h))
  }, [min, max, bounds.min, bounds.max])

  const clamp = (n: number) => Math.min(bounds.max, Math.max(bounds.min, n))
  const commit = (l: number, h: number) => {
    const a = clamp(Math.min(l, h))
    const b = clamp(Math.max(l, h))
    onCommit(a <= bounds.min ? undefined : a, b >= bounds.max ? undefined : b)
  }
  const commitRef = useRef(commit)
  commitRef.current = commit

  // React's onChange on a range input fires on every move; the native "change"
  // event fires on release (mouse/touch) and per key press, which is when we apply.
  useEffect(() => {
    const onRelease = () => commitRef.current(latest.current.lo, latest.current.hi)
    const els = [loRef.current, hiRef.current]
    els.forEach((el) => el?.addEventListener("change", onRelease))
    return () => els.forEach((el) => el?.removeEventListener("change", onRelease))
  }, [])

  const pct = (n: number) => ((n - bounds.min) / (bounds.max - bounds.min)) * 100

  const fromText = (text: string, fallback: number) => {
    const n = Number(text.replace(/[^\d]/g, ""))
    return text.trim() === "" || Number.isNaN(n) ? fallback : clamp(n)
  }
  const commitTexts = () => {
    const l = fromText(loText, bounds.min)
    const h = fromText(hiText, bounds.max)
    const a = Math.min(l, h)
    const b = Math.max(l, h)
    setLo(a)
    setHi(b)
    setLoText(String(a))
    setHiText(String(b))
    commit(a, b)
  }

  return (
    <div>
      <p className={f.priceText} aria-hidden="true">
        ৳ {num(locale, lo)} – ৳ {num(locale, hi)}
      </p>
      <div className={f.slider}>
        <span className={f.track} />
        <span className={f.fill} style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input
          ref={loRef}
          type="range"
          className={`${f.range} ${lo > bounds.min + (bounds.max - bounds.min) / 2 ? f.rangeTop : ""}`}
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          value={lo}
          aria-label={t.filters.minPrice}
          aria-valuetext={`৳ ${num(locale, lo)}`}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), hi)
            setLo(v)
            setLoText(String(v))
          }}
        />
        <input
          ref={hiRef}
          type="range"
          className={f.range}
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          value={hi}
          aria-label={t.filters.maxPrice}
          aria-valuetext={`৳ ${num(locale, hi)}`}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), lo)
            setHi(v)
            setHiText(String(v))
          }}
        />
      </div>
      <div className={f.priceInputs}>
        <label className={f.priceField} htmlFor={`${idPrefix}-min`}>
          {t.filters.minInput}
          <input
            id={`${idPrefix}-min`}
            type="number"
            inputMode="numeric"
            min={bounds.min}
            max={bounds.max}
            step={PRICE_STEP}
            value={loText}
            onChange={(e) => {
              setLoText(e.target.value)
              const n = Number(e.target.value)
              if (e.target.value !== "" && n >= bounds.min && n <= hi) setLo(n)
            }}
            onBlur={commitTexts}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commitTexts())}
          />
        </label>
        <label className={f.priceField} htmlFor={`${idPrefix}-max`}>
          {t.filters.maxInput}
          <input
            id={`${idPrefix}-max`}
            type="number"
            inputMode="numeric"
            min={bounds.min}
            max={bounds.max}
            step={PRICE_STEP}
            value={hiText}
            onChange={(e) => {
              setHiText(e.target.value)
              const n = Number(e.target.value)
              if (e.target.value !== "" && n <= bounds.max && n >= lo) setHi(n)
            }}
            onBlur={commitTexts}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commitTexts())}
          />
        </label>
      </div>
    </div>
  )
}
