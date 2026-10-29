import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { firebaseConfigured, loadFirebase } from './firebase.js'

const KEY = 'ani77:v1'

const DEFAULTS = {
  list: {},          // { animeId: { status, score, addedAt } }
  progress: {},      // { animeId: { episode, updatedAt } }
  verdicts: {},      // { animeId: 'skip' | 'timepass' | 'goforit' | 'perfection' }
  ownerUid: null,    // which account this device's data belongs to
  prefs: { ui: 'en', dub: 'Hindi', accent: 'ani77' },
  recent: []         // recent searches
}

/** Moctale-style verdicts: four words instead of a meaningless 7.4/10. */
export const VERDICTS = [
  { key: 'skip', color: '#ef4444' },
  { key: 'timepass', color: '#f59e0b' },
  { key: 'goforit', color: '#22c55e' },
  { key: 'perfection', color: '#00a3ff' }
]

const ACCENTS = {
  ani77: ['#00a3ff', '#0057ff'],
  crimson: ['#ff2e63', '#7c3aed'],
  violet: ['#a855f7', '#22d3ee'],
  cyan: ['#22d3ee', '#3b82f6'],
  emerald: ['#10b981', '#0ea5e9'],
  amber: ['#f59e0b', '#ef4444']
}

export const STATUSES = ['watching', 'planned', 'completed', 'onhold', 'dropped']

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    return {
      list: parsed.list || {},
      progress: parsed.progress || {},
      verdicts: parsed.verdicts || {},
      ownerUid: parsed.ownerUid || null,
      prefs: { ...DEFAULTS.prefs, ...(parsed.prefs || {}) },
      recent: parsed.recent || []
    }
  } catch {
    return DEFAULTS
  }
}

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(read)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(!firebaseConfigured)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | synced | error
  const [toast, setToast] = useState(null)
  const fb = useRef(null)
  const toastTimer = useRef(null)

  const notify = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  // persist locally on every change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* quota — ignore */
    }
  }, [state])

  // accent CSS variables
  useEffect(() => {
    const [a, b] = ACCENTS[state.prefs.accent] || ACCENTS.ani77
    document.documentElement.style.setProperty('--accent', a)
    document.documentElement.style.setProperty('--accent-2', b)
  }, [state.prefs.accent])

  // boot firebase (only when configured)
  useEffect(() => {
    if (!firebaseConfigured) return
    let unsub = () => {}

    ;(async () => {
      try {
        const f = await loadFirebase()
        if (!f) return
        fb.current = f

        unsub = f.authMod.onAuthStateChanged(f.auth, async (u) => {
          setUser(u)
          setAuthReady(true)
          if (!u) {
            setSyncStatus('idle')
            return
          }

          setSyncStatus('syncing')
          const { db, fsMod } = f

          try {
            // A different account signing in on this device starts clean, so one
            // person's watchlist can never bleed into another's.
            setState((s) =>
              s.ownerUid && s.ownerUid !== u.uid
                ? { ...s, list: {}, progress: {}, verdicts: {}, ownerUid: u.uid }
                : { ...s, ownerUid: u.uid }
            )

            const [listSnap, progSnap] = await Promise.all([
              fsMod.getDocs(fsMod.collection(db, 'users', u.uid, 'list')),
              fsMod.getDocs(fsMod.collection(db, 'users', u.uid, 'progress'))
            ])

            const cloudList = {}
            listSnap.forEach((d) => (cloudList[d.id] = d.data()))

            const cloudProgress = {}
            progSnap.forEach((d) => (cloudProgress[d.id] = d.data()))

            // verdicts live on the list documents, so rebuild the map from them
            const cloudVerdicts = {}
            Object.entries(cloudList).forEach(([id, entry]) => {
              if (entry?.verdict) cloudVerdicts[id] = entry.verdict
            })

            setState((s) => ({
              ...s,
              list: { ...s.list, ...cloudList },
              progress: { ...s.progress, ...cloudProgress },
              verdicts: { ...s.verdicts, ...cloudVerdicts }
            }))

            // profile document — keeps the users/{uid} collection meaningful
            await fsMod.setDoc(
              fsMod.doc(db, 'users', u.uid),
              {
                uid: u.uid,
                displayName: u.displayName || '',
                photoURL: u.photoURL || '',
                locale: (typeof navigator !== 'undefined' && navigator.language) || 'en-IN',
                pref: 'sub',
                updatedAt: Date.now()
              },
              { merge: true }
            )

            setSyncStatus('synced')
          } catch {
            // most often: Firestore rules not deployed, or the API not enabled yet
            setSyncStatus('error')
          }
        })
      } catch {
        setAuthReady(true)
        setSyncStatus('error')
      }
    })()

    return () => unsub()
  }, [])

  const signIn = useCallback(async () => {
    if (!firebaseConfigured) {
      notify('Demo mode — add Firebase keys to sign in for real')
      return null
    }
    const f = await loadFirebase()
    const provider = new f.authMod.GoogleAuthProvider()
    try {
      const res = await f.authMod.signInWithPopup(f.auth, provider)
      notify(`Welcome, ${res.user.displayName?.split(' ')[0] || 'otaku'}`)
      return res.user
    } catch (e) {
      notify('Sign-in cancelled')
      return null
    }
  }, [notify])

  const signOut = useCallback(async () => {
    if (!firebaseConfigured) return
    const f = await loadFirebase()
    await f.authMod.signOut(f.auth)
    notify('Signed out')
  }, [notify])

  const cloudWrite = useCallback(async (kind, animeId, payload) => {
    if (!firebaseConfigured || !fb.current || !user) return
    const { db, fsMod } = fb.current
    try {
      const ref = fsMod.doc(db, 'users', user.uid, kind, animeId)
      if (payload === null) await fsMod.deleteDoc(ref)
      else await fsMod.setDoc(ref, payload, { merge: true })
      setSyncStatus('synced')
    } catch {
      // rules rejected the write, or the device is offline
      setSyncStatus('error')
    }
  }, [user])

  const setStatus = useCallback((animeId, status, title) => {
    setState((s) => {
      const next = { ...s.list }
      if (next[animeId]?.status === status) {
        delete next[animeId]
        cloudWrite('list', animeId, null)
        return { ...s, list: next }
      }
      const entry = { status, score: next[animeId]?.score ?? null, addedAt: next[animeId]?.addedAt || Date.now() }
      next[animeId] = entry
      cloudWrite('list', animeId, { animeId, ...entry })
      return { ...s, list: next }
    })
    const now = state.list[animeId]?.status === status
    notify(now ? 'Removed from your list' : `Saved to ${status}`)
  }, [cloudWrite, notify, state.list])

  const removeFromList = useCallback((animeId) => {
    setState((s) => {
      const next = { ...s.list }
      delete next[animeId]
      return { ...s, list: next }
    })
    cloudWrite('list', animeId, null)
    notify('Removed from your list')
  }, [cloudWrite, notify])

  const rate = useCallback((animeId, score) => {
    setState((s) => {
      const cur = s.list[animeId] || { status: 'completed', addedAt: Date.now() }
      const next = { ...s.list, [animeId]: { ...cur, score } }
      cloudWrite('list', animeId, { animeId, ...next[animeId] })
      return { ...s, list: next }
    })
    notify(`Rated ${score}/10`)
  }, [cloudWrite, notify])

  const setVerdict = useCallback((animeId, verdict) => {
    setState((s) => {
      const next = { ...s.verdicts }
      if (next[animeId] === verdict) delete next[animeId]
      else next[animeId] = verdict
      const entry = { ...(s.list[animeId] || { status: 'completed', addedAt: Date.now() }) }
      entry.verdict = next[animeId] || null
      cloudWrite('list', animeId, { animeId, ...entry })
      return { ...s, verdicts: next, list: { ...s.list, [animeId]: entry } }
    })
    notify(verdict ? 'Verdict saved' : 'Verdict cleared')
  }, [cloudWrite, notify])

  const setProgress = useCallback((animeId, episode) => {
    const payload = { episode, updatedAt: Date.now() }
    setState((s) => ({ ...s, progress: { ...s.progress, [animeId]: payload } }))
    cloudWrite('progress', animeId, { animeId, ...payload })
  }, [cloudWrite])

  const setPrefs = useCallback((patch) => {
    setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }))
  }, [])

  const addRecent = useCallback((q) => {
    const term = q.trim()
    if (!term) return
    setState((s) => ({
      ...s,
      recent: [term, ...s.recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 8)
    }))
  }, [])

  const resetAll = useCallback(() => {
    setState(DEFAULTS)
    notify('Local data cleared')
  }, [notify])

  const value = useMemo(() => ({
    ...state,
    user,
    authReady,
    syncStatus,
    firebaseConfigured,
    statusOf: (id) => state.list[id]?.status || null,
    verdictOf: (id) => state.verdicts[id] || null,
    setVerdict,
    notify,
    signIn,
    signOut,
    setStatus,
    removeFromList,
    rate,
    setProgress,
    setPrefs,
    addRecent,
    resetAll
  }), [state, user, authReady, syncStatus, notify, signIn, signOut, setStatus, removeFromList, rate, setVerdict, setProgress, setPrefs, addRecent, resetAll])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-10">
        {toast && (
          <div className="pointer-events-auto animate-fadeUp rounded-full border border-white/10 bg-ink-800/95 px-4 py-2 text-sm text-zinc-100 shadow-card backdrop-blur">
            {toast}
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside <AppProvider>')
  return v
}
