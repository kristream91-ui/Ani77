'use client'

import { AppProvider } from '@/lib/store.jsx'

export default function Providers({ children }) {
  return <AppProvider>{children}</AppProvider>
}
