'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp, STATUSES, VERDICTS } from '@/lib/store.jsx'
import { useT } from '@/lib/i18n.jsx'
import { episodesFor, fetchAnime, related } from '@/lib/api.js'
import { DubChips, PosterArt, Rail, Score } from '@/components/Poster.jsx'
import { SkDetail } from '@/components/Skeleton.jsx'
import * as I from '@/components/icons.jsx'

function StatusPills({ animeId }) {
  const { list, setStatus } = useApp()
  const t = useT()
  const current = list[animeId]?.status
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => setStatus(animeId, s)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition-all duration-300 active:scale-95 ${
            current === s
              ? 'accent-grad text-ink-950 shadow-glow'
              : 'border border-white/10 bg-white/5 text-zinc-400 hover:border-brand/50 hover:text-white'
          }`}
        >
          {t(s)}
        </button>
      ))}
    </div>
  )
}

/** Moctale-style verdicts: four words instead of a 7.4/10. */
function VerdictBox({ anime }) {
  const t = useT()
  const { verdictOf, setVerdict } = useApp()
  const mine = verdictOf(anime.id)
  const dist = anime.verdicts || null
  const total = dist ? Object.values(dist).reduce((a, b) => a + b, 0) || 1 : 0

  return (
    <div className="surface p-4">
      {dist && (
        <>
          <div className="flex items-baseline justify-between">
            <p className="label">
              {t('communityVerdict')}
            </p>
            <span className="text-[10px] text-zinc-600">sample data</span>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/5">
            {VERDICTS.map((v) => (
              <span
                key={v.key}
                title={`${t(`v_${v.key}`)} ${dist[v.key] || 0}%`}
                style={{ width: `${((dist[v.key] || 0) / total) * 100}%`, background: v.color }}
                className="h-full transition-all duration-700"
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
            {VERDICTS.map((v) => (
              <span key={v.key} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <i className="h-1.5 w-1.5 rounded-full" style={{ background: v.color }} />
                {t(`v_${v.key}`)}
                <span className="text-zinc-500">{dist[v.key] || 0}%</span>
              </span>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{t('yourVerdict')}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {VERDICTS.map((v) => {
          const on = mine === v.key
          return (
            <button
              key={v.key}
              onClick={() => setVerdict(anime.id, v.key)}
              style={on ? { borderColor: v.color, background: `${v.color}1f`, color: v.color } : undefined}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all duration-300 active:scale-95 ${
                on ? 'shadow-glow' : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-white'
              }`}
            >
              {t(`v_${v.key}`)}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">{t('v_hint')}</p>
    </div>
  )
}

