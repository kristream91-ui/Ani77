# Ani77

An anime discovery and watchlist app built for India, Nepal and Bangladesh — eight audio
tracks (Japanese original plus English, Hindi, Tamil, Telugu, Bengali, Malayalam and Kannada
dubs) are first-class, not an afterthought.

**Next.js 14 (App Router) + Tailwind** on the front, **FastAPI** for the API, **Firebase** for
auth and cloud sync. Runs with no backend and no Firebase keys at all, so you can start it the
minute you clone it.

---

## Stack

| Layer | Tech | Where |
|---|---|---|
| Web app | Next.js 14 (App Router), React 18, Tailwind 3 | `app/`, `components/` |
| API | FastAPI, Pydantic v2, uvicorn | `backend/` |
| Recommender | Pure-Python content-based scoring | `backend/app/recommender.py` |
| Database | Firebase Auth (Google) + Firestore | `lib/firebase.js`, `firestore.rules` |
| Fonts | `next/font/google` — self-hosted at build | `app/layout.jsx` |
| i18n | English (default) / हिन्दी | `lib/i18n.jsx` |

40 seeded titles, 18 genres, 8 audio tracks.

## Features

**Discovery** — a tinted **Most Interested** band with a ranked rail (numeral, thumb, live
interest count) and a real This Week / Top rated / Newest picker; then **Talk of the Town**,
**Editor's Pick**, new season, Hindi-dub, movies and a personalised row. Poster cards put the
title and meta underneath the art.

**Verdicts instead of stars** — every title takes Skip / Timepass / Go for it / Perfection
rather than a meaningless 7.4/10, with the community split shown as a single stacked bar.
Stored per user, synced to Firestore alongside the watchlist.

**Browse** — genre chips, language/type/sort filters, all state in the URL (shareable links
like `/browse?genre=Sports&language=Hindi`).

**Detail** — synopsis, dub availability, studio/season/episode metadata, episode list with
watched ticks, verdicts, and "more like this".

**Watchlist** — five states (watching, planned, completed, on hold, dropped), tabbed with counts.

**Profile** — Google sign-in, interface language (English or Hindi), preferred dub, six accent
themes, episode stats, and a local-data reset.

**Mobile + desktop** — icon tab bar on phones (safe-area aware), full header nav on desktop.
Same components, no separate mobile build.

**Motion** — staggered card entrances, poster zoom and a play button that scales in on hover, a
sheen sweep on primary buttons, count-up stats, scroll reveals, and a short page transition on
every navigation.

**Skeleton screens** — Home and the detail page render a shimmering placeholder that matches
their final layout, so there's no layout jump when data lands. Real cover images get a skeleton
behind them while they decode.

**Built not to lag.** Nothing animates that isn't `transform` or `opacity`. The backdrop is a
single static gradient — no animated blur filters, no `backdrop-filter` on the sticky header or
tab bar, no hero crossfade. Stagger delays are capped so a 40-card grid settles in about half a
second. Everything switches off under `prefers-reduced-motion`.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

That's it — demo mode, bundled catalog, watchlist in `localStorage`.

### Backend (optional)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000/docs
```

Then in `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Leave `NEXT_PUBLIC_API_BASE` blank and the app answers everything from the bundled catalog in
the browser. In dev, `next.config.js` also rewrites `/api/*` to `API_ORIGIN`, so you can call
the Python service same-origin if you prefer.

### Firebase (optional)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add a **Web app** and copy the config into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

3. Enable **Authentication → Google**.
4. Enable **Firestore** and deploy the rules:

