// Utvalget. Priser er hele kroner INKL. mva — eks. mva regnes ut i
// src/lib/pris.ts. Ukepris gjelder for hele uker; for resten av dagene
// betaler kunden døgnpris, men aldri mer enn én ukepris.
//
// Tall, priser og spesifikasjoner er realistiske plassholdere. Anker
// Solutions må gå gjennom og rette dem mot egen maskinpark.

export type KategoriId =
  | 'gravemaskiner'
  | 'lastere-og-dumpere'
  | 'komprimering'
  | 'sag-og-hage'
  | 'bygg-og-riving'
  | 'strom-luft-og-varme'
  | 'henger'

export type PiktogramId =
  | 'graver'
  | 'laster'
  | 'dumper'
  | 'beltedumper'
  | 'vibroplate'
  | 'stamper'
  | 'motorsag'
  | 'stangsag'
  | 'flishugger'
  | 'stubbefres'
  | 'jordfreser'
  | 'borhammer'
  | 'meiselhammer'
  | 'kappsag'
  | 'spyler'
  | 'aggregat'
  | 'kompressor'
  | 'varmer'
  | 'torker'
  | 'henger'
  | 'maskinhenger'

export type Kategori = {
  id: KategoriId
  nr: string
  navn: string
  kort: string
  piktogram: PiktogramId
}

export type Maskin = {
  slug: string
  /** Vår egen kode. Står på maskinen og på kvitteringen. */
  kode: string
  navn: string
  kategori: KategoriId
  piktogram: PiktogramId
  /** Størrelse på piktogrammet i forhold til de andre i samme familie. */
  skala?: number
  kort: string
  beskrivelse: string
  dognpris: number
  ukepris: number
  antall: number
  /** Leies bare ut etter avtale: transport, fører eller lang leie. */
  kunForesporsel?: boolean
  /** For tung for kundens egen henger. Må leveres. */
  kreverLevering?: boolean
  nokkeltall: [string, string]
  spesifikasjoner: [string, string][]
  inkludert?: string[]
  merknader?: string[]
  relaterte?: string[]
  ofteLeid?: boolean
}

export const kategorier: Kategori[] = [
  {
    id: 'gravemaskiner',
    nr: '01',
    navn: 'Gravemaskiner',
    kort: 'Minigravere fra 1 tonn, og større maskiner med eller uten fører.',
    piktogram: 'graver',
  },
  {
    id: 'lastere-og-dumpere',
    nr: '02',
    navn: 'Lastere og dumpere',
    kort: 'Flytt masse, grus og paller — fra smale passasjer til åpne tomter.',
    piktogram: 'laster',
  },
  {
    id: 'komprimering',
    nr: '03',
    navn: 'Komprimering',
    kort: 'Vibroplater og stamper til heller, fundament og grøfter.',
    piktogram: 'vibroplate',
  },
  {
    id: 'sag-og-hage',
    nr: '04',
    navn: 'Sag og hage',
    kort: 'Motorsag, flishugger, stubbefres og jordfreser.',
    piktogram: 'motorsag',
  },
  {
    id: 'bygg-og-riving',
    nr: '05',
    navn: 'Bygg og riving',
    kort: 'Borhammer, piggemaskin, kappsag og høytrykkspyler.',
    piktogram: 'borhammer',
  },
  {
    id: 'strom-luft-og-varme',
    nr: '06',
    navn: 'Strøm, luft og varme',
    kort: 'Aggregat, kompressor, byggvarme og byggtørk.',
    piktogram: 'aggregat',
  },
  {
    id: 'henger',
    nr: '07',
    navn: 'Henger',
    kort: 'Tilhenger for førerkort B og maskinhenger med ramper.',
    piktogram: 'henger',
  },
]

const sikkerhetsopplaering =
  'Brukes maskinen i arbeid, må føreren ha dokumentert sikkerhetsopplæring (maskinførerbevis).'

