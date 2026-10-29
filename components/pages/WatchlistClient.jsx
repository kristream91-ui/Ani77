'use client'

import React, { useMemo, useState } from 'react'
import { useApp, STATUSES } from '@/lib/store.jsx'
import { useT } from '@/lib/i18n.jsx'
import { getAnime } from '@/lib/api.js'
import { EmptyState, Grid } from '@/components/Poster.jsx'
import * as I from '@/components/icons.jsx'

export default function Watchlist() {
  const t = useT()
  const { list, progress } = useApp()
  const [tab, setTab] = useState('all')

  const grouped = useMemo(() => {
    const out = { all: [], watching: [], planned: [], completed: [], onhold: [], dropped: [] }
    for (const [id, entry] of Object.entries(list)) {
      const a = getAnime(id)
      if (!a) continue
      out.all.push(a)
      if (out[entry.status]) out[entry.status].push(a)
    }
    return out
  }, [list])

  const items = grouped[tab] || []
  const watchedEps = Object.values(progress).reduce((n, p) => n + (p.episode || 0), 0)

  const tabs = [{ key: 'all', label: t('all') }, ...STATUSES.map((s) => ({ key: s, label: t(s) }))]

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
      <div className="pt-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
          {t('myList')}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {grouped.all.length} titles · {watchedEps} episodes tracked
        </p>
      </div>

      <div className="no-scrollbar edge-fade -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8">
        {tabs.map((x) => {
          const n = grouped[x.key]?.length ?? 0
          const active = tab === x.key
          return (
            <button
              key={x.key}
              onClick={() => setTab(x.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 active:scale-95 ${
                active
                  ? 'accent-grad text-ink-950 shadow-glow'
                  : 'border border-white/10 bg-white/5 text-zinc-400 hover:border-brand/50 hover:text-white'
              }`}
            >
              {x.label}
              <span className={`text-[10px] ${active ? 'text-white/70' : 'text-zinc-600'}`}>{n}</span>
            </button>
          )
        })}
      </div>

      <div className="py-5">
        {items.length ? (
          <Grid items={items} />
        ) : (
          <EmptyState title={t('empty')} hint={t('emptyHint')} icon={<I.Bookmark size={22} />} />
        )}
      </div>
    </div>
  )
}
