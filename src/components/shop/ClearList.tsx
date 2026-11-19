"use client"

import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/client"
import { writeList, type ListName } from "@/lib/lists"
import s from "./shop.module.css"

export function ClearList({ list }: { list: ListName }) {
  const { t } = useI18n()
  const router = useRouter()
  return (
    <button
      type="button"
      className={s.linkBtn}
      onClick={() => {
        writeList(list, [])
        router.refresh()
      }}
    >
      {t.compare.clear}
    </button>
  )
}
