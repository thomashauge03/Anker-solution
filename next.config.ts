import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Sikkerhetshoder på alle svar. Ingen CSP her: den krever nøye
  // tilpasning til Next sine inline-skript, og siden har verken
  // brukergenerert HTML eller tredjepartsskript å beskytte mot.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Siden skal ikke kunne legges i en <iframe> på et fremmed
          // nettsted (clickjacking).
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Full URL med bestillingsreferanse skal ikke lekke videre.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Siden bruker ingen av disse.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
