/**
 * Single source of truth for the wedding facts.
 * Every value here comes from the family's printed Gujarati invitation card.
 * Language-specific wording lives in src/i18n/translations.ts.
 */

export type Lang = 'en' | 'hi'
export type L10n = Record<Lang, string>

export type VenueId = 'samajWadi' | 'residence' | 'somiba'
export type EventIcon = 'dinner' | 'garba' | 'haldi' | 'baraat' | 'wedding'

export interface Venue {
  id: VenueId
  name: L10n
  address: L10n
  /** Exact pin from the printed card's QR code where available */
  mapsUrl: string
  /** Query used for the embedded map preview */
  embedQuery: string
}

export interface WeddingEvent {
  id: string
  icon: EventIcon
  name: L10n
  /** Local name shown as a small subtitle (e.g. Gujarati ritual name) */
  subtitle: L10n
  /** ISO date-time with IST offset */
  start: string
  venueId: VenueId
  /** Optional venue note, e.g. "from our residence" */
  venueNote?: L10n
  highlight?: boolean
}

export const SITE_URL = 'https://nisarg-weds-devanshi.site'

export const couple = {
  groom: { en: 'Nisarg', hi: 'निसर्ग' } as L10n,
  bride: { en: 'Devanshi', hi: 'देवांशी' } as L10n,
  groomParents: {
    en: 'Mrs. Jashodaben & Mr. Ajitkumar Ambalal Patel',
    hi: 'श्रीमती जशोदाबेन एवं श्री अजीतकुमार अंबालाल पटेल',
  } as L10n,
  brideParents: {
    en: 'Mrs. Asmitaben & Mr. Dilipkumar Shankarlal Patel',
    hi: 'श्रीमती अस्मिताबेन एवं श्री दिलीपकुमार शंकरलाल पटेल',
  } as L10n,
}

/** Hast Melap — the wedding ceremony. The countdown targets this moment. */
export const WEDDING_START = '2027-01-26T19:30:00+05:30'
export const TIME_ZONE = 'Asia/Kolkata'

export const city: L10n = { en: 'Surat, Gujarat', hi: 'सूरत, गुजरात' }

export const venues: Record<VenueId, Venue> = {
  samajWadi: {
    id: 'samajWadi',
    name: {
      en: '52/22 Kadva Patidar Community Hall',
      hi: '52/22 कड़वा पाटीदार समाज भवन',
    },
    address: {
      en: 'Behind Umiya Mata Temple, Bamroli, Surat, Gujarat',
      hi: 'उमिया माता मंदिर के पीछे, बमरोली, सूरत, गुजरात',
    },
    mapsUrl: 'https://maps.app.goo.gl/W7sAy1bqfWmDQwDC9',
    embedQuery: '52/22 Kadva Patidar Samaj ni Wadi, Bamroli, Surat, Gujarat',
  },
  residence: {
    id: 'residence',
    name: { en: 'Our Residence', hi: 'हमारा निवास' },
    address: {
      en: 'A-701, Marvela Residency, beside Coral Heights, Bhimrad Canal Road, Althan, Surat 395007',
      hi: 'A-701, मारवेला रेसिडेंसी, कोरल हाइट्स के पास, भीमराड कैनाल रोड, अलथाण, सूरत 395007',
    },
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Marvela+Residency+Bhimrad+Canal+Road+Althan+Surat+395007',
    embedQuery: 'Marvela Residency, Bhimrad Canal Road, Althan, Surat 395007',
  },
  somiba: {
    id: 'somiba',
    name: { en: 'Somiba Party Plot', hi: 'सोमीबा पार्टी प्लॉट' },
    address: {
      en: 'Bhimrad Canal Road, Surat, Gujarat',
      hi: 'भीमराड कैनाल रोड, सूरत, गुजरात',
    },
    mapsUrl: 'https://maps.app.goo.gl/sKrfwc3tQ1TJTEiz7',
    embedQuery: 'Somiba Party Plot, Bhimrad Canal Road, Surat, Gujarat',
  },
}

export const events: WeddingEvent[] = [
  {
    id: 'dinner',
    icon: 'dinner',
    name: { en: 'Dinner', hi: 'स्वरुचि भोज' },
    subtitle: { en: 'Swaruchi Bhojan', hi: 'रात्रि भोजन' },
    start: '2027-01-25T18:00:00+05:30',
    venueId: 'samajWadi',
  },
  {
    id: 'garba',
    icon: 'garba',
    name: { en: 'Sangeet Sandhya', hi: 'संगीत संध्या' },
    subtitle: { en: 'An evening of music & dance', hi: 'संगीत और नृत्य की शाम' },
    start: '2027-01-25T20:00:00+05:30',
    venueId: 'samajWadi',
  },
  {
    id: 'haldi',
    icon: 'haldi',
    name: { en: 'Haldi', hi: 'हल्दी' },
    subtitle: { en: 'Haldi Rasam', hi: 'हल्दी रस्म' },
    start: '2027-01-26T08:30:00+05:30',
    venueId: 'samajWadi',
  },
  {
    id: 'baraat',
    icon: 'baraat',
    name: { en: 'Baraat', hi: 'बारात' },
    subtitle: { en: 'Varghodo', hi: 'वरघोड़ा' },
    start: '2027-01-26T16:00:00+05:30',
    venueId: 'residence',
    venueNote: { en: 'Starts from our residence', hi: 'हमारे निवास से प्रारंभ' },
  },
  {
    id: 'wedding',
    icon: 'wedding',
    name: { en: 'Wedding Ceremony', hi: 'विवाह संस्कार' },
    subtitle: { en: 'Hast Melap', hi: 'हस्त मिलाप' },
    start: WEDDING_START,
    venueId: 'somiba',
    highlight: true,
  },
]

/** Contact numbers shown on the website */
export const contacts = [
  { phone: '+919328259776', display: '+91 93282 59776' },
  { phone: '+919668911235', display: '+91 96689 11235' },
]
