import Link from "next/link"

/** Placeholder so every nav link resolves while the other pages are built. */
export default async function Placeholder({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const name = slug.at(-1)!.replace(/-/g, " ")
  return (
    <div className="page">
      <h1 className="title" style={{ textTransform: "capitalize" }}>{name}</h1>
      <p style={{ color: "var(--mut)", marginTop: 12 }}>
        This page is not built yet. <Link href="/">Back to home</Link>
      </p>
    </div>
  )
}
