# Logo – Anker Solution

Logoen er tegnet for hånd av Anker Solutions (foto av tusjtegning), og tegnet
opp på nytt som jevne vektorstreker i samme komposisjon: ankeret som A,
«nker», buen og «SOLUTION».

| Fil | Bruk |
|---|---|
| `anker-solution.svg` / `.png` | Hovedlogo, svart. PNG er 2400 px bred med gjennomsiktig bakgrunn. |
| `anker-solution-hvit.svg` / `.png` | Samme i hvitt, til svart bakgrunn. |
| `anker-solution-liggende.svg` / `.png` | På én linje, til smale plasser (toppmeny, e-postsignatur). |
| `anker-solution-liggende-hvit.svg` | Liggende i hvitt. |
| `anker-merke.svg` / `.png` | Bare ankeret, til ikon og profilbilde. |
| `anker-solution-original-strek.svg` | Direkte sporing av tusjstreken, med de ujevne kantene. Til referanse. |

I nettsiden ligger logoen som komponent i `src/components/Logo.tsx`
(variantene `hel`, `liggende` og `merke`), og følger tekstfargen.

Merk: tegningen sier «SOLUTION», mens firmanavnet på siden er «Anker Solutions».
Skal logoen ha S til slutt, legges én bokstav til i `solution`-listen.
