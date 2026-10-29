'use client'

import React from 'react'
import { useApp } from '@/lib/store.jsx'
import { useT, UI_LANGS } from '@/lib/i18n.jsx'
import { languages, labelFor, catalog } from '@/lib/api.js'
import { useCountUp } from '@/lib/motion.jsx'
import * as I from '@/components/icons.jsx'

const ACCENTS = [
  { key: 'ani77', label: 'Ani Blue', c1: '#00a3ff', c2: '#0057ff' },
  { key: 'crimson', label: 'Crimson', c1: '#ff2e63', c2: '#7c3aed' },
  { key: 'violet', label: 'Violet', c1: '#a855f7', c2: '#22d3ee' },
  { key: 'cyan', label: 'Cyan', c1: '#22d3ee', c2: '#3b82f6' },
  { key: 'emerald', label: 'Emerald', c1: '#10b981', c2: '#0ea5e9' },
  { key: 'amber', label: 'Amber', c1: '#f59e0b', c2: '#ef4444' }
]

function Stat({ label, value }) {
  const [ref, n] = useCountUp(value)
  return (
    <div ref={ref} className="px-3 py-3 text-center">
      <p className="font-display text-lg font-extrabold tabular-nums text-white">{n}</p>
      <p className="text-2xs uppercase tracking-wide text-zinc-500">{label}</p>
    </div>
  )
}

function Row({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function Profile() {
  const t = useT()
  const {
    user, prefs, setPrefs, list, progress, syncStatus,
    signIn, signOut, resetAll, firebaseConfigured
  } = useApp()

  const stats = [
    { label: 'In list', value: Object.keys(list).length },
    { label: 'Completed', value: Object.values(list).filter((e) => e.status === 'completed').length },
    { label: 'Episodes', value: Object.values(progress).reduce((n, p) => n + (p.episode || 0), 0) },
    { label: 'Catalog', value: catalog.length }
  ]

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
      <div className="pt-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
          {t('profile')}
        </h1>
      </div>

      {/* identity card */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-ink-850 to-ink-900">
        <div className="accent-grad h-16 opacity-90" />
        <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink-800 font-display text-lg font-extrabold text-white ring-1 ring-white/10">
              {user?.displayName?.[0]?.toUpperCase() || 'K'}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold leading-tight text-white">
                {user?.displayName || 'Guest otaku'}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                {user?.email || (firebaseConfigured ? 'Not signed in' : 'Demo mode · local storage')}
              </p>
              {user && (
                <p
                  className={`mt-1 flex items-center gap-1.5 text-2xs font-medium ${
                    syncStatus === 'error'
                      ? 'text-red-400'
                      : syncStatus === 'synced'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      syncStatus === 'error'
                        ? 'bg-red-400'
                        : syncStatus === 'synced'
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                    }`}
                  />
                  {syncStatus === 'error'
                    ? 'Sync failed — check Firestore rules'
                    : syncStatus === 'synced'
                      ? 'Synced to Firestore'
                      : 'Syncing…'}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={user ? signOut : signIn}
            className={`btn btn-sm ${
              user ? 'border border-white/15 text-zinc-300 hover:text-white' : 'btn-primary'
            }`}
          >
            {user ? <I.LogOut size={14} /> : <I.User size={14} />}
            {user ? 'Sign out' : t('signIn')}
          </button>
        </div>
        <div className="grid grid-cols-4 border-t border-white/5">
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>

      {!firebaseConfigured && (
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-3 text-tiny+ leading-relaxed text-amber-200/90">
          <strong className="font-semibold">Demo mode.</strong> Your list is saved in this browser only.
          Add your <code className="rounded bg-black/30 px-1">VITE_FIREBASE_*</code> keys in{' '}
          <code className="rounded bg-black/30 px-1">.env</code> to switch on Google sign-in and cloud sync.
        </div>
      )}

      {/* preferences */}
      <div className="panel mt-4 px-5">
        <Row label={t('language')} hint="Interface language">
          <div className="flex flex-wrap gap-1.5">
            {UI_LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setPrefs({ ui: l.code })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  prefs.ui === l.code
                    ? 'accent-grad text-white'
                    : 'border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Preferred dub" hint="Boosts matching titles in recommendations">
          <select
            value={prefs.dub}
            onChange={(e) => setPrefs({ dub: e.target.value })}
            className="select bg-ink-800"
          >
            <option value="">No preference</option>
            {languages.map((l) => (
              <option key={l} value={l}>{labelFor(l)}</option>
            ))}
          </select>
        </Row>

        <Row label="Accent colour" hint="Changes the whole app theme">
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setPrefs({ accent: a.key })}
                aria-label={a.label}
                className={`h-8 w-8 rounded-full ring-2 transition ${
                  prefs.accent === a.key ? 'ring-white' : 'ring-transparent hover:ring-white/30'
                }`}
                style={{ backgroundImage: `linear-gradient(135deg, ${a.c1}, ${a.c2})` }}
              />
            ))}
          </div>
        </Row>
      </div>

      {/* danger zone */}
      <div className="panel my-6 p-5">
        <p className="text-sm font-medium text-white">Local data</p>
        <p className="mt-1 text-[11px] text-zinc-500">
          Clears your list, progress and preferences from this device. Cloud data is untouched.
        </p>
        <button
          onClick={resetAll}
          className="btn btn-xs mt-3 border border-red-500/25 text-red-300 hover:bg-red-500/10"
        >
          <I.Trash size={13} /> Reset local data
        </button>
      </div>

      <p className="pb-6 pt-2 text-center text-2xs text-zinc-600">
        Ani77 · React + Tailwind + FastAPI + Firebase · catalog metadata is sample data for development
      </p>
    </div>
  )
}
