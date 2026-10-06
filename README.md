# Anker Solutions – utleie av maskiner og verktøy

Nettside for utleie: katalog med 27 maskiner i 7 kategorier, leieliste med
felles periode, betaling med Vipps eller kort, og forespørsel for det som
leies ut etter avtale.

Svart og hvitt, hårfine linjer og tall i monospace — som et teknisk datablad.
Bildene er egne piktogrammer og en teknisk tegning, ikke stockfoto.

## Kom i gang

```bash
npm install
npm run dev        # http://localhost:5180
```

Uten nøkler kjører siden i **testmodus**: betaling simuleres på
`/betaling/test`, og e-post skrives til terminalen i stedet for å sendes.

## Sjekker

```bash
npm test           # prisregning, datoer og validering (node:test)
npm run typecheck
npm run lint
npm run build
```

## Hvor ting ligger

| Hva | Fil |
|---|---|
| Firmaopplysninger (org.nr., adresse, telefon, åpningstider, leveringspris) | `src/data/firma.ts` |
| Utvalget: maskiner, priser, spesifikasjoner | `src/data/maskiner.ts` |
| Prisregning (døgn, ukepris, mva) | `src/lib/pris.ts` |
| Validering av skjemaene | `src/lib/validering.ts`, `src/lib/regler.ts` |
| Leielisten (lagres i nettleseren) | `src/lib/leieliste.ts` |
| Betaling: Vipps, Stripe og testmodus | `src/lib/server/betaling/` |
| E-post (Resend) og e-posttekster | `src/lib/server/epost.ts`, `src/lib/server/epostmaler.ts` |
| Piktogrammer og teknisk tegning | `src/components/Piktogram.tsx`, `src/components/Tegning.tsx` |
| Leievilkår, angrerett og personvern | `src/app/vilkar/`, `src/app/personvern/` |

Priser lagres i hele kroner **inkl. mva**. Bedriftskunder ser dem eks. mva.
Serveren regner alltid prisen på nytt — beløp fra nettleseren brukes aldri.

## Slik virker en bestilling

1. Kunden legger utstyr i leielisten og velger periode. Fra fire døgn er det ukepris.
2. **Betal nå:** beløpet *reserveres* hos Vipps eller på kortet. Firmaet får
   e-post med hele bestillingen med en gang.
3. Kunden kommer tilbake til `/betaling/status`. Siden sjekker betalingen hos
   leverandøren, sender kvittering til kunden og «betalt»-e-post til firmaet.
4. Firmaet bekrefter leien og **trekker beløpet** (capture) i
   portal.vippsmobilepay.com eller dashboard.stripe.com. Kan de ikke levere,
   avbrytes betalingen og beløpet frigjøres.

**Send forespørsel:** ikke bindende. Firmaet får e-post og svarer kunden.
Maskiner merket `kunForesporsel` (store gravemaskiner, hjullaster) kan bare
sendes som forespørsel. Maskiner merket `kreverLevering` kan ikke hentes.

## Miljøvariabler

Se `.env.example`. Lokalt legges de i `.env.local`, på Vercel under
*Settings → Environment Variables*. Ingen av dem skal i git.

| Variabel | Trengs for |
|---|---|
| `NETTSTED_URL` | Lenker tilbake fra Vipps og Stripe. Påkrevd i produksjon. |
| `ORDRE_NOKKEL` | Krypterer bestillingen mens kunden betaler. Påkrevd i produksjon. |
| `VIPPS_CLIENT_ID`, `VIPPS_CLIENT_SECRET`, `VIPPS_SUBSCRIPTION_KEY`, `VIPPS_MSN`, `VIPPS_MILJO` | Vipps (ePayment API) |
| `STRIPE_SECRET_KEY` | Kortbetaling (Stripe Checkout) |
| `RESEND_API_KEY`, `VARSEL_FRA`, `VARSEL_TIL` | E-post |
| `TESTMODUS=på` | Testmodus i produksjon, f.eks. for å vise siden før avtalene er klare |

Lag `ORDRE_NOKKEL` slik:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Før lansering

- [ ] Bytt alle plassholdere i `src/data/firma.ts` (org.nr. `000 000 000`, adresse, telefon, e-post).
- [ ] Gå gjennom priser, antall og spesifikasjoner i `src/data/maskiner.ts`.
- [ ] Les og godkjenn utkastene til leievilkår og personvernerklæring, og fjern «Utkast»-merknaden.
- [ ] Avtale med Vipps MobilePay og/eller Stripe, og legg inn nøklene.
- [ ] Domene verifisert hos Resend, og nøkkelen lagt inn.
- [ ] Databehandleravtaler med Vercel, Resend, Vipps og Stripe.
- [ ] Test én ekte betaling med lite beløp, og trekk/avbryt den i portalen.

## Kjente begrensninger

- **Ingen database.** Bestillinger og forespørsler finnes bare i e-post og hos
  Vipps/Stripe. Firmaet får hele bestillingen på e-post før kunden betaler,
  så ingenting går tapt — men «betalt»-e-posten og kundens kvittering sendes
  bare når kunden kommer tilbake til siden i *samme* nettleser. Vipps kan
  åpne returlenken i en annen nettleser på mobil. Neste steg er webhooks fra
  Vipps og Stripe og en liten database.
- **Ingen ledighetskalender.** Derfor reserveres beløpet først, og trekkes når
  firmaet har bekreftet. Med database kan opptatte datoer sperres i kalenderen.
- Grensen på antall forsøk per IP ligger i minnet til hver serverinstans.
- Vipps- og Stripe-integrasjonen følger leverandørenes dokumentasjon, men er
  ikke prøvd mot ekte kontoer ennå. Test i deres testmiljø før lansering.
