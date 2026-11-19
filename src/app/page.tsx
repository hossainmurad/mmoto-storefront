import Link from "next/link"
import { getCategoryTree } from "@/lib/medusa/categories"
import { categoryHref } from "@/lib/nav-types"

export default async function Home() {
  const categories = await getCategoryTree()
  return (
    <div className="page">
      <h1 className="title">Shop by category</h1>
      <p style={{ color: "var(--mut)", marginTop: 8 }}>
        Navigation demo. Hover a category in the bar above on desktop, or open the menu on mobile.
      </p>
      <ul className="tiles">
        {categories.map((c) => (
          <li key={c.id}><Link href={categoryHref(c)}>{c.name}</Link></li>
        ))}
      </ul>
    </div>
  )
}
