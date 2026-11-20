import "server-only"
import type { Locale } from "../i18n/config"
import type { ShopProduct } from "../shop-types"

/**
 * Demo catalogue, used only while Medusa is not configured so every page has
 * something to show. Generic made-up products (no real brands), prices in BDT.
 * Delete this file's use in products.ts once the real store is live.
 */
type Demo = {
  handle: string
  title: string
  titleBn: string
  description: string
  descriptionBn: string
  /** fallback category ids from nav-config.ts, e.g. fallback_helmets_full-face */
  categories: string[]
  price: number
  /** set to show it as discounted and list it on /deals */
  was?: number
  sizes?: string[]
  colors?: string[]
  outOfStock?: boolean
}

const DEMO: Demo[] = [
  { handle: "demo-full-face-helmet", title: "Demo Full Face Helmet", titleBn: "ডেমো ফুল ফেস হেলমেট", description: "Example product. Polycarbonate shell, clear visor, removable washable liner.", descriptionBn: "নমুনা পণ্য। পলিকার্বনেট শেল, স্বচ্ছ ভাইজর, খুলে ধোয়া যায় এমন লাইনার।", categories: ["fallback_helmets_full-face"], price: 6500, was: 7800, sizes: ["M", "L", "XL"], colors: ["Black", "White", "Red"] },
  { handle: "demo-modular-helmet", title: "Demo Modular Helmet", titleBn: "ডেমো মডুলার হেলমেট", description: "Example product. Flip-up chin bar and built-in sun visor.", descriptionBn: "নমুনা পণ্য। উপরে ওঠানো যায় এমন চিন বার ও বিল্ট-ইন সান ভাইজর।", categories: ["fallback_helmets_modular"], price: 9800, sizes: ["M", "L", "XL"], colors: ["Black", "Grey"] },
  { handle: "demo-open-face-helmet", title: "Demo Open Face Helmet", titleBn: "ডেমো ওপেন ফেস হেলমেট", description: "Example product. Light open face helmet for city riding.", descriptionBn: "নমুনা পণ্য। শহরে চালানোর জন্য হালকা ওপেন ফেস হেলমেট।", categories: ["fallback_helmets_open-face"], price: 3200, sizes: ["M", "L"], colors: ["Black", "White"] },
  { handle: "demo-riding-jacket", title: "Demo Mesh Riding Jacket", titleBn: "ডেমো মেশ রাইডিং জ্যাকেট", description: "Example product. Breathable mesh with shoulder and elbow armour.", descriptionBn: "নমুনা পণ্য। বাতাস চলাচলযোগ্য মেশ, কাঁধ ও কনুইয়ে আর্মার।", categories: ["fallback_motorcycle-gear_jackets"], price: 8500, was: 9900, sizes: ["M", "L", "XL", "XXL"], colors: ["Black", "Hi-Vis Yellow"] },
  { handle: "demo-riding-gloves", title: "Demo Riding Gloves", titleBn: "ডেমো রাইডিং গ্লাভস", description: "Example product. Knuckle protection and touchscreen fingertips.", descriptionBn: "নমুনা পণ্য। নাকল প্রোটেকশন ও টাচস্ক্রিন আঙুল।", categories: ["fallback_motorcycle-gear_gloves"], price: 1800, sizes: ["S", "M", "L", "XL"], colors: ["Black"] },
  { handle: "demo-riding-boots", title: "Demo Touring Boots", titleBn: "ডেমো ট্যুরিং বুট", description: "Example product. Ankle support and oil-resistant sole.", descriptionBn: "নমুনা পণ্য। গোড়ালির সাপোর্ট ও তেল-প্রতিরোধী সোল।", categories: ["fallback_motorcycle-gear_boots-and-shoes"], price: 7200, sizes: ["41", "42", "43", "44"], outOfStock: true },
  { handle: "demo-rain-suit", title: "Demo Rain Suit", titleBn: "ডেমো রেইন স্যুট", description: "Example product. Two-piece waterproof suit with reflective strips.", descriptionBn: "নমুনা পণ্য। রিফ্লেক্টিভ স্ট্রিপসহ দুই অংশের ওয়াটারপ্রুফ স্যুট।", categories: ["fallback_motorcycle-gear_rainwear-and-visibility"], price: 2400, was: 2900, sizes: ["L", "XL"] },
  { handle: "demo-engine-oil-1l", title: "Demo 10W-40 Engine Oil 1L", titleBn: "ডেমো ১০W-৪০ ইঞ্জিন অয়েল ১ লিটার", description: "Example product. Semi-synthetic 4-stroke motorcycle oil.", descriptionBn: "নমুনা পণ্য। সেমি-সিন্থেটিক ৪-স্ট্রোক মোটরসাইকেল অয়েল।", categories: ["fallback_motorcycle-parts_oils", "fallback_others_fluids-and-lubricants"], price: 950 },
  { handle: "demo-brake-pads", title: "Demo Front Brake Pads", titleBn: "ডেমো ফ্রন্ট ব্রেক প্যাড", description: "Example product. Sintered pads for 150cc disc brakes.", descriptionBn: "নমুনা পণ্য। ১৫০সিসি ডিস্ক ব্রেকের জন্য সিন্টারড প্যাড।", categories: ["fallback_motorcycle-parts_brakes"], price: 750 },
  { handle: "demo-chain-kit", title: "Demo Chain and Sprocket Kit", titleBn: "ডেমো চেইন ও স্প্রোকেট কিট", description: "Example product. O-ring chain with front and rear sprockets.", descriptionBn: "নমুনা পণ্য। সামনে ও পেছনের স্প্রোকেটসহ ও-রিং চেইন।", categories: ["fallback_motorcycle-parts_transmission"], price: 3600, was: 4200 },
  { handle: "demo-led-headlight", title: "Demo LED Headlight Bulb", titleBn: "ডেমো এলইডি হেডলাইট বাল্ব", description: "Example product. Plug-in LED bulb, white light.", descriptionBn: "নমুনা পণ্য। প্লাগ-ইন এলইডি বাল্ব, সাদা আলো।", categories: ["fallback_motorcycle-parts_lights"], price: 1200 },
  { handle: "demo-phone-mount", title: "Demo Handlebar Phone Mount", titleBn: "ডেমো হ্যান্ডেলবার ফোন হোল্ডার", description: "Example product. Aluminium clamp with quick release.", descriptionBn: "নমুনা পণ্য। কুইক রিলিজসহ অ্যালুমিনিয়াম ক্ল্যাম্প।", categories: ["fallback_accessories_phone-mounts"], price: 1100 },
  { handle: "demo-disc-lock", title: "Demo Disc Lock with Alarm", titleBn: "ডেমো অ্যালার্মসহ ডিস্ক লক", description: "Example product. Hardened steel pin and 110 dB alarm.", descriptionBn: "নমুনা পণ্য। শক্ত স্টিল পিন ও ১১০ ডেসিবেল অ্যালার্ম।", categories: ["fallback_accessories_locks", "fallback_others_alarms-and-security"], price: 2100 },
  { handle: "demo-tank-bag", title: "Demo Magnetic Tank Bag", titleBn: "ডেমো ম্যাগনেটিক ট্যাংক ব্যাগ", description: "Example product. 12 litres, map pocket, rain cover included.", descriptionBn: "নমুনা পণ্য। ১২ লিটার, ম্যাপ পকেট, রেইন কভারসহ।", categories: ["fallback_accessories_luggage", "fallback_accessories_bags-and-backpacks"], price: 2900 },
]

