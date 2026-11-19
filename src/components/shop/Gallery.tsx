"use client"

import { useState } from "react"
import s from "./shop.module.css"

/** Main product image with a thumbnail strip. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0)
  if (!images.length) return <div className={`${s.galleryMain} ${s.noImg}`} aria-hidden="true">MMOTO</div>
  return (
    <div className={s.gallery}>
      <div className={s.galleryMain}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={alt} />
      </div>
      {images.length > 1 && (
        <div className={s.thumbs}>
          {images.map((src, n) => (
            <button key={src} type="button" className={s.thumbBtn} aria-current={n === i} aria-label={`${n + 1} / ${images.length}`} onClick={() => setI(n)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
