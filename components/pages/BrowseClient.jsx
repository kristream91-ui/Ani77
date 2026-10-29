'use client'

import React, { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useT } from '@/lib/i18n.jsx'
import { genres, languages, labelFor, localQuery } from '@/lib/api.js'
import { EmptyState, Grid } from '@/components/Poster.jsx'
import * as I from '@/components/icons.jsx'

const SORTS = [
  { key: 'popularity', label: 'Popularity' },
  { key: 'score', label: 'Rating' },
  { key: 'year', label: 'Newest' },
  { key: 'title', label: 'A–Z' }
]

function Select({ value, onChange, options, label }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select pl-3.5 pr-8"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <I.ChevronRight size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-zinc-500" />
    </label>
  )
}

export default function Browse() {
  const t = useT()
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const setParams = (next) => {
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const genre = params.get('genre') || ''
  const language = params.get('language') || ''
  const type = params.get('type') || ''
  const sort = params.get('sort') || 'popularity'

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const results = useMemo(
    () => localQuery({ genre, language, type, sort }),
    [genre, language, type, sort]
  )

  const activeCount = [genre, language, type].filter(Boolean).length

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
      <div className="pt-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
          {t('browse')}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {results.length} titles{language ? ` with ${language} dub` : ''}
          {genre ? ` · ${genre}` : ''}
        </p>
      </div>

      {/* genre chips */}
      <div className="no-scrollbar edge-fade -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8">
        <button
          onClick={() => setParam('genre', '')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 active:scale-95 ${
            !genre
              ? 'accent-grad text-ink-950 shadow-glow'
              : 'border border-white/10 bg-white/5 text-zinc-400 hover:border-brand/50 hover:text-white'
          }`}
        >
          {t('all')}
        </button>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setParam('genre', genre === g ? '' : g)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 active:scale-95 ${
              genre === g
                ? 'accent-grad text-ink-950 shadow-glow'
                : 'border border-white/10 bg-white/5 text-zinc-400 hover:border-brand/50 hover:text-white'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* secondary filters */}
      <div className="sticky top-14 z-20 mt-3 border-y border-white/5 glass py-2.5 lg:top-16">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <Select
            label={t('language')}
            value={language}
            onChange={(v) => setParam('language', v)}
            options={[
              { value: '', label: 'All languages' },
              ...languages.map((l) => ({ value: l, label: labelFor(l) }))
            ]}
          />
          <Select
            label="Type"
            value={type}
            onChange={(v) => setParam('type', v)}
            options={[
              { value: '', label: 'All types' },
              { value: 'TV', label: 'TV series' },
              { value: 'Movie', label: 'Movies' }
            ]}
          />
          <Select
            label={t('sort')}
            value={sort}
            onChange={(v) => setParam('sort', v)}
            options={SORTS.map((s) => ({ value: s.key, label: `Sort: ${s.label}` }))}
          />
          {activeCount > 0 && (
            <button
              onClick={() => setParams(new URLSearchParams())}
              className="ml-auto flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 hover:text-white"
            >
              <I.X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="py-5">
        {results.length ? (
          <Grid items={results} />
        ) : (
          <EmptyState
            title={t('noResults')}
            hint="Try another genre, or clear the language filter."
            icon={<I.Search size={22} />}
          />
        )}
      </div>
    </div>
  )
}
