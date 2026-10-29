/**
 * Catalog access layer.
 *
 * If VITE_API_BASE is set, requests go to the FastAPI backend.
 * Otherwise everything is answered from the bundled catalog, so the app is
 * fully usable with zero backend — handy for demos and static hosting.
 */
import bundled from '../data/catalog.json'

const BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')
export const usingApi = Boolean(BASE)

const ALL = bundled.anime

async function jget(path) {
  const r = await fetch(BASE + path)
  if (!r.ok) throw new Error(`${path} -> ${r.status}`)
  return r.json()
}

const sorters = {
  popularity: (a, b) => b.popularity - a.popularity || b.score - a.score,
  score: (a, b) => b.score - a.score || b.popularity - a.popularity,
  year: (a, b) => b.year - a.year || a.title.localeCompare(b.title),
  title: (a, b) => a.title.localeCompare(b.title)
}

export function localQuery({ q = '', genre = '', language = '', type = '', sort = 'popularity' } = {}) {
  let items = ALL.slice()
  if (q) {
    const n = q.trim().toLowerCase()
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(n) ||
        a.studio.toLowerCase().includes(n) ||
        a.genres.some((g) => g.toLowerCase().includes(n))
    )
  }
  if (genre) items = items.filter((a) => a.genres.includes(genre))
  if (language) items = items.filter((a) => a.dubs.includes(language))
  if (type) items = items.filter((a) => a.type === type)
  return items.sort(sorters[sort] || sorters.popularity)
}

export const catalog = ALL

export const genres = [...new Set(ALL.flatMap((a) => a.genres))].sort()

/** Canonical audio order — Japanese (original) first, then dubs. */
export const AUDIO_LANGUAGES = bundled.audioLanguages || [
  'Japanese', 'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Malayalam', 'Kannada'
]

const LANG_LABEL = bundled.languages || {}

/** Display name for an audio track, e.g. 'Japanese' -> 'Japanese (Original)'. */
export const labelFor = (code) => LANG_LABEL[code] || code

export const languages = AUDIO_LANGUAGES

export function getAnime(id) {
  return ALL.find((a) => a.id === id) || null
}

export function episodesFor(anime, count = 24) {
  const n = Math.min(anime.episodes, count)
  return Array.from({ length: n }, (_, i) => ({
    number: i + 1,
    title: `Episode ${i + 1}`,
    runtime: anime.runtime
  }))
}

export function rails() {
  const hero = ALL.slice()
    .sort((a, b) => b.popularity * b.score - a.popularity * a.score)
    .slice(0, 3)
  return {
    hero,
    trending: ALL.slice().sort((a, b) => b.popularity - a.popularity).slice(0, 12),
    newest: ALL.slice().sort((a, b) => b.year - a.year).slice(0, 12),
    topRated: ALL.slice().sort(sorters.score).slice(0, 12),
    hindiDub: ALL.filter((a) => a.dubs.includes('Hindi'))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 12),
    movies: ALL.filter((a) => a.type === 'Movie')
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }
}

export function related(anime, limit = 8) {
  return ALL.filter((a) => a.id !== anime.id)
    .map((a) => ({ a, overlap: a.genres.filter((g) => anime.genres.includes(g)).length }))
    .filter((x) => x.overlap > 0)
    .sort((x, y) => y.overlap - x.overlap || y.a.score - x.a.score)
    .slice(0, limit)
    .map((x) => x.a)
}

/** Recommendations: local mirror of the Python recommender, used when there is no API. */
export function localRecommend({ list = {}, prefs = {} } = {}, limit = 12) {
  const weights = { watching: 1, completed: 1, onhold: 0.6, planned: 0.5, dropped: -0.8 }
  const profile = {}
  const bump = (k, v) => (profile[k] = (profile[k] || 0) + v)

  for (const [id, entry] of Object.entries(list)) {
    const a = getAnime(id)
    if (!a) continue
    let w = weights[entry.status] ?? 0.5
    if (entry.score) w *= 0.3 + entry.score / 10
    if (!w) continue
    a.genres.forEach((g) => bump(`g:${g}`, w))
    bump(`s:${a.studio}`, w * 0.35)
    a.dubs.forEach((d) => bump(`d:${d}`, w * 0.55))
  }
  if (prefs.dub) bump(`d:${prefs.dub}`, 2.5)

  const seen = new Set(Object.keys(list))
  const scored = ALL.filter((a) => !seen.has(a.id)).map((a) => {
    let s = 0
    a.genres.forEach((g) => (s += profile[`g:${g}`] || 0))
    s += (profile[`s:${a.studio}`] || 0) * 0.6
    s += (profile[`d:${prefs.dub}`] || 0) * 0.4
    s += a.popularity / 100
    return { a, s }
  })
  scored.sort((x, y) => y.s - x.s)
  return scored.slice(0, limit).map((x) => x.a)
}

export async function fetchRails() {
  if (!usingApi) return rails()
  try {
    return await jget('/api/rails')
  } catch {
    return rails()
  }
}

export async function fetchAnime(id) {
  if (!usingApi) return getAnime(id)
  try {
    return await jget(`/api/anime/${id}`)
  } catch {
    return getAnime(id)
  }
}