export const maskiner: Maskin[] = [
  // 01 Gravemaskiner
  {
    slug: 'minigraver-1t',
    kode: 'MG-10',
    navn: 'Minigraver 1,0 t',
    kategori: 'gravemaskiner',
    piktogram: 'graver',
    skala: 0.78,
    kort: 'Smal nok for porter og bakgårder.',
    beskrivelse:
      'Liten og lett graver til hage, drenering og kabelgrøfter. Sporvidden kan smales inn til 72 cm, så den kommer gjennom de fleste porter.',
    dognpris: 1290,
    ukepris: 5160,
    antall: 2,
    nokkeltall: ['1 050 kg', '1,8 m gravedybde'],
    spesifikasjoner: [
      ['Driftsvekt', '1 050 kg'],
      ['Gravedybde', '1,8 m'],
      ['Bredde', '72–98 cm'],
      ['Høyde', '2,2 m'],
      ['Drivstoff', 'Diesel'],
    ],
    inkludert: ['Tre skuffer: 25 cm, 40 cm og planeringsskuff', 'Full tank ved utlevering'],
    merknader: ['Fraktes på maskinhenger 3 500 kg, som krever førerkort BE.'],
    relaterte: ['maskinhenger-3500', 'beltedumper-500', 'vibroplate-90'],
  },
  {
    slug: 'minigraver-1-7t',
    kode: 'MG-17',
    navn: 'Minigraver 1,7 t',
    kategori: 'gravemaskiner',
    piktogram: 'graver',
    skala: 0.88,
    kort: 'Allrounder til drenering, fundament og grøfter.',
    beskrivelse:
      'Allrounderen i parken. Stor nok til drenering, fundament og grøfter for vann og avløp — liten nok til å fraktes på maskinhenger.',
    dognpris: 1590,
    ukepris: 6360,
    antall: 3,
    nokkeltall: ['1 720 kg', '2,3 m gravedybde'],
    spesifikasjoner: [
      ['Driftsvekt', '1 720 kg'],
      ['Gravedybde', '2,3 m'],
      ['Rekkevidde', '3,9 m'],
      ['Bredde', '99–130 cm'],
      ['Høyde', '2,4 m'],
      ['Drivstoff', 'Diesel'],
    ],
    inkludert: ['Tre skuffer: 30 cm, 60 cm og planeringsskuff', 'Hurtigfeste', 'Full tank ved utlevering'],
    merknader: [
      'Fraktes på maskinhenger 3 500 kg, som krever førerkort BE.',
      'Bilen må være registrert for å trekke vekten — sjekk vognkortet.',
    ],
    relaterte: ['maskinhenger-3500', 'vibroplate-400', 'beltedumper-500'],
    ofteLeid: true,
  },
  {
    slug: 'minigraver-3-5t',
    kode: 'MG-35',
    navn: 'Minigraver 3,5 t',
    kategori: 'gravemaskiner',
    piktogram: 'graver',
    skala: 0.95,
    kort: 'Med tiltrotator. Til større grøfter og grunnarbeid.',
    beskrivelse:
      'Kraftig minigraver med tiltrotator, som lar skuffa vippe og rotere. Rask på planering og grøfter, og god til grunnarbeid før støp.',
    dognpris: 2190,
    ukepris: 8760,
    antall: 2,
    kreverLevering: true,
    nokkeltall: ['3 600 kg', 'Tiltrotator'],
    spesifikasjoner: [
      ['Driftsvekt', '3 600 kg'],
      ['Gravedybde', '3,1 m'],
      ['Rekkevidde', '5,2 m'],
      ['Bredde', '1,55 m'],
      ['Tiltrotator', 'Ja'],
      ['Drivstoff', 'Diesel'],
    ],
    inkludert: ['Tiltrotator', 'Graveskuff 60 cm', 'Planeringsskuff 120 cm'],
    merknader: ['For tung for vanlig henger. Maskinen leveres og hentes av oss.'],
    relaterte: ['dumper-3t', 'vibroplate-400', 'kompaktlaster'],
  },
  {
    slug: 'gravemaskin-8t',
    kode: 'GM-08',
    navn: 'Gravemaskin 8 t',
    kategori: 'gravemaskiner',
    piktogram: 'graver',
    skala: 1,
    kort: 'Kortsvinger med tiltrotator. Leies med eller uten fører.',
    beskrivelse:
      'Kortsvingsgraver til tomter og veiarbeid der det er trangt. Leies ut etter avtale, med eller uten fører, og vi står for transporten.',
    dognpris: 3490,
    ukepris: 13960,
    antall: 1,
    kunForesporsel: true,
    kreverLevering: true,
    nokkeltall: ['8 200 kg', 'Kan leies med fører'],
    spesifikasjoner: [
      ['Driftsvekt', '8 200 kg'],
      ['Gravedybde', '4,4 m'],
      ['Rekkevidde', '7,0 m'],
      ['Bredde', '2,3 m'],
      ['Tiltrotator', 'Ja'],
      ['Svingradius bak', 'Kortsving'],
    ],
    inkludert: ['Tiltrotator', 'Graveskuff og planeringsskuff'],
    merknader: ['Pris på transport og eventuell fører avtales i forespørselen.', sikkerhetsopplaering],
    relaterte: ['gravemaskin-14t', 'hjullaster-5t', 'dumper-3t'],
  },
  {
    slug: 'gravemaskin-14t',
    kode: 'GM-14',
    navn: 'Gravemaskin 14 t',
    kategori: 'gravemaskiner',
    piktogram: 'graver',
    skala: 1,
    kort: 'Til grunnarbeid og større prosjekter.',
    beskrivelse:
      'Beltegående gravemaskin til grunnarbeid, masseflytting og større grøfter. Leies ut etter avtale, med eller uten fører.',
    dognpris: 4990,
    ukepris: 19960,
    antall: 1,
    kunForesporsel: true,
    kreverLevering: true,
    nokkeltall: ['14 300 kg', 'Kan leies med fører'],
    spesifikasjoner: [
      ['Driftsvekt', '14 300 kg'],
      ['Gravedybde', '5,6 m'],
      ['Rekkevidde', '8,4 m'],
      ['Bredde', '2,5 m'],
      ['Tiltrotator', 'Ja'],
      ['Drivstoff', 'Diesel'],
    ],
    inkludert: ['Tiltrotator', 'Graveskuff og planeringsskuff'],
    merknader: ['Pris på transport og eventuell fører avtales i forespørselen.', sikkerhetsopplaering],
    relaterte: ['gravemaskin-8t', 'hjullaster-5t', 'dumper-3t'],
  },

  // 02 Lastere og dumpere
  {
    slug: 'kompaktlaster',
    kode: 'KL-26',
    navn: 'Kompaktlaster 2,6 t',
    kategori: 'lastere-og-dumpere',
    piktogram: 'laster',
    skala: 0.85,
    kort: 'Flytter masse, grus og paller der hjullasteren blir for stor.',
    beskrivelse:
      'Kompakt og smidig laster til masseflytting, oppfylling og palleløft. Leveres med skuffe og pallegafler.',
    dognpris: 1890,
    ukepris: 7560,
    antall: 1,
    nokkeltall: ['2 600 kg', '900 kg løft'],
    spesifikasjoner: [
      ['Driftsvekt', '2 600 kg'],
      ['Løftekapasitet', '900 kg'],
      ['Løftehøyde', '2,9 m'],
      ['Bredde', '1,55 m'],
      ['Drivstoff', 'Diesel'],
    ],
    inkludert: ['Skuffe 155 cm', 'Pallegafler'],
    merknader: ['Fraktes på maskinhenger 3 500 kg, som krever førerkort BE.'],
    relaterte: ['maskinhenger-3500', 'minigraver-1-7t', 'vibroplate-400'],
  },
  {
    slug: 'hjullaster-5t',
    kode: 'HL-50',
    navn: 'Hjullaster 5 t',
    kategori: 'lastere-og-dumpere',
    piktogram: 'laster',
    skala: 1,
    kort: 'Til gårdsplasser, lasting og masseflytting.',
    beskrivelse:
      'Allsidig hjullaster med skuffe og pallegafler. God til masseflytting, lasting og brøyting. Leies ut etter avtale.',
    dognpris: 2990,
    ukepris: 11960,
    antall: 1,
    kunForesporsel: true,
    kreverLevering: true,
    nokkeltall: ['5 100 kg', 'Kan leies med fører'],
    spesifikasjoner: [
      ['Driftsvekt', '5 100 kg'],
      ['Skuffevolum', '0,9 m³'],
      ['Løftekapasitet', '2 200 kg'],
      ['Bredde', '1,9 m'],
      ['Toppfart', '30 km/t'],
      ['Drivstoff', 'Diesel'],
    ],
    inkludert: ['Skuffe 0,9 m³', 'Pallegafler'],
    merknader: ['Transport og eventuell fører avtales i forespørselen.', sikkerhetsopplaering],
    relaterte: ['kompaktlaster', 'dumper-3t', 'gravemaskin-8t'],
  },
  {
    slug: 'beltedumper-500',
    kode: 'BD-05',
    navn: 'Beltedumper 500 kg',
    kategori: 'lastere-og-dumpere',
    piktogram: 'beltedumper',
    skala: 0.9,
    kort: 'Går gjennom vanlige dører. Frakter masse der trillebåra gir opp.',
    beskrivelse:
      'Beltegående minidumper med høytipp. Bare 69 cm bred, så den kommer gjennom dører og smale passasjer, og den tar seg fram i bratt og bløtt terreng.',
    dognpris: 890,
    ukepris: 3560,
    antall: 3,
    nokkeltall: ['500 kg last', '69 cm bred'],
    spesifikasjoner: [
      ['Lastekapasitet', '500 kg'],
      ['Bredde', '69 cm'],
      ['Tipp', 'Høytipp, 1,2 m'],
      ['Egenvekt', '390 kg'],
      ['Drivstoff', 'Bensin'],
    ],
    merknader: ['Får plass på tilhenger 750 kg, som kan leies sammen med dumperen.'],
    relaterte: ['tilhenger-750', 'minigraver-1t', 'minigraver-1-7t'],
  },
  {
    slug: 'dumper-3t',
    kode: 'DU-30',
    navn: 'Dumper 3 t',
    kategori: 'lastere-og-dumpere',
    piktogram: 'dumper',
    skala: 1,
    kort: 'Svingtipp og firehjulstrekk til byggeplassen.',
    beskrivelse:
      'Midjestyrt dumper med svingtipp, som tømmer til begge sider og rett fram. Til masseflytting på større tomter og byggeplasser.',
    dognpris: 1690,
    ukepris: 6760,
    antall: 2,
    nokkeltall: ['3 000 kg last', 'Svingtipp'],
    spesifikasjoner: [
      ['Lastekapasitet', '3 000 kg'],
      ['Tipp', 'Svingtipp 180°'],
      ['Egenvekt', '2 100 kg'],
      ['Bredde', '1,65 m'],
      ['Drivstoff', 'Diesel'],
    ],
    merknader: ['Fraktes på maskinhenger 3 500 kg, som krever førerkort BE.'],
    relaterte: ['minigraver-3-5t', 'kompaktlaster', 'maskinhenger-3500'],
  },

  // 03 Komprimering
  {
    slug: 'vibroplate-90',
    kode: 'VP-09',
    navn: 'Vibroplate 90 kg',
    kategori: 'komprimering',
    piktogram: 'vibroplate',
    skala: 0.85,
    kort: 'Til hellelegging, gangveier og innkjørsler.',
    beskrivelse:
      'Lett vibroplate som komprimerer grus og pukk under heller og belegningsstein. Med gummimatte kan den også brukes oppå steinen.',
    dognpris: 490,
    ukepris: 1960,
    antall: 4,
    nokkeltall: ['90 kg', '15 kN'],
    spesifikasjoner: [
      ['Vekt', '90 kg'],
      ['Plate', '50 × 58 cm'],
      ['Slagkraft', '15 kN'],
      ['Drivstoff', 'Bensin'],
    ],
    inkludert: ['Gummimatte for belegningsstein', 'Hjulsett for flytting'],
    merknader: ['Får plass i en stasjonsvogn med nedfelte seter. Vær to når den skal løftes.'],
    relaterte: ['hoppetusse', 'kappsag-350', 'tilhenger-750'],
    ofteLeid: true,
  },
  {
    slug: 'vibroplate-400',
    kode: 'VP-40',
    navn: 'Vibroplate 400 kg',
    kategori: 'komprimering',
    piktogram: 'vibroplate',
    skala: 1,
    kort: 'Reversibel. Til fundament, bærelag og større flater.',
    beskrivelse:
      'Tung, reversibel vibroplate til fundament, bærelag og større flater. Kjøres fram og tilbake fra håndtaket.',
    dognpris: 990,
    ukepris: 3960,
    antall: 2,
    nokkeltall: ['410 kg', '65 kN'],
    spesifikasjoner: [
      ['Vekt', '410 kg'],
      ['Arbeidsbredde', '60 cm'],
      ['Slagkraft', '65 kN'],
      ['Retning', 'Fram og tilbake'],
      ['Drivstoff', 'Diesel'],
    ],
    merknader: ['Får plass på tilhenger 750 kg, men må løftes på med maskin.'],
    relaterte: ['minigraver-1-7t', 'hoppetusse', 'tilhenger-750'],
  },
  {
    slug: 'hoppetusse',
    kode: 'ST-07',
    navn: 'Hoppetusse 70 kg',
    kategori: 'komprimering',
    piktogram: 'stamper',
    skala: 1,
    kort: 'Til grøfter og trange steder rundt rør og grunnmur.',
    beskrivelse:
      'Vibrostamper — på folkemunne hoppetusse. Komprimerer i grøfter, rundt kummer og inntil grunnmur, der vibroplaten ikke kommer til.',
    dognpris: 550,
    ukepris: 2200,
    antall: 2,
    nokkeltall: ['70 kg', '28 × 33 cm fot'],
    spesifikasjoner: [
      ['Vekt', '70 kg'],
      ['Fot', '28 × 33 cm'],
      ['Slagkraft', '14 kN'],
      ['Drivstoff', 'Bensin, 4-takt'],
    ],
    relaterte: ['vibroplate-90', 'minigraver-1t', 'beltedumper-500'],
  },

  // 04 Sag og hage
  {
    slug: 'motorsag-40',
    kode: 'MS-40',
    navn: 'Motorsag 40 cm',
    kategori: 'sag-og-hage',
    piktogram: 'motorsag',
    skala: 1,
    kort: 'Til felling, kvisting og ved.',
    beskrivelse:
      'Lett og driftssikker motorsag med 40 cm sverd. Passer til felling av mindre trær, kvisting og kapping av ved.',
    dognpris: 390,
    ukepris: 1560,
    antall: 5,
    nokkeltall: ['40 cm sverd', '4,9 kg'],
    spesifikasjoner: [
      ['Sverd', '40 cm'],
      ['Effekt', '2,3 kW'],
      ['Vekt', '4,9 kg'],
      ['Drivstoff', 'Ferdigblandet bensin, 2-takt'],
    ],
    inkludert: ['Full tank ferdigblandet bensin', 'Kjedeolje', 'Sverdbeskytter'],
    merknader: ['Bruk alltid hjelm med visir og hørselvern, sagbukse og vernestøvler.'],
    relaterte: ['stangsag', 'flishugger', 'tilhenger-750'],
    ofteLeid: true,
  },
  {
    slug: 'stangsag',
    kode: 'SS-04',
    navn: 'Stangsag, batteri',
    kategori: 'sag-og-hage',
    piktogram: 'stangsag',
    skala: 1,
    kort: 'Kvister høyt oppe uten stige.',
    beskrivelse:
      'Batteridrevet stangsag med teleskopskaft. Når greiner opptil fire meter over bakken, uten stige.',
    dognpris: 350,
    ukepris: 1400,
    antall: 2,
    nokkeltall: ['Rekker 4 m', 'Batteri'],
    spesifikasjoner: [
      ['Rekkevidde', 'ca. 4 m'],
      ['Sverd', '30 cm'],
      ['Vekt', '4,5 kg'],
      ['Batteri', '36 V, to stk.'],
    ],
    inkludert: ['To batterier og lader'],
    relaterte: ['motorsag-40', 'flishugger', 'tilhenger-750'],
  },
  {
    slug: 'flishugger',
    kode: 'FH-15',
    navn: 'Flishugger 15 cm',
    kategori: 'sag-og-hage',
    piktogram: 'flishugger',
    skala: 1,
    kort: 'Gjør greiner om til flis. Står på egen henger.',
    beskrivelse:
      'Bensindrevet flishugger på egen henger. Tar greiner og stammer opptil 15 cm og blåser flisen rett i en tilhenger eller i en haug.',
    dognpris: 1790,
    ukepris: 7160,
    antall: 1,
    nokkeltall: ['Opptil 15 cm', 'På henger'],
    spesifikasjoner: [
      ['Maks diameter', '15 cm'],
      ['Motor', 'Bensin, 22 hk'],
      ['Tillatt totalvekt', '750 kg'],
      ['Kobling', 'Kulekobling 50 mm'],
    ],
    merknader: ['Trekkes med vanlig bil med hengerfeste. Førerkort B holder.'],
    relaterte: ['motorsag-40', 'stangsag', 'tilhenger-750'],
  },
  {
    slug: 'stubbefres',
    kode: 'SF-35',
    navn: 'Stubbefres',
    kategori: 'sag-og-hage',
    piktogram: 'stubbefres',
    skala: 1,
    kort: 'Fjerner stubber ned under bakkenivå.',
    beskrivelse:
      'Fresen spiser seg ned i stubben og etterlater flis, så du slipper å grave den opp. Kommer gjennom de fleste porter.',
    dognpris: 990,
    ukepris: 3960,
    antall: 1,
    nokkeltall: ['35 cm fresehjul', '70 cm bred'],
    spesifikasjoner: [
      ['Fresehjul', '35 cm'],
      ['Freser ned til', '20 cm under bakken'],
      ['Bredde', '70 cm'],
      ['Motor', 'Bensin, 13 hk'],
      ['Vekt', '165 kg'],
    ],
    merknader: ['Sjekk at det ikke ligger kabler eller rør i bakken før du starter.'],
    relaterte: ['motorsag-40', 'flishugger', 'tilhenger-750'],
  },
  {
    slug: 'jordfreser',
    kode: 'JF-60',
    navn: 'Jordfreser',
    kategori: 'sag-og-hage',
    piktogram: 'jordfreser',
    skala: 1,
    kort: 'Gjør jorda klar til plen og kjøkkenhage.',
    beskrivelse:
      'Jordfreser som løsner og blander jorda. Til nye bed, kjøkkenhage og plen som skal legges om.',
    dognpris: 590,
    ukepris: 2360,
    antall: 2,
    nokkeltall: ['60 cm bredde', 'Bensin'],
    spesifikasjoner: [
      ['Arbeidsbredde', '60 cm'],
      ['Arbeidsdybde', 'opptil 25 cm'],
      ['Motor', 'Bensin, 6,5 hk'],
      ['Vekt', '75 kg'],
    ],
    relaterte: ['tilhenger-750', 'stubbefres', 'vibroplate-90'],
  },

  // 05 Bygg og riving
  {
    slug: 'borhammer',
    kode: 'BH-02',
    navn: 'Borhammer SDS-plus',
    kategori: 'bygg-og-riving',
    piktogram: 'borhammer',
    skala: 1,
    kort: 'Borer i betong og mur. Kan meisle.',
    beskrivelse:
      'Kombihammer til boring i betong, mur og stein, med meiselfunksjon for lettere piggearbeid.',
    dognpris: 250,
    ukepris: 1000,
    antall: 6,
    nokkeltall: ['3 J', '230 V'],
    spesifikasjoner: [
      ['Slagenergi', '3 J'],
      ['Feste', 'SDS-plus'],
      ['Bor i betong', 'opptil 26 mm'],
      ['Vekt', '3,1 kg'],
      ['Strøm', '230 V'],
    ],
    inkludert: ['Koffert', 'Sidehåndtak og dybdestopp'],
    relaterte: ['meiselhammer', 'kappsag-350', 'aggregat-6'],
  },
  {
    slug: 'meiselhammer',
    kode: 'MH-30',
    navn: 'Meiselhammer 30 kg',
    kategori: 'bygg-og-riving',
    piktogram: 'meiselhammer',
    skala: 1,
    kort: 'Piggemaskin til riving av betong, mur og flis.',
    beskrivelse:
      'Tung meiselhammer — piggemaskin — til riving av betong, mur og fliser. Leveres med spiss- og flatmeisel.',
    dognpris: 690,
    ukepris: 2760,
    antall: 2,
    nokkeltall: ['65 J', '30 kg'],
    spesifikasjoner: [
      ['Slagenergi', '65 J'],
      ['Feste', '28 mm sekskant'],
      ['Vekt', '30 kg'],
      ['Strøm', '230 V, 2 000 W'],
    ],
    inkludert: ['Spissmeisel og flatmeisel', 'Tralle'],
    merknader: ['Bruk hørselvern, vernebriller og støvmaske.'],
    relaterte: ['borhammer', 'kappsag-350', 'tilhenger-750'],
  },
  {
    slug: 'kappsag-350',
    kode: 'KS-35',
    navn: 'Kappsag 350 mm',
    kategori: 'bygg-og-riving',
    piktogram: 'kappsag',
    skala: 1,
    kort: 'Kapper betong, stein og asfalt. Med vannkjøling.',
    beskrivelse:
      'Bensindrevet kappsag med diamantblad og vannkjøling som binder støvet. Kapper heller, kantstein, betong og asfalt.',
    dognpris: 690,
    ukepris: 2760,
    antall: 2,
    nokkeltall: ['350 mm blad', '125 mm dybde'],
    spesifikasjoner: [
      ['Bladdiameter', '350 mm'],
      ['Skjæredybde', '125 mm'],
      ['Motor', 'Bensin, 2-takt'],
      ['Vekt', '10 kg'],
      ['Vannkjøling', 'Ja'],
    ],
    merknader: ['Bladet måles ved utlevering og retur. Slitasje faktureres etter prisliste.'],
    relaterte: ['vibroplate-90', 'meiselhammer', 'hoytrykkspyler'],
  },
  {
    slug: 'hoytrykkspyler',
    kode: 'HS-20',
    navn: 'Høytrykkspyler 200 bar',
    kategori: 'bygg-og-riving',
    piktogram: 'spyler',
    skala: 1,
    kort: 'Vasker fasade, terrasse og maskiner.',
    beskrivelse:
      'Bensindrevet høytrykkspyler til tøff rengjøring: fasader, belegningsstein, terrasser og anleggsmaskiner. Trenger bare en hageslange.',
    dognpris: 590,
    ukepris: 2360,
    antall: 2,
    nokkeltall: ['200 bar', '15 l/min'],
    spesifikasjoner: [
      ['Trykk', '200 bar'],
      ['Vannmengde', '15 l/min'],
      ['Motor', 'Bensin'],
      ['Slange', '10 m'],
      ['Vanntilførsel', 'Hageslange'],
    ],
    inkludert: ['Lanse med tre dyser', 'Terrassevasker'],
    relaterte: ['aggregat-6', 'kappsag-350', 'tilhenger-750'],
  },

  // 06 Strøm, luft og varme
  {
    slug: 'aggregat-6',
    kode: 'AG-06',
    navn: 'Aggregat 6 kVA',
    kategori: 'strom-luft-og-varme',
    piktogram: 'aggregat',
    skala: 1,
    kort: 'Strøm på hytta, byggeplassen eller arrangementet.',
    beskrivelse:
      'Bensindrevet strømaggregat med uttak for 230 V og 400 V. Gir strøm til verktøy, lys og byggvarme der det ikke er strøm fra før.',
    dognpris: 590,
    ukepris: 2360,
    antall: 3,
    nokkeltall: ['6 kVA', '230 / 400 V'],
    spesifikasjoner: [
      ['Effekt', '6 kVA'],
      ['Uttak', '2 × 230 V, 1 × 400 V 16 A'],
      ['Motor', 'Bensin'],
      ['Driftstid', 'ca. 8 t på full tank'],
      ['Vekt', '90 kg'],
    ],
    relaterte: ['byggvarmer', 'kompressor', 'borhammer'],
  },
  {
    slug: 'kompressor',
    kode: 'KO-25',
    navn: 'Kompressor 2,5 m³',
    kategori: 'strom-luft-og-varme',
    piktogram: 'kompressor',
    skala: 1,
    kort: 'Trykkluft til meisler, blåsing og trykkluftverktøy.',
    beskrivelse:
      'Dieseldrevet kompressor på henger. Gir nok luft til en trykkluftmeisel eller flere verktøy samtidig.',
    dognpris: 1290,
    ukepris: 5160,
    antall: 1,
    nokkeltall: ['2,5 m³/min', '7 bar'],
    spesifikasjoner: [
      ['Luftmengde', '2,5 m³/min'],
      ['Arbeidstrykk', '7 bar'],
      ['Uttak', '2 stk.'],
      ['Motor', 'Diesel'],
      ['Tillatt totalvekt', '750 kg'],
    ],
    merknader: ['Trekkes med vanlig bil med hengerfeste. Førerkort B holder.'],
    relaterte: ['meiselhammer', 'aggregat-6', 'hoytrykkspyler'],
  },
  {
    slug: 'byggvarmer',
    kode: 'BV-30',
    navn: 'Byggvarmer 30 kW',
    kategori: 'strom-luft-og-varme',
    piktogram: 'varmer',
    skala: 1,
    kort: 'Indirekte fyrt. Varmer opp uten røyk inne.',
    beskrivelse:
      'Dieseldrevet byggvarmer med røykrør, så avgassene ledes ut. Til oppvarming og uttørking av bygg, telt og garasjer.',
    dognpris: 690,
    ukepris: 2760,
    antall: 3,
    nokkeltall: ['30 kW', 'Indirekte fyrt'],
    spesifikasjoner: [
      ['Effekt', '30 kW'],
      ['Type', 'Indirekte fyrt, diesel'],
      ['Tank', '50 l'],
      ['Forbruk', 'ca. 2,5 l/t'],
      ['Strøm', '230 V'],
    ],
    inkludert: ['Termostat', 'Røykrør'],
    merknader: ['Røykrøret må føres ut. Les bruksanvisningen før start.'],
    relaterte: ['byggtorker', 'aggregat-6', 'kompressor'],
  },
  {
    slug: 'byggtorker',
    kode: 'BT-50',
    navn: 'Byggtørker 50 l',
    kategori: 'strom-luft-og-varme',
    piktogram: 'torker',
    skala: 1,
    kort: 'Tørker ut fukt etter vannskade og støp.',
    beskrivelse:
      'Avfukter som trekker fukt ut av lufta etter vannskade, støp eller maling. Leveres med slange, så den kan tømme seg selv i sluk.',
    dognpris: 390,
    ukepris: 1560,
    antall: 4,
    nokkeltall: ['50 l per døgn', '230 V'],
    spesifikasjoner: [
      ['Kapasitet', '50 l per døgn'],
      ['Luftmengde', '500 m³/t'],
      ['Strøm', '230 V, 750 W'],
      ['Vekt', '35 kg'],
    ],
    inkludert: ['Avløpsslange 5 m'],
    relaterte: ['byggvarmer', 'aggregat-6', 'hoytrykkspyler'],
  },

  // 07 Henger
  {
    slug: 'tilhenger-750',
    kode: 'HE-07',
    navn: 'Tilhenger 750 kg',
    kategori: 'henger',
    piktogram: 'henger',
    skala: 1,
    kort: 'Uten brems. Trekkes med vanlig bil og førerkort B.',
    beskrivelse:
      'Lett tilhenger med plan til hageavfall, materialer og mindre maskiner. Trekkes med vanlig bil og førerkort B.',
    dognpris: 290,
    ukepris: 1160,
    antall: 4,
    nokkeltall: ['750 kg', '250 × 130 cm'],
    spesifikasjoner: [
      ['Tillatt totalvekt', '750 kg'],
      ['Nyttelast', '560 kg'],
      ['Lasteplan', '250 × 130 cm'],
      ['Karmhøyde', '35 cm'],
      ['Kobling', 'Kulekobling 50 mm'],
    ],
    inkludert: ['Presenning og stropper'],
    relaterte: ['beltedumper-500', 'vibroplate-90', 'motorsag-40'],
    ofteLeid: true,
  },
  {
    slug: 'maskinhenger-3500',
    kode: 'HE-35',
    navn: 'Maskinhenger 3 500 kg',
    kategori: 'henger',
    piktogram: 'maskinhenger',
    skala: 1,
    kort: 'Med ramper. Til minigraver, kompaktlaster og dumper.',
    beskrivelse:
      'Bremset maskinhenger med ramper og surringsøyer. Tar minigravere opp til 1,7 tonn, kompaktlaster og dumper.',
    dognpris: 690,
    ukepris: 2760,
    antall: 2,
    nokkeltall: ['3 500 kg', 'Ramper'],
    spesifikasjoner: [
      ['Tillatt totalvekt', '3 500 kg'],
      ['Nyttelast', '2 700 kg'],
      ['Lasteplan', '360 × 180 cm'],
      ['Brems', 'Ja'],
      ['Førerkort', 'BE'],
    ],
    merknader: ['Krever førerkort BE, og bilen må være registrert for å trekke vekten. Sjekk vognkortet.'],
    relaterte: ['minigraver-1-7t', 'kompaktlaster', 'dumper-3t'],
  },
]

export function finnMaskin(slug: string): Maskin | undefined {
  return maskiner.find((m) => m.slug === slug)
}

export function finnKategori(id: string): Kategori | undefined {
  return kategorier.find((k) => k.id === id)
}

export function maskinerIKategori(id: KategoriId): Maskin[] {
  return maskiner.filter((m) => m.kategori === id)
}
