import type { NavCategory } from "./nav-types"

/**
 * Static navigation config.
 * - FALLBACK_CATEGORIES mirrors motogear.store's category tree and is used
 *   until Medusa categories are set up (or if Medusa is down).
 * - Create the same tree in Medusa Admin > Products > Categories to go live.
 *   For Bangla names, add metadata name_bn to each category.
 */

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

/** Bangla names for the fallback tree (draft; review before launch). */
const BN: Record<string, string> = {
  Helmets: "হেলমেট", "Full Face": "ফুল ফেস", Modular: "মডুলার", Adventure: "অ্যাডভেঞ্চার",
  "Open Face": "ওপেন ফেস", "Helmet Accessories": "হেলমেট এক্সেসরিজ",
  "Motorcycle Gear": "রাইডিং গিয়ার", Jackets: "জ্যাকেট", Trousers: "প্যান্ট", Suits: "স্যুট",
  Gloves: "গ্লাভস", "Boots & Shoes": "বুট ও জুতা", "Body Armour": "বডি আর্মার",
  "Base & Mid Layers": "বেস ও মিড লেয়ার", "Rainwear & Visibility": "রেইনকোট ও রিফ্লেক্টিভ",
  Goggles: "গগলস", "Hydration Systems": "হাইড্রেশন সিস্টেম",
  "Motorcycle Parts": "মোটরসাইকেল পার্টস", Exhaust: "এক্সজস্ট", Brakes: "ব্রেক", Tyres: "টায়ার",
  "Engine Parts & Filters": "ইঞ্জিন পার্টস ও ফিল্টার", Suspension: "সাসপেনশন", Transmission: "ট্রান্সমিশন",
  "Batteries & Electronics": "ব্যাটারি ও ইলেকট্রনিক্স", Lights: "লাইট", "Handlebars & Controls": "হ্যান্ডেলবার ও কন্ট্রোল",
  "Body & Frame": "বডি ও ফ্রেম", Protectors: "প্রোটেক্টর", Oils: "অয়েল",
  Accessories: "এক্সেসরিজ", Intercoms: "ইন্টারকম", Luggage: "লাগেজ", "Bags & Backpacks": "ব্যাগ ও ব্যাকপ্যাক",
  Locks: "লক", "Phone Mounts": "ফোন হোল্ডার", Tools: "টুলস", "Paddock & Garage": "প্যাডক ও গ্যারেজ",
  "Washing & Cleaning": "ওয়াশিং ও ক্লিনিং",
  "Lifestyle & Outdoor": "লাইফস্টাইল ও আউটডোর", Streetwear: "স্ট্রিটওয়্যার", "Shirts & Hoodies": "শার্ট ও হুডি",
  Headwear: "ক্যাপ ও হেডওয়্যার", "Shoes & Boots": "জুতা ও বুট", "Winter Gear": "শীতের গিয়ার",
  "Outdoor Equipment": "আউটডোর সরঞ্জাম",
  Others: "অন্যান্য", "Alarms & Security": "অ্যালার্ম ও সিকিউরিটি", "GPS & Cameras": "জিপিএস ও ক্যামেরা",
  "Fluids & Lubricants": "ফ্লুইড ও লুব্রিকেন্ট", "Ride Styles": "রাইড স্টাইল",
}

function tree(def: Record<string, string[]>): NavCategory[] {
  return Object.entries(def).map(([name, kids]) => {
    const handle = slug(name)
    return {
      id: `fallback_${handle}`,
      name,
      nameBn: BN[name],
      handle,
      path: [handle],
      children: kids.map((k) => ({
        id: `fallback_${handle}_${slug(k)}`,
        name: k,
        nameBn: BN[k],
        handle: slug(k),
        path: [handle, slug(k)],
        children: [],
      })),
    }
  })
}

export const FALLBACK_CATEGORIES: NavCategory[] = tree({
  Helmets: ["Full Face", "Modular", "Adventure", "Open Face", "Helmet Accessories"],
  "Motorcycle Gear": [
    "Jackets", "Trousers", "Suits", "Gloves", "Boots & Shoes", "Body Armour",
    "Base & Mid Layers", "Rainwear & Visibility", "Goggles", "Hydration Systems",
  ],
  "Motorcycle Parts": [
    "Exhaust", "Brakes", "Tyres", "Engine Parts & Filters", "Suspension", "Transmission",
    "Batteries & Electronics", "Lights", "Handlebars & Controls", "Body & Frame", "Protectors", "Oils",
  ],
  Accessories: [
    "Intercoms", "Luggage", "Bags & Backpacks", "Locks", "Phone Mounts", "Tools",
    "Paddock & Garage", "Washing & Cleaning",
  ],
  "Lifestyle & Outdoor": [
    "Streetwear", "Shirts & Hoodies", "Headwear", "Shoes & Boots", "Winter Gear", "Outdoor Equipment",
  ],
  Others: ["Alarms & Security", "GPS & Cameras", "Fluids & Lubricants", "Ride Styles"],
})

/**
 * Page links. `key` is the label's key in the dictionary's `nav` section,
 * so labels follow the language. `href` is the English path (no locale prefix).
 */
export type PageLink = { key: "deals" | "garage" | "blog" | "about" | "contact"; href: string; accent?: boolean }

/** Links at the end of the category bar (desktop) and under categories in the mobile menu. */
export const PAGE_LINKS: PageLink[] = [
  { key: "deals", href: "/deals", accent: true },
  { key: "garage", href: "/account/garage" },
]

/** Secondary pages (motogear: About, Blogs, Contact). Desktop: top bar. Mobile: menu. */
export const UTILITY_LINKS: PageLink[] = [
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
]

export const HOTLINE = { label: "[Hotline number]", href: "tel:+880" }

/**
 * Contact page details. Leave a value empty to hide that row.
 * whatsapp: international number without + or spaces, e.g. "8801XXXXXXXXX".
 */
export const CONTACT = {
  whatsapp: "",
  email: "",
  address: "",
  hours: "",
}

/** Product collection handle shown on /deals. Create it in Medusa Admin > Products > Collections. */
export const DEALS_COLLECTION = "deals"
