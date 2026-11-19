import Link from "next/link"
import { notFound } from "next/navigation"
import { findByPath, getCategoryTree } from "@/lib/medusa/categories"
import { categoryHref } from "@/lib/nav-types"

type Props = { params: Promise<{ handle: string[] }> }

export async function generateStaticParams() {
  const tree = await getCategoryTree()
  const out: { handle: string[] }[] = []
  const walk = (list: typeof tree) => list.forEach((c) => { out.push({ handle: c.path }); walk(c.children) })
  walk(tree)
  return out
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params
  const trail = findByPath(await getCategoryTree(), handle)
  return { title: trail?.at(-1)?.name ?? "Category" }
}

export default async function CategoryPage({ params }: Props) {
  const { handle } = await params
  const trail = findByPath(await getCategoryTree(), handle)
  if (!trail) notFound()
  const cat = trail[trail.length - 1]

  return (
    <div className="page">
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        {trail.map((c, i) => (
          <span key={c.id} style={{ display: "contents" }}>
            <span aria-hidden="true">/</span>
            {i === trail.length - 1 ? <span aria-current="page">{c.name}</span> : <Link href={categoryHref(c)}>{c.name}</Link>}
          </span>
        ))}
      </nav>
      <h1 className="title">{cat.name}</h1>
      {cat.children.length > 0 ? (
        <ul className="tiles">
          {cat.children.map((c) => <li key={c.id}><Link href={categoryHref(c)}>{c.name}</Link></li>)}
        </ul>
      ) : (
        <p style={{ color: "var(--mut)", marginTop: 12 }}>
          Product grid goes here: list products with <code>category_id: [&quot;{cat.id}&quot;]</code> from Medusa.
        </p>
      )}
    </div>
  )
}
