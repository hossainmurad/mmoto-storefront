"use client"

import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import type { Suggestions } from "@/app/api/search/route"
import { useBrowserPathname, useI18n } from "@/lib/i18n/client"
import { stripLocale } from "@/lib/i18n/config"
import { fmt } from "@/lib/i18n/format"
import { Icon } from "./icons"
import s from "./nav.module.css"

const DEBOUNCE = 200

type Option = { id: string; href: string }

/**
 * Header search with suggestions (ARIA 1.2 combobox + listbox).
 * Without JavaScript it is still a plain GET form to /search?q=.
 * Keyboard: ArrowDown/ArrowUp move through suggestions, Enter opens the
 * highlighted one (or runs the search), Escape closes the list.
 */
export function SearchBox() {
  const { t, locale, href } = useI18n()
  const router = useRouter()
  const pathname = useBrowserPathname()
  const id = useId()
  const listId = `${id}-list`
  const [q, setQ] = useState("")
  const [data, setData] = useState<Suggestions | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const rootRef = useRef<HTMLFormElement>(null)

  // Prefill on the search page, close on navigation.
  useEffect(() => {
    setOpen(false)
    if (stripLocale(pathname) === "/search") setQ(new URLSearchParams(location.search).get("q") ?? "")
  }, [pathname])

  // Fetch suggestions (debounced, previous request cancelled).
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?${new URLSearchParams({ q: term, lang: locale })}`, { signal: ctrl.signal })
        setData(await res.json())
        setActive(-1)
      } catch {
        /* aborted or offline: keep the old list */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [q, locale])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  const term = q.trim()
  const searchHref = href(`/search?q=${encodeURIComponent(term)}`)
  const options: Option[] = [
    ...(data?.categories ?? []).map((c) => ({ id: `${id}-c-${c.id}`, href: c.href })),
    ...(data?.products ?? []).map((p) => ({ id: `${id}-p-${p.id}`, href: p.href })),
    ...(term.length >= 2 ? [{ id: `${id}-all`, href: searchHref }] : []),
  ]
  const showList = open && term.length >= 2
  const activeId = showList && active >= 0 ? options[active]?.id : undefined

  const go = (to: string) => {
    setOpen(false)
    router.push(to)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!options.length) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === "ArrowDown" ? 1 : -1
      // -1 means "nothing highlighted" (focus stays in the text box); wraps at both ends.
      setActive((i) => {
        const n = i + step
        return n < -1 ? options.length - 1 : n >= options.length ? -1 : n
      })
    } else if (e.key === "Enter" && showList && active >= 0 && options[active]) {
      e.preventDefault()
      go(options[active].href)
    } else if (e.key === "Escape") {
      if (showList) {
        e.preventDefault()
        setOpen(false)
      } else if (q) {
        setQ("")
      }
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (term) go(searchHref)
  }

  let idx = -1
  const opt = (optionId: string) => {
    idx += 1
    const i = idx
    return {
      id: optionId,
      role: "option" as const,
      "aria-selected": active === i,
      className: `${s.sugItem} ${active === i ? s.sugActive : ""}`,
      onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
      onMouseEnter: () => setActive(i),
    }
  }

  return (
    <form ref={rootRef} action={href("/search")} method="get" role="search" className={s.search} onSubmit={onSubmit}>
      <label htmlFor={`${id}-input`} className={s.srOnly}>{t.nav.searchLabel}</label>
      <Icon name="search" />
      <input
        id={`${id}-input`}
        name="q"
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        placeholder={t.nav.searchPlaceholder}
        autoComplete="off"
        enterKeyHint="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <button type="submit" className={s.searchBtn}>{t.nav.searchButton}</button>

      <div className={s.suggest} hidden={!showList}>
        <ul id={listId} role="listbox" aria-label={t.search.suggestions} className={s.sugList}>
          {!!data?.categories.length && (
            <li role="presentation" className={s.sugHead}>{t.search.categories}</li>
          )}
          {data?.categories.map((c) => (
            <li key={c.id} {...opt(`${id}-c-${c.id}`)} onClick={() => go(c.href)}>
              <span className={s.sugIcon}><Icon name="search" size={16} /></span>
              <span>
                {c.label}
                {c.parent && <span className={s.sugMeta}> · {c.parent}</span>}
              </span>
            </li>
          ))}
          {!!data?.products.length && (
            <li role="presentation" className={s.sugHead}>{t.search.products}</li>
          )}
          {data?.products.map((p) => (
            <li key={p.id} {...opt(`${id}-p-${p.id}`)} onClick={() => go(p.href)}>
              <span className={s.sugThumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.thumbnail && <img src={p.thumbnail} alt="" width={40} height={40} />}
              </span>
              <span className={s.sugText}>
                <span>{p.title}</span>
                {p.price && <span className={s.sugMeta}>{p.price}</span>}
              </span>
            </li>
          ))}
          {term.length >= 2 && (
            <li {...opt(`${id}-all`)} onClick={() => go(searchHref)}>
              <span className={s.sugAll}>
                {loading ? t.search.loading : fmt(t.search.seeAll, { q: term })}
              </span>
              <Icon name="arrowRight" size={16} />
            </li>
          )}
        </ul>
      </div>
    </form>
  )
}
