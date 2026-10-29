import { Inter, Bricolage_Grotesque, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Shell from '@/components/Shell'

// next/font self-hosts these at build time: no request to fonts.googleapis.com,
// no layout shift, and the Devanagari face only downloads for pages that need it.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap'
})

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap'
})

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '700'],
  variable: '--font-devanagari',
  display: 'swap'
})

export const metadata = {
  // RENDER_EXTERNAL_URL is set by Render at runtime, so OG/social URLs resolve
  // correctly even if NEXT_PUBLIC_SITE_URL was never configured.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      'http://localhost:3000'
  ),
  title: 'Ani77 — Anime, desi style',
  description:
    'Ani77 — anime for India, Nepal and Bangladesh. Japanese original plus seven dub tracks, watchlists and recommendations.',
  applicationName: 'Ani77',
  openGraph: {
    title: 'Ani77 — Anime, desi style',
    description: 'Japanese original plus seven dub tracks. Watchlists, verdicts and recommendations.',
    images: ['/brand/ani77-logo-512.png']
  }
}

export const viewport = {
  themeColor: '#04060c',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${devanagari.variable}`}>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  )
}
