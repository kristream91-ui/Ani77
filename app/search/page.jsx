import { Suspense } from 'react'
import SearchClient from '@/components/pages/SearchClient'

export const metadata = { title: 'Search — Ani77' }

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  )
}
