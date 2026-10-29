import DetailClient from '@/components/pages/DetailClient'
import catalog from '@/data/catalog.json'

/** Pre-renders all 40 detail pages, so `next build` can emit a static export. */
export function generateStaticParams() {
  return catalog.anime.map((a) => ({ id: a.id }))
}

export function generateMetadata({ params }) {
  const anime = catalog.anime.find((a) => a.id === params.id)
  if (!anime) return { title: 'Title not found — Ani77' }
  return {
    title: `${anime.title} — Ani77`,
    description: anime.synopsis
  }
}

export default function Page({ params }) {
  return <DetailClient id={params.id} />
}
