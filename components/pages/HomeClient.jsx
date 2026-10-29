'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/store.jsx'
import { useT } from '@/lib/i18n.jsx'
import { fetchRails, getAnime, localRecommend } from '@/lib/api.js'
import { Grid, PosterArt, Rail, RankCard, SectionHead } from '@/components/Poster.jsx'
import { SkHome } from '@/components/Skeleton.jsx'
import * as I from '@/components/icons.jsx'

function SeeAll({ href }) {
  return (
    <Link
      href={href}
      className="group flex shrink-0 items-center gap-0.5 text-tiny font-semibold text-zinc-400 transition-colors hover:text-brand"
    >
      See all
      <I.ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  )
}

/** Real control, not decoration: re-ranks the Most Interested rail. */
function RankPicker({ value, onChange }) {
  const t = useT()
  return (
    <label className="relative shrink-0">
      <span className="sr-only">Rank by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select h-8 cursor-pointer border-white/[0.12] bg-white/[0.06] pl-3 pr-7 text-2xs font-semibold text-zinc-200"
      >
        <option value="week">{t('thisWeek')}</option>
        <option value="score">Top rated</option>
        <option value="new">Newest</option>
      </select>
      <I.ChevronRight size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400" />
    </label>
  )
}

function ContinueRow({ items }) {
  const t = useT()
  if (!items.length) return null
  return (
    <section className="mt-9">
      <SectionHead title={t('continueWatching')} icon={<I.Clock size={18} />} count={items.length} />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8">
        {items.map(({ anime, episode }, i) => {
          const pct = Math.min(100, Math.round((episode / Math.max(1, anime.episodes)) * 100))
          return (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
              className="group w-[230px] shrink-0 animate-fadeUp overflow-hidden rounded-xl border border-white/[0.07] bg-ink-850 transition-colors hover:border-brand/40 sm:w-[250px]"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <PosterArt anime={anime} className="transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-10 place-items-center rounded-full bg-black/55 text-white transition-colors duration-200 group-hover:bg-brand group-hover:text-ink-950">
                    <I.Play size={15} />
                  </span>
                </span>
                <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-3xs font-semibold text-zinc-200">
                  EP {episode}
                </span>
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
                  <span className="accent-grad block h-full origin-left" style={{ width: `${pct}%` }} />
                </span>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-1 text-tiny+ font-semibold text-white">{anime.title}</p>
                <p className="mt-0.5 text-tiny text-zinc-500">
                  {episode} / {anime.episodes} · {anime.runtime}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default function Home() {
  const t = useT()
  const { list, progress, prefs } = useApp()
  const [data, setData] = useState(null)
  const [rankBy, setRankBy] = useState('week')

  useEffect(() => {
    let live = true
    fetchRails().then((d) => live && setData(d))
    return () => {
      live = false
    }
  }, [])

  const ranked = useMemo(() => {
    if (!data) return []
    const arr = [...data.trending]
    if (rankBy === 'score') arr.sort((a, b) => b.score - a.score)
    else if (rankBy === 'new') arr.sort((a, b) => b.year - a.year)
    return arr.slice(0, 10)
  }, [data, rankBy])

  const continueItems = useMemo(
    () =>
      Object.entries(progress)
        .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
        .slice(0, 8)
        .map(([id, p]) => ({ anime: getAnime(id), episode: p.episode }))
        .filter((x) => x.anime),
    [progress]
  )

  const forYou = useMemo(() => localRecommend({ list, prefs }, 12), [list, prefs])

  if (!data) return <SkHome />

  return (
    <div className="pb-8">
      {/* Most Interested — tinted band, ranked rail */}
      <section className="band border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1600px] px-4 py-5 lg:px-8 lg:py-6">
          <SectionHead
            title={t('mostInterested')}
            icon={<I.Flame size={18} className="text-orange-500" />}
            action={<RankPicker value={rankBy} onChange={setRankBy} />}
          />
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8">
            {ranked.map((a, i) => (
              <RankCard key={a.id} anime={a} rank={i + 1} className="w-[276px] sm:w-[300px]" />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <section className="mt-7">
          <SectionHead
            title={t('talkOfTown')}
            icon={<I.Megaphone size={18} />}
            action={<SeeAll href="/browse" />}
          />
          <Grid items={data.trending} badgeFor={(a, i) => (i === 0 ? 'Hot' : undefined)} />
        </section>

        <ContinueRow items={continueItems} />

        <section className="mt-9">
          <SectionHead title={t('editorsPick')} icon={<I.Heart size={18} />} />
          <Grid items={data.topRated.slice(0, 5)} subtitleFor={(a) => (a.type === 'Movie' ? 'Movie' : 'Series')} />
        </section>

        <Rail
          title={t('newSeason')}
          items={data.newest}
          badgeFor={(a) => (a.year >= 2023 ? 'New' : undefined)}
        />
        <Rail title={t('worthHindi')} items={data.hindiDub} />
        <Rail title={t('movies')} items={data.movies} />
        <Rail
          title={t('forYou')}
          items={forYou}
          icon={<I.Sparkles size={16} className="text-brand" />}
          subtitleFor={(a) => (a.genres[0] ? `${a.genres[0]} • ${a.year}` : undefined)}
        />
      </div>
    </div>
  )
}