const SIZE_OPTION = "opt_size"
const COLOR_OPTION = "opt_color"

function toProduct(d: Demo, locale: Locale): ShopProduct {
  const money = { amount: d.price, original: d.was ?? d.price, currency: "bdt" }
  // Option titles stay in English (they are the filter keys in the URL); labels follow the language.
  const options = [
    ...(d.sizes?.length ? [{ id: SIZE_OPTION, title: "Size", label: locale === "bn" ? "সাইজ" : "Size", values: d.sizes }] : []),
    ...(d.colors?.length ? [{ id: COLOR_OPTION, title: "Color", label: locale === "bn" ? "রং" : "Color", values: d.colors }] : []),
  ]
  // One variant per combination of option values.
  const combos = options.reduce<Record<string, string>[]>(
    (acc, o) => acc.flatMap((prev) => o.values.map((v) => ({ ...prev, [o.id]: v }))),
    [{}],
  )
  const variants = combos.map((opts) => {
    const values = options.map((o) => opts[o.id])
    return {
      id: values.length ? `${d.handle}__${values.join("__")}` : `${d.handle}__default`,
      title: values.length ? values.join(" / ") : "Default",
      options: opts,
      price: money,
      inStock: !d.outOfStock,
    }
  })
  return {
    id: d.handle,
    title: locale === "bn" ? d.titleBn : d.title,
    handle: d.handle,
    description: locale === "bn" ? d.descriptionBn : d.description,
    images: [],
    options,
    variants,
    price: money,
    inStock: !d.outOfStock,
    categoryIds: d.categories,
  }
}

export function demoList(
  locale: Locale,
  q: { q?: string; categoryId?: string[]; ids?: string[]; deals?: boolean; limit?: number; offset?: number },
) {
  const needle = q.q?.toLocaleLowerCase()
  const hits = DEMO.filter(
    (d) =>
      (!needle || [d.title, d.titleBn, d.description].some((s) => s.toLocaleLowerCase().includes(needle))) &&
      (!q.categoryId || d.categories.some((c) => q.categoryId!.includes(c))) &&
      (!q.ids || q.ids.includes(d.handle)) &&
      (!q.deals || !!d.was),
  )
  const offset = q.offset ?? 0
  return {
    products: hits.slice(offset, offset + (q.limit ?? 24)).map((d) => toProduct(d, locale)),
    count: hits.length,
  }
}

export function demoGet(locale: Locale, handle: string) {
  const d = DEMO.find((x) => x.handle === handle)
  return d ? toProduct(d, locale) : null
}

/** Looks up a demo variant id ("<handle>__<size>") for the demo cart. */
export function demoVariant(locale: Locale, variantId: string) {
  const [handle] = variantId.split("__")
  const p = demoGet(locale, handle)
  const v = p?.variants.find((x) => x.id === variantId)
  return p && v ? { product: p, variant: v } : null
}
