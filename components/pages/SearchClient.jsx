'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useApp } from '@/lib/store.jsx'
import { useT } from '@/lib/i18n.jsx'
import { localQuery, genres } from '@/lib/api.js'
import { EmptyState, Grid } from '@/components/Poster.jsx'
import * as I from '@/components/icons.jsx'

export default function SearchPage() {
  const t = useT()
  const { recent, addRecent } = useApp()
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const setParams = (next) => {
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }
  const [q, setQ] = useState(params.get('q') || '')
  const [debounced, setDebounced] = useState(q)
  const input = useRef(null)

  useEffect(() => {
    input.current?.focus()
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 220)
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    const next = new URLSearchParams(params)
    if (debounced) next.set('q', debounced)
    else next.delete('q')
    setParams(next)
    if (debounced.trim().length > 2) addRecent(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const results = useMemo(
    () => (debounced.trim() ? localQuery({ q: debounced, sort: 'popularity' }) : []),
    [debounced]
  )

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
      <div className="pt-6">
        <div className="relative">
          <I.Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, studios, genres…"
            className="field h-12 rounded-2xl pl-11 pr-11 text-[15px]"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-zinc-500 hover:text-white"
            >
              <I.X size={15} />
            </button>
          )}
        </div>

        {!debounced.trim() && (
          <>
            {recent.length > 0 && (
              <div className="mt-6">
                <p className="label mb-2">
                  Recent searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQ(r)}
                      className="chip chip-off flex items-center gap-1.5"
                    >
                      <I.Clock size={12} className="text-zinc-500" /> {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="label mb-2">
                Browse by genre
              </p>
              <div className="flex flex-wrap gap-2">
                {genres.slice(0, 14).map((g) => (
                  <button
                    key={g}
                    onClick={() => setQ(g)}
                    className="chip chip-off hover:-translate-y-0.5"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="py-5">
        {debounced.trim() && (
          <p className="mb-4 text-sm text-zinc-500">
            {results.length} result{results.length === 1 ? '' : 's'} for “{debounced}”
          </p>
        )}
        {debounced.trim() && results.length === 0 && (
          <EmptyState title={t('noResults')} hint="Check the spelling or try a genre like “Sports”." icon={<I.Search size={22} />} />
        )}
        {results.length > 0 && <Grid items={results} />}
      </div>
    </div>
  )
}
