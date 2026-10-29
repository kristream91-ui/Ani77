import React, { useRef } from 'react'
import Link from 'next/link'
import { useApp } from '../lib/store.jsx'
import { labelFor } from '../lib/api.js'
import { stagger } from '../lib/motion.jsx'
import { Bookmark, ChevronLeft, ChevronRight, Flame, Play, Star } from './icons.jsx'

function initials(title) {
  const words = title.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** Sample "interested" count, derived from popularity so it stays stable per title. */
export function interestedCount(anime) {
  const n = Math.round(anime.popularity * 517 + (anime.verdicts?.perfection || 0) * 37)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

function metaLine(anime) {
  return `${anime.year} • ${anime.type === 'Movie' ? 'Movie' : `${anime.episodes} eps`}`
}

/** The poster art. Real cover images slot into `posterUrl` when you have them. */
export function PosterArt({ anime, className = '' }) {
  const [c1, c2] = anime.palette || ['#00a3ff', '#0057ff']

  if (anime.posterUrl) {
    // skeleton sits behind the image, so a slow cover shows shimmer, not a hole
    return (
      <div className="skeleton h-full w-full">
        <img
          src={anime.posterUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${className}`}
        />
      </div>
    )
  }

  return (
    <div
      className={`poster-art h-full w-full ${className}`}
      style={{ '--p1': c1, '--p2': c2 }}
      aria-hidden="true"
    >
      <span className="poster-mark">{initials(anime.title)}</span>
    </div>
  )
}

export function Score({ value, className = '' }) {
  if (!value) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-2xs font-semibold text-amber-300 ${className}`}
    >
      <Star size={10} /> {value.toFixed(1)}
    </span>
  )
}

export function DubChips({ dubs = [], max = 3, includeOriginal = false, className = '' }) {
  const list = includeOriginal ? dubs : dubs.filter((d) => d !== 'Japanese')
  const shown = list.slice(0, max)
  const rest = list.length - shown.length

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {shown.map((d) => (
        <span
          key={d}
          className={`rounded border px-1.5 py-0.5 text-2xs ${
            d === 'Japanese'
              ? 'border-white/15 bg-white/10 text-zinc-200'
              : 'border-white/10 bg-white/5 text-zinc-300'
          }`}
        >
          {labelFor(d)}
        </span>
      ))}
      {rest > 0 && <span className="self-center text-2xs text-zinc-500">+{rest}</span>}
    </div>
  )
}

/** Poster, then title and meta underneath — the Moctale card. */
export function PosterCard({ anime, className = '', badge, index = 0, subtitle }) {
  const { statusOf, setStatus } = useApp()
  const status = statusOf(anime.id)

  return (
    <div className={`group relative animate-fadeUp ${className}`} style={stagger(index)}>
      <Link href={`/anime/${anime.id}`} className="block" aria-label={anime.title}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-white/[0.07] transition-colors duration-300 group-hover:ring-brand/60">
          <PosterArt
            anime={anime}
            className="transition-transform duration-500 ease-smooth group-hover:scale-[1.06]"
          />

          {badge && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-brand px-1.5 py-0.5 text-3xs font-bold uppercase tracking-wide text-ink-950">
              {badge}
            </span>
          )}

          <div className="absolute right-1.5 top-1.5">
            <Score value={anime.score} />
          </div>

          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-11 scale-50 place-items-center rounded-full bg-brand/95 text-ink-950 opacity-0 transition duration-300 ease-spring group-hover:scale-100 group-hover:opacity-100">
              <Play size={16} />
            </span>
          </span>
        </div>

        <p className="mt-2 line-clamp-1 text-tiny+ font-semibold text-white transition-colors group-hover:text-brand">
          {anime.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-tiny text-zinc-500">{subtitle || metaLine(anime)}</p>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          setStatus(anime.id, status || 'planned')
        }}
        aria-label={status ? 'Remove from list' : 'Add to list'}
        className={`absolute left-1.5 top-1.5 grid size-7 place-items-center rounded-md transition active:scale-90 max-lg:opacity-100 ${
          status
            ? 'bg-brand text-ink-950 opacity-100'
            : 'bg-black/55 text-zinc-200 opacity-0 group-hover:opacity-100 hover:bg-black/80 focus-visible:opacity-100'
        }`}
      >
        <Bookmark size={13} className={status ? 'fill-current' : ''} />
      </button>
    </div>
  )
}

/** Ranked "Most Interested" card: numeral, thumb, title, meta, interest count. */
export function RankCard({ anime, rank, className = '' }) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className={`group flex shrink-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2 pr-4 transition-colors duration-300 hover:border-brand/40 hover:bg-white/[0.06] ${className}`}
    >
      <span className="rank-num w-8 shrink-0 text-center">{rank}</span>
      <div className="h-[76px] w-[52px] shrink-0 overflow-hidden rounded-lg">
        <PosterArt anime={anime} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-brand">
          {anime.title}
        </p>
        <p className="mt-0.5 text-tiny text-zinc-500">{metaLine(anime)}</p>
        <p className="mt-1 flex items-center gap-1 text-tiny font-semibold text-orange-500">
          <Flame size={12} /> {interestedCount(anime)} Interested
        </p>
      </div>
    </Link>
  )
}

export function SectionHead({ title, icon, action, count }) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        {icon && <span className="shrink-0 text-white">{icon}</span>}
        <h2 className="truncate font-display text-lg font-bold tracking-tight text-white lg:text-xl">{title}</h2>
        {count != null && (
          <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-2xs font-medium text-zinc-500">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  )
}

export function Rail({ title, icon, items, action, badgeFor, subtitleFor }) {
  const scroller = useRef(null)
  const nudge = (dir) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 660), behavior: 'smooth' })
  }
  if (!items?.length) return null

  return (
    <section className="mt-9">
      <SectionHead
        title={title}
        icon={icon}
        action={
          <div className="flex shrink-0 items-center gap-1">
            {action}
            <button onClick={() => nudge(-1)} aria-label="Scroll left" className="btn-icon hidden size-8 lg:grid">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => nudge(1)} aria-label="Scroll right" className="btn-icon hidden size-8 lg:grid">
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />
      <div
        ref={scroller}
        className="no-scrollbar edge-fade -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8"
      >
        {items.map((a, i) => (
          <PosterCard
            key={a.id}
            anime={a}
            index={i}
            badge={badgeFor ? badgeFor(a, i) : undefined}
            subtitle={subtitleFor ? subtitleFor(a) : undefined}
            className="w-[124px] shrink-0 snap-start sm:w-[140px] lg:w-[152px]"
          />
        ))}
      </div>
    </section>
  )
}

export function Grid({ items, badgeFor, subtitleFor }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {items.map((a, i) => (
        <PosterCard
          key={a.id}
          anime={a}
          index={i}
          badge={badgeFor ? badgeFor(a, i) : undefined}
          subtitle={subtitleFor ? subtitleFor(a) : undefined}
        />
      ))}
    </div>
  )
}

export function EmptyState({ title, hint, icon }) {
  return (
    <div className="mt-16 flex animate-fadeUp flex-col items-center text-center">
      <div className="grid size-16 place-items-center rounded-2xl border border-brand/20 bg-brand/5 text-brand">
        {icon}
      </div>
      <p className="mt-4 font-display text-lg font-semibold text-white">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-zinc-500">{hint}</p>}
    </div>
  )
}
