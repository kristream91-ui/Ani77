/** @type {import('next').NextConfig} */

// STATIC_EXPORT=1 next build  ->  emits ./out, deployable to Firebase Hosting / any CDN.
const staticExport = process.env.STATIC_EXPORT === '1'
const apiOrigin = process.env.API_ORIGIN || 'http://localhost:8000'

const nextConfig = {
  reactStrictMode: true,
  ...(staticExport ? { output: 'export', images: { unoptimized: true } } : {}),

  // In dev this lets the browser call /api/* on the same origin and have it hit
  // the Python service. Set NEXT_PUBLIC_API_BASE to skip the proxy entirely.
  ...(staticExport
    ? {}
    : {
        async rewrites() {
          return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }]
        }
      })
}

module.exports = nextConfig