function EpisodeList({ anime }) {
  const { progress, setProgress, notify } = useApp()
  const t = useT()
  const [expanded, setExpanded] = useState(false)
  const eps = useMemo(() => episodesFor(anime, expanded ? 60 : 12), [anime, expanded])
  const current = progress[anime.id]?.episode || 0

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">{t('episodes')}</h2>
        <span className="text-xs text-zinc-500">{anime.episodes} total</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/5 bg-ink-850/60">
        {eps.map((ep, i) => {
          const watched = ep.number < current
          const active = ep.number === current
          return (
            <button
              key={ep.number}
              onClick={() => {
                setProgress(anime.id, ep.number)
                notify(`Episode ${ep.number} marked`)
              }}
              className={`flex w-full items-center gap-3 border-b border-white/5 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-brand/[0.07] ${
                active ? 'bg-brand/[0.06]' : ''
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[11px] font-bold transition-all duration-300 ${
                  watched || active ? 'accent-grad text-ink-950 shadow-glow' : 'bg-ink-800 text-zinc-500'
                }`}
              >
                {watched ? <I.Check size={14} /> : ep.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[13px] font-medium ${active ? 'text-white' : 'text-zinc-300'}`}>
                  {ep.title}
                </span>
                <span className="block text-[11px] text-zinc-500">
                  {ep.runtime} · {anime.dubs.length} audio tracks
                </span>
              </span>
              <I.Play size={14} className="shrink-0 text-zinc-600" />
            </button>
          )
        })}
      </div>

      {!expanded && anime.episodes > 12 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-3 w-full rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-zinc-300 transition-all duration-300 ease-smooth hover:border-brand/50 hover:text-white active:scale-[0.99]"
        >
          Show more episodes
        </button>
      )}
    </section>
  )
}

export default function DetailClient({ id }) {
  const t = useT()
  const { list, setProgress, setStatus, removeFromList } = useApp()
  const [anime, setAnime] = useState(undefined)

  useEffect(() => {
    let live = true
    setAnime(undefined)
    fetchAnime(id).then((a) => live && setAnime(a || null))
    return () => {
      live = false
    }
  }, [id])

  if (anime === undefined) return <SkDetail />

  if (!anime) {
    return (
      <div className="mx-auto max-w-[1200px] animate-fadeUp px-4 py-20 text-center lg:px-8">
        <p className="font-display text-xl font-bold text-white">Title not found</p>
        <Link href="/browse" className="mt-3 inline-block text-sm text-brand hover:underline">
          Back to browse
        </Link>
      </div>
    )
  }

  const entry = list[anime.id]
  const [c1, c2] = anime.palette || ['#00a3ff', '#0057ff']

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="relative h-44 overflow-hidden sm:h-52 lg:mt-4 lg:h-56 lg:rounded-2xl">
        <div className="palette-grad absolute inset-0 opacity-75" style={{ '--p1': c1, '--p2': c2 }} />
        <div className="absolute inset-0 bg-ink-950/25" />
        <div className="spotlight absolute inset-0 opacity-30 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-dot-grid bg-dots opacity-[0.08]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ink-950/25 to-ink-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      </div>

      <div className="px-4 lg:px-8">
        <div className="relative -mt-24 flex items-start gap-4 sm:gap-6">
          <div className="w-[108px] shrink-0 overflow-hidden rounded-xl shadow-card ring-1 ring-white/15 sm:w-[140px] lg:w-[156px]">
            <div className="aspect-[2/3]">
              <PosterArt anime={anime} />
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h1 className="font-display text-xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-2xl lg:text-3xl">
              {anime.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-tiny text-zinc-400">
              <Score value={anime.score} />
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-300">{anime.type}</span>
              <span>{anime.year}</span>
              <span>·</span>
              <span>{anime.episodes > 1 ? `${anime.episodes} eps` : 'Movie'}</span>
              <span>·</span>
              <span>{anime.type === 'Movie' ? anime.runtime : `${anime.runtime}/ep`}</span>
            </div>

            <div className="mt-1.5 text-tiny text-zinc-500">{anime.studio} · {anime.status}</div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={() => setProgress(anime.id, 1)} className="btn btn-primary btn-md sheen">
                <I.Play size={15} /> {t('watchNow')}
              </button>
              <button
                onClick={() => setStatus(anime.id, entry ? entry.status : 'planned')}
                className="btn btn-secondary btn-md"
              >
                {entry ? <I.Check size={15} /> : <I.Plus size={15} />}
                {entry ? t('inList') : t('addToList')}
              </button>
              {entry && (
                <button
                  onClick={() => removeFromList(anime.id)}
                  aria-label="Remove from list"
                  className="btn-icon hover:border-red-500/40 hover:text-red-400"
                >
                  <I.Trash size={15} />
                </button>
              )}
            </div>

            <div className="mt-3">
              <StatusPills animeId={anime.id} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div>
              <p className="text-[13px] leading-relaxed text-zinc-300">{anime.synopsis}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {anime.genres.map((g) => (
                  <Link
                    key={g}
                    href={`/browse?genre=${encodeURIComponent(g)}`}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:text-white"
                  >
                    {g}
                  </Link>
                ))}
              </div>

              <div className="mt-5">
                <p className="label mb-1.5">
                  Available audio
                </p>
                <DubChips dubs={anime.dubs} max={9} includeOriginal />
              </div>
            </div>

            <div className="mt-5 max-w-md">
              <VerdictBox anime={anime} />
            </div>

            <EpisodeList anime={anime} />
          </div>

          <aside className="space-y-3">
            <div className="surface p-4">
              <p className="label">Details</p>
              <dl className="mt-2 space-y-2 text-[12px]">
                {[
                  ['Studio', anime.studio],
                  ['Season', anime.year],
                  ['Episodes', anime.episodes],
                  ['Status', anime.status],
                  ['Format', anime.type]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-zinc-500">{k}</dt>
                    <dd className="text-right font-medium text-zinc-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        <div className="px-0">
          <Rail title="More like this" items={anime.related || related(anime)} />
        </div>
      </div>
    </div>
  )
}
