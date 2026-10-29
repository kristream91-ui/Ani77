import React from 'react'

/** Base block. The shimmer lives on `.skeleton::after` in index.css. */
export function Sk({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function SkPosterCard({ className = '' }) {
  return (
    <div className={className}>
      <Sk className="aspect-[2/3] w-full rounded-xl" />
      <Sk className="mt-2 h-3 w-3/4 rounded" />
      <Sk className="mt-1.5 h-2.5 w-1/2 rounded" />
    </div>
  )
}

export function SkGrid({ count = 12 }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
      role="status"
      aria-label="Loading titles"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkPosterCard key={i} />
      ))}
    </div>
  )
}

export function SkRankCard() {
  return (
    <div className="flex w-[276px] shrink-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2 pr-4 sm:w-[300px]">
      <Sk className="h-9 w-7 shrink-0 rounded" />
      <Sk className="h-[76px] w-[52px] shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Sk className="h-3 w-3/4 rounded" />
        <Sk className="h-2.5 w-1/2 rounded" />
        <Sk className="h-2.5 w-2/3 rounded" />
      </div>
    </div>
  )
}

export function SkRail({ count = 6 }) {
  return (
    <section className="mt-9">
      <Sk className="mb-3.5 h-6 w-48 rounded" />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-hidden px-4 lg:-mx-8 lg:px-8">
        {Array.from({ length: count }).map((_, i) => (
          <SkPosterCard key={i} className="w-[124px] shrink-0 sm:w-[140px] lg:w-[152px]" />
        ))}
      </div>
    </section>
  )
}

/** Full home skeleton: band with rank cards, then a poster grid. */
export function SkHome() {
  return (
    <div role="status" aria-label="Loading">
      <section className="band border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1600px] px-4 py-5 lg:px-8 lg:py-6">
          <div className="mb-3.5 flex items-center justify-between">
            <Sk className="h-6 w-44 rounded" />
            <Sk className="h-8 w-24 rounded-full" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkRankCard key={i} />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <div className="mt-7">
          <Sk className="mb-3.5 h-6 w-52 rounded" />
          <SkGrid count={12} />
        </div>
        <SkRail />
      </div>
    </div>
  )
}

/** Detail skeleton: banner, poster, title block, then episode rows. */
export function SkDetail() {
  return (
    <div className="mx-auto max-w-[1200px]" role="status" aria-label="Loading title">
      <Sk className="h-44 w-full rounded-none sm:h-52 lg:mt-4 lg:h-56 lg:rounded-2xl" />

      <div className="px-4 lg:px-8">
        <div className="relative -mt-24 flex items-start gap-4 sm:gap-6">
          <Sk className="aspect-[2/3] w-[108px] shrink-0 rounded-xl sm:w-[140px] lg:w-[156px]" />
          <div className="min-w-0 flex-1 space-y-2.5 pt-1">
            <Sk className="h-7 w-2/3 rounded" />
            <Sk className="h-3 w-1/3 rounded" />
            <Sk className="h-3 w-1/4 rounded" />
            <div className="flex gap-2 pt-3">
              <Sk className="h-10 w-32 rounded-full" />
              <Sk className="h-10 w-32 rounded-full" />
            </div>
            <div className="flex gap-1.5 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Sk key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-3">
            <Sk className="h-3 w-full rounded" />
            <Sk className="h-3 w-11/12 rounded" />
            <Sk className="h-3 w-4/5 rounded" />
            <div className="flex gap-1.5 pt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Sk key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
            <Sk className="mt-4 h-40 w-full max-w-md rounded-xl" />
            <div className="mt-6 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Sk key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <Sk className="hidden h-40 w-full rounded-xl lg:block" />
        </div>
      </div>
    </div>
  )
}
