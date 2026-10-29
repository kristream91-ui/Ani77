/**
 * Firebase is optional. If the VITE_FIREBASE_* env vars are absent the app runs
 * in DEMO MODE: watchlist + progress live in localStorage only. Everything else
 * is identical, so you can ship the UI first and add a project later.
 */
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

export const firebaseConfigured = Boolean(cfg.apiKey && cfg.projectId)

let cache = null

/** Lazily loads firebase only when a project is configured, so demo mode stays light. */
export async function loadFirebase() {
  if (!firebaseConfigured) return null
  if (cache) return cache
  const [{ initializeApp }, authMod, fsMod] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore')
  ])
  const app = initializeApp(cfg)
  cache = {
    app,
    auth: authMod.getAuth(app),
    db: fsMod.getFirestore(app),
    authMod,
    fsMod
  }
  return cache
}
