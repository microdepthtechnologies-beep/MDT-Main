export default function Loading() {
  return <div className="site-width py-16" role="status" aria-label="Loading page"><p className="eyebrow mb-8">Loading your next possibility…</p><div className="h-40 rounded bg-paper mb-10 animate-pulse" /><div className="grid grid-cols-2 md:grid-cols-3 gap-5">{[1, 2, 3].map(n => <div key={n} className="h-72 bg-paper rounded animate-pulse" />)}</div></div>;
}
