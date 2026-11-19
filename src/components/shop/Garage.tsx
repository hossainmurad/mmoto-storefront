"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n/client"
import { fmt } from "@/lib/i18n/format"
import s from "./shop.module.css"

type Bike = { id: string; make: string; model: string; year: string }
const KEY = "mmoto.garage"

function load(): Bike[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]")
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
function save(bikes: Bike[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bikes))
  } catch {
    /* private mode / storage blocked: the list just won't persist */
  }
}

/**
 * Saved bikes, kept in this browser. "Find parts" searches the store for the
 * make and model. (Later: save to customer metadata in Medusa and filter by
 * real fitment data.)
 */
export function Garage() {
  const { t, href } = useI18n()
  const [bikes, setBikes] = useState<Bike[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setBikes(load())
    setReady(true)
  }, [])

  const update = (next: Bike[]) => {
    setBikes(next)
    save(next)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const bike = {
      id: crypto.randomUUID(),
      make: String(fd.get("make") ?? "").trim(),
      model: String(fd.get("model") ?? "").trim(),
      year: String(fd.get("year") ?? "").trim(),
    }
    if (!bike.make || !bike.model) return
    update([...bikes, bike])
    e.currentTarget.reset()
  }

  const label = (b: Bike) => [b.make, b.model, b.year].filter(Boolean).join(" ")

  return (
    <div className={s.twoCol}>
      <section className={s.panel} aria-labelledby="bikes">
        <h2 id="bikes" className={s.h2}>{t.garage.yourBikes}</h2>
        {ready && !bikes.length && <p className={s.meta} style={{ marginTop: 12 }}>{t.garage.empty}</p>}
        {bikes.length > 0 && (
          <ul className={s.rows}>
            {bikes.map((b) => (
              <li key={b.id}>
                <span className={s.rowTitle}>{label(b)}</span>
                <span style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <Link href={href(`/search?q=${encodeURIComponent(`${b.make} ${b.model}`)}`)}>{t.garage.shopParts}</Link>
                  <button type="button" className={s.linkBtn} onClick={() => update(bikes.filter((x) => x.id !== b.id))} aria-label={fmt(t.garage.remove, { name: label(b) })}>
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={s.panel} aria-labelledby="add-bike">
        <h2 id="add-bike" className={s.h2}>{t.garage.add}</h2>
        <form className={s.form} onSubmit={onSubmit}>
          <div className={s.field}>
            <label htmlFor="g-make">{t.garage.make}</label>
            <input id="g-make" name="make" placeholder={t.garage.makePh} required />
          </div>
          <div className={s.field}>
            <label htmlFor="g-model">{t.garage.model}</label>
            <input id="g-model" name="model" placeholder={t.garage.modelPh} required />
          </div>
          <div className={s.field}>
            <label htmlFor="g-year">{t.garage.year}</label>
            <input id="g-year" name="year" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} />
          </div>
          <button type="submit" className={s.btn}>{t.garage.add}</button>
        </form>
      </section>
    </div>
  )
}
