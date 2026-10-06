<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Anker Solutions – utleie

- Alt skrives på bokmål: grensesnitt, variabelnavn, kommentarer og commit-meldinger.
  Ord fra API-er vi ikke eier (Vipps, Stripe, Resend) beholder sin skrivemåte.
- Firmaopplysninger står bare i `src/data/firma.ts`, utvalget bare i `src/data/maskiner.ts`.
- Priser lagres i hele kroner **inkl. mva**. Eks. mva regnes ut (`src/lib/pris.ts`).
- Serveren regner alltid prisen på nytt. Beløp fra nettleseren brukes aldri.
- Hemmelige nøkler bare i `.env.local` / Vercel. Navnene står i `.env.example`.
- Tester: `npm test` (node:test). Sjekk også `npm run typecheck`, `npm run lint` og `npm run build`.
