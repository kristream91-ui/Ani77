'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/lib/store.jsx'
import { useT, UI_LANGS } from '@/lib/i18n.jsx'
import * as I from './icons.jsx'

const nav = [
  { href: '/', key: 'home', Icon: I.Compass, exact: true },
  { href: '/browse', key: 'browse', Icon: I.Grid4 },
  { href: '/search', key: 'search', Icon: I.Search },
  { href: '/list', key: 'myList', Icon: I.Bookmark },
  { href: '/profile', key: 'profile', Icon: I.User }
]

const isActive = (pathname, href, exact) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

/** Static backdrop — one painted gradient, no blur filters, no animation. */
function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <div className="absolute inset-0 bg-ink-950" />
      <div
        className="absolute inset-x-0 top-0 h-[420px]"
        style={{
          backgroundImage: 'radial-gradient(120% 100% at 50% -40%, rgba(0,163,255,0.16), transparent 62%)'
        }}
      />
    </div>
  )
}

function Logo({ compact = false }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Ani77 home">
      <img
        src="/ani77-logo.webp"
        alt=""
        width="32"
        height="32"
        className="size-8 rounded-full object-cover ring-1 ring-white/15"
      />
      {!compact && (
        <span className="font-display text-[17px] font-extrabold tracking-tight text-white">
          ANI<span className="text-brand">77</span>
        </span>
      )}
    </Link>
  )
}

function LangPicker() {
  const { prefs, setPrefs } = useApp()
  return (
    <label className="relative hidden sm:block">
      <span className="sr-only">Interface language</span>
      <I.Globe size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
      <select value={prefs.ui} onChange={(e) => setPrefs({ ui: e.target.value })} className="select pl-8 pr-5">
        {UI_LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  )
}

function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [q, setQ] = useState('')

  const submit = (e) => {
    e.preventDefault()
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search')
  }

  const links = [
    { href: '/', label: 'Home', exact: true },
    { href: '/browse', label: 'Browse' },
    { href: '/list', label: 'My List' }
  ]

  return (
    <header className="sticky top-0 z-nav border-b border-white/[0.06] bg-ink-950/95">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-4 lg:h-16 lg:px-8">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-tiny+ font-semibold transition-colors duration-200 ${
                isActive(pathname, l.href, l.exact)
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="relative ml-auto hidden max-w-xs flex-1 md:block">
          <I.Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anime, studio, genre…"
            className="field h-9 pl-9 pr-3 text-tiny+"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <LangPicker />
          <Link href="/browse" aria-label="Browse" className="btn-icon size-9 max-lg:hidden">
            <I.Grid4 size={17} />
          </Link>
          <Link href="/list" aria-label="My list" className="btn-icon size-9 max-lg:hidden">
            <I.Bookmark size={17} />
          </Link>
          <Link href="/search" aria-label="Search" className="btn-icon size-9 md:hidden">
            <I.Search size={17} />
          </Link>
          <Link href="/profile" aria-label="Profile" className="ml-0.5 shrink-0">
            <span className="accent-grad grid size-8 place-items-center rounded-full text-2xs font-bold text-ink-950 ring-2 ring-white/10">
              AK
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  const t = useT()
  const pathname = usePathname()
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-bar border-t border-white/[0.08] bg-ink-950/95 lg:hidden">
      <div className="flex items-stretch justify-around">
        {nav.map(({ href, key, Icon, exact }) => {
          const active = isActive(pathname, href, exact)
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-1 pb-1 pt-2"
            >
              <Icon
                size={21}
                className={`transition-transform duration-200 ${active ? 'scale-105 text-brand' : 'text-zinc-500'}`}
              />
              <span className={`text-3xs font-medium transition-colors ${active ? 'text-brand' : 'text-zinc-500'}`}>
                {t(key)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function Shell({ children }) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className="min-h-screen">
      <AppBackground />
      <Header />
      {/* keyed on pathname so every navigation replays the entrance */}
      <main key={pathname} className="animate-pageIn pb-20 lg:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
