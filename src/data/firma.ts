// Alle opplysninger om firmaet, samlet på ett sted.
//
// VERDIENE ER PLASSHOLDERE. Org.nr., adresse, telefon, e-post, åpningstider
// og leveringspris må byttes ut med Anker Solutions sine egne før siden
// settes i drift. Org.nr. og adresse er lovpålagt i bunnteksten.

export const firma = {
  navn: 'Anker Solutions',
  juridiskNavn: 'Anker Solutions AS',
  orgnr: '000 000 000',
  // Foretaksregisterloven § 10-2: AS skal oppgi register og forretningskontor.
  register: 'Foretaksregisteret',
  forretningskontor: 'Sted',
  mvaRegistrert: true,

  adresse: {
    gate: 'Industriveien 1',
    postnr: '0000',
    sted: 'Sted',
  },
  telefon: '+4740000000',
  telefonVisning: '400 00 000',
  epost: 'post@ankersolutions.no',

  apningstider: [
    { dager: 'Mandag–fredag', kort: 'Man–fre', tid: '07–16' },
    { dager: 'Lørdag', kort: 'Lør', tid: '09–13' },
    { dager: 'Søndag', kort: 'Søn', tid: 'Stengt' },
  ],

  // Fast pris for levering og henting innenfor radiusen. Lenger unna
  // prises i en forespørsel.
  levering: {
    prisInklMva: 1490,
    radiusKm: 20,
  },

  svartid: 'samme virkedag',
} as const

export const adresseLinje = `${firma.adresse.gate}, ${firma.adresse.postnr} ${firma.adresse.sted}`