```bash
npm i -g firebase-tools
firebase login && firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

The moment those keys exist, `loadFirebase()` switches on: Google sign-in works and the
watchlist mirrors to `users/{uid}/list/{animeId}` and `users/{uid}/progress/{animeId}`. Without
them the app never touches the network for user data.

## Routes

Everything is a real URL — file-based, no client-side router config:

| Route | File | Rendering |
|---|---|---|
| `/` | `app/page.jsx` | static, then client-hydrated |
| `/browse` | `app/browse/page.jsx` | static + `Suspense` (reads search params) |
| `/search` | `app/search/page.jsx` | static + `Suspense` |
| `/anime/[id]` | `app/anime/[id]/page.jsx` | **SSG** — all 40 titles pre-rendered via `generateStaticParams` |
| `/list` | `app/list/page.jsx` | static |
| `/profile` | `app/profile/page.jsx` | static |

Each page is a thin server component that renders a `'use client'` component from
`components/pages/`. The shell (header, tab bar, page transition) lives in
`components/Shell.jsx`, inside the root layout.

## API

The Python service is unchanged by the frontend migration.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness + title count |
| GET | `/api/anime` | filter/sort/paginate (`q`, `genre`, `language`, `type`, `status`, `min_score`, `sort`, `page`, `per_page`) |
| GET | `/api/anime/{id}` | detail + episode list + related |
| GET | `/api/anime/{id}/episodes` | paginated episodes |
| GET | `/api/genres` | genres with counts |
| GET | `/api/languages` | audio language labels |
| GET | `/api/trending` | popularity ranked |
| GET | `/api/rails` | every home-screen row in one round trip |
| POST | `/api/recommend` | content-based recommendations |
| GET | `/api/search/jikan` | live MyAnimeList search proxy |

The recommender builds a weighted feature vector per title (genre 1.0, dub 0.55, studio 0.35,
era 0.30), builds a taste profile from your history — ratings and list status scale each
title's contribution, dropped titles push away — then ranks by cosine similarity with a small
popularity tiebreak. No ML dependency, no model file. The frontend ships a mirror of it in
`lib/api.js` so recommendations still work offline.

## Deploying

### Render (blueprint included)

`render.yaml` defines both services, so Render can create them in one go:

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**
2. Pick this repo. Render reads `render.yaml` and shows two services:
   - `ani77-api` — FastAPI, `rootDir: backend`, health check on `/api/health`
   - `ani77` — Next.js, `npm ci && npm run build`, started with `next start`
3. **Apply**. `NEXT_PUBLIC_API_BASE` is wired to the API's URL automatically via
   `fromService`, so you don't have to copy URLs around.

Both are `plan: free` in `region: singapore`.

Three things to know about the free tier:

- Instances **spin down after ~15 minutes idle** and take ~50s to wake. The frontend is
  unaffected — if the API is cold, `lib/api.js` falls back to the bundled catalog and the UI
  still renders. Only the live `/api/*` calls are slow on the first request.
- `NEXT_PUBLIC_*` values are **inlined at build time**. If the API URL ever changes, trigger a
  redeploy of the web service, not just a restart.
- If `singapore` isn't offered for your account, change `region:` to `oregon` or `frankfurt`
  and re-apply.

To run the frontend on its own, delete the `ani77-api` block and the `NEXT_PUBLIC_API_BASE`
env var from `render.yaml` — the app works fully standalone on the bundled catalog.

### Vercel

Import the repo, set the same env vars, done.

### Firebase Hosting / any static CDN

The app is fully client-side, so a static export works anywhere:

```bash
npm run build:static     # emits ./out
firebase deploy --only hosting
```

`firebase.json` already points at `out` with `cleanUrls` so `/browse` resolves to
`browse.html`. All 40 detail pages are pre-rendered, which is also why they're fast and
indexable.

## Project layout

```
app/
  layout.jsx        root layout: fonts, metadata, providers, shell
  providers.jsx     'use client' — AppProvider wrapper
  globals.css       Tailwind entry + the component/utility layers
  page.jsx          /
  browse/  search/  list/  profile/
  anime/[id]/       SSG detail route
components/
  Shell.jsx         header, tab bar, page transition
  Poster.jsx        PosterCard, RankCard, Rail, Grid, SectionHead, PosterArt
  Skeleton.jsx      SkHome, SkDetail, SkGrid, SkRail
  pages/            the six 'use client' page bodies
  icons.jsx
lib/
  store.jsx         state + localStorage + Firestore sync
  api.js            catalog layer (API or bundled)
  firebase.js       lazy Firebase init
  i18n.jsx          en / hi
  motion.jsx        reveal, count-up, stagger
data/catalog.json   generated — do not hand-edit
backend/            FastAPI service
```

To change the catalog, edit the `A = [...]` list in `backend/gen_catalog.py` and run
`python3 gen_catalog.py` — it rewrites both `backend/app/seed.json` and `data/catalog.json` so
the API and the bundle stay in sync.

## Styling

Tailwind in three deliberate layers, all in `app/globals.css`:

1. **Tokens** (`tailwind.config.js`) — `brand`/`ink`/`aqua` colours, `text-2xs` / `text-tiny`
   sizes, `z-nav` / `z-bar` / `z-toast`, `shadow-glow` / `shadow-poster`, `ease-smooth`, and the
   `bg-grid-lines` / `bg-dot-grid` / `bg-stripes` patterns.
2. **Components** (`@layer components`) — `.btn` + `.btn-primary` / `-secondary` / `-quiet` /
   `-icon` and sizes, `.chip`, `.field`, `.select`, `.surface`, `.panel`, `.label`,
   `.skeleton`, `.poster-art`, `.poster-mark`, `.rank-num`, `.band`, `.palette-grad`.
3. **Utilities** (`@layer utilities`) — the genuine one-offs: `.text-grad`, `.edge-fade`,
   `.sheen`, `.reveal`, `.card-lift`, `.no-scrollbar`, `.safe-bottom`.

A page reads `className="btn btn-primary btn-md"` rather than a twelve-class string.

**Per-title colour** goes through CSS custom properties — `style={{ '--p1': c1, '--p2': c2 }}` —
consumed by `.poster-art` and `.palette-grad`. The only inline styles left are those variables,
dynamic bar widths, and animation delays.

## Fonts

Loaded with `next/font/google`, which downloads and self-hosts them at build time — no request
to `fonts.googleapis.com` at runtime, no layout shift, and a `<link rel="preload">` for the
faces a page actually uses.

| Face | Weights | Used for |
|---|---|---|
| Inter | 400 / 500 / 600 / 700 | all UI text |
| Bricolage Grotesque | 700 / 800 | display headings, rank numerals |
| Noto Sans Devanagari | 400 / 700 | Hindi — Inter has no Devanagari glyphs |

## Brand

- `public/ani77-logo.webp` — the app mark (header)
- `public/favicon.png` — browser icon
- `public/brand/ani77-logo-512.png` — full size, for social cards and store listings

The palette comes from the mark: a blue-black base (`#04060c`), Ani Blue (`#00a3ff`) primary,
`#0057ff` secondary, aqua for highlights. To change it, edit `--accent` / `--accent-2` in
`app/globals.css` and the `ACCENTS` map in `lib/store.jsx`. Users can still override it on the
Profile page.

## Credits and inspiration

The verdict model (Skip / Timepass / Go for it / Perfection) and the poster-rail discovery
layout are inspired by [Moctale](https://www.moctale.in/), an Indian entertainment discovery
platform. Worth a look — they built it for exactly this audience.

## Notes before you launch

- **Metadata is sample data.** Titles, years, studios and episode counts are real-ish for
  development, but the `dubs` flags, scores and community verdict percentages are seeded
  placeholders — verify dub availability against your licensed sources before showing them to
  users. Malayalam and Kannada dubs in particular vary a lot by platform and title. Poster art
  is generated from each title's palette; set `posterUrl` on any catalog entry to use real
  cover images.
- **This is a catalog app, not a streaming site.** There is no video player and no video
  hosting. If you add one you need distribution rights for each title in each territory —
  India, Nepal and Bangladesh are separate licensing markets, and dub rights are usually
  negotiated separately from sub rights.
- The `firestore.rules` file restricts each user to their own documents and whitelists the
  exact fields clients may write. Don't loosen it to `allow write: if true` while debugging.
