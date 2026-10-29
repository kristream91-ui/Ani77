import { Suspense } from 'react'
import BrowseClient from '@/components/pages/BrowseClient'
import { SkGrid } from '@/components/Skeleton.jsx'

export const metadata = { title: 'Browse — Ani77' }

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8"><SkGrid count={12} /></div>}>
      <BrowseClient />
    </Suspense>
  )
}
