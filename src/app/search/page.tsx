type Props = { searchParams: Promise<{ q?: string }> }

export const metadata = { title: "Search" }

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams
  return (
    <div className="page">
      <h1 className="title">{q ? `Results for "${q}"` : "Search"}</h1>
      <p style={{ color: "var(--mut)", marginTop: 12 }}>
        Wire this to Medusa: <code>GET /store/products?q=…</code> (or Meilisearch/Algolia for typo-tolerant search).
      </p>
    </div>
  )
}
