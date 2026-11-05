/**
 * Calendar helpers shared by the website (Google Calendar links) and the build
 * (static .ics files in /calendar/, which iPhone/Apple Calendar and Outlook open directly).
 */
import { events, SITE_URL, venues, type Lang, type WeddingEvent } from '../content/wedding'

/** First celebration — travel reminders count back from this day. */
export const FIRST_EVENT_START = events[0].start

export const TRAVEL_LEADS = [60, 30, 21, 14, 7, 3] as const
export type TravelLead = (typeof TRAVEL_LEADS)[number]

/** Duration of each celebration in the calendar (minutes). */
const DURATION: Record<string, number> = { dinner: 120, garba: 180, haldi: 120, baraat: 180, wedding: 210 }

const TXT = {
  en: {
    calName: 'Nisarg & Devanshi · Wedding',
    suffix: "Nisarg & Devanshi's Wedding",
    details: (ev: string, venueUrl: string) =>
      `${ev}\n\nDirections: ${venueUrl}\nInvitation & RSVP: ${SITE_URL}`,
    travelTitle: "Book travel for Nisarg & Devanshi's wedding",
    travelDetails:
      `Celebrations: 25–26 January 2027 in Surat, Gujarat.\nWedding ceremony (Hast Melap): Tuesday, 26 January 2027, 7:30 PM, Somiba Party Plot, Bhimrad Canal Road.\n\nBook your tickets and stay, and RSVP if you haven't yet: ${SITE_URL}/#rsvp`,
  },
  hi: {
    calName: 'निसर्ग और देवांशी · विवाह',
    suffix: 'निसर्ग और देवांशी का विवाह',
    details: (ev: string, venueUrl: string) => `${ev}\n\nरास्ता: ${venueUrl}\nनिमंत्रण एवं उपस्थिति: ${SITE_URL}`,
    travelTitle: 'निसर्ग और देवांशी के विवाह के लिए यात्रा बुक करें',
    travelDetails:
      `उत्सव: 25–26 जनवरी 2027, सूरत, गुजरात।\nविवाह संस्कार (हस्त मिलाप): मंगलवार, 26 जनवरी 2027, शाम 7:30 बजे, सोमीबा पार्टी प्लॉट, भीमराड कैनाल रोड।\n\nअपने टिकट और ठहरने की व्यवस्था करें, और यदि अभी तक नहीं किया है तो उपस्थिति बताएं: ${SITE_URL}/#rsvp`,
  },
}

export interface CalItem {
  uid: string
  title: string
  start: Date
  end: Date
  location?: string
  details: string
  /** minutes before start; 0 = at start */
  alarms: number[]
}

const pad = (n: number) => String(n).padStart(2, '0')
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`

export function eventItem(ev: WeddingEvent, lang: Lang): CalItem {
  const v = venues[ev.venueId]
  const start = new Date(ev.start)
  const note = ev.venueNote ? ` — ${ev.venueNote[lang]}` : ''
  return {
    uid: `${ev.id}-2027@nisarg-weds-devanshi.site`,
    title: `${ev.name[lang]} · ${TXT[lang].suffix}`,
    start,
    end: new Date(start.getTime() + (DURATION[ev.id] ?? 120) * 60_000),
    location: `${v.name[lang]}, ${v.address[lang]}`,
    details: TXT[lang].details(`${ev.name[lang]} (${ev.subtitle[lang]})${note}`, v.mapsUrl),
    alarms: ev.highlight ? [24 * 60, 180] : [180],
  }
}

/** Reminder at 10:00 AM IST, `days` before the first celebration. */
export function travelDate(days: TravelLead) {
  const first = new Date(FIRST_EVENT_START)
  const d = new Date(first.getTime() - days * 86_400_000)
  // 10:00 IST = 04:30 UTC on that calendar day (IST has no DST)
  const ist = new Date(d.getTime() + 330 * 60_000)
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 4, 30))
}

export function travelItem(days: TravelLead, lang: Lang): CalItem {
  return travelItemAt(travelDate(days), lang, `${days}d`)
}

/** A guest-chosen date and time, both read as India time (IST, UTC+5:30). */
export function customTravelDate(date: string, time: string): Date | null {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  if (!y || !mo || !d || Number.isNaN(h) || Number.isNaN(mi)) return null
  return new Date(Date.UTC(y, mo - 1, d, h, mi) - 330 * 60_000)
}

/** The first celebration's day as YYYY-MM-DD in IST (the latest sensible reminder date). */
export const LAST_REMINDER_DAY = new Date(new Date(FIRST_EVENT_START).getTime() + 330 * 60_000).toISOString().slice(0, 10)

export function travelItemAt(start: Date, lang: Lang, key = 'custom'): CalItem {
  return {
    uid: `travel-${key}-2027@nisarg-weds-devanshi.site`,
    title: TXT[lang].travelTitle,
    start,
    end: new Date(start.getTime() + 30 * 60_000),
    details: TXT[lang].travelDetails,
    alarms: [0],
  }
}

/* ---------- Google Calendar (best on Android; opens the app or web) ---------- */
export function googleUrl(item: CalItem) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: item.title,
    dates: `${utcStamp(item.start)}/${utcStamp(item.end)}`,
    details: item.details,
    ctz: 'Asia/Kolkata',
  })
  if (item.location) p.set('location', item.location)
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

/* ---------- iCalendar (.ics) — iPhone, Mac, Outlook, Samsung Calendar ---------- */
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** Fold lines at 75 octets as RFC 5545 requires (UTF-8 safe). */
function fold(line: string) {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line
  const out: string[] = []
  let cur = ''
  let limit = 75
  for (const ch of line) {
    if (enc.encode(cur + ch).length > limit) {
      out.push(cur)
      cur = ch
      limit = 74 // continuation lines start with a space
    } else cur += ch
  }
  out.push(cur)
  return out.join('\r\n ')
}

export function buildIcs(items: CalItem[], calName: string, stamp = new Date()) {
  const L: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//nisarg-weds-devanshi.site//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(calName)}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ]
  for (const it of items) {
    L.push(
      'BEGIN:VEVENT',
      `UID:${it.uid}`,
      `DTSTAMP:${utcStamp(stamp)}`,
      `DTSTART:${utcStamp(it.start)}`,
      `DTEND:${utcStamp(it.end)}`,
      `SUMMARY:${esc(it.title)}`,
      `DESCRIPTION:${esc(it.details)}`,
      ...(it.location ? [`LOCATION:${esc(it.location)}`] : []),
      `URL:${SITE_URL}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
    )
    for (const m of it.alarms) {
      L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(it.title)}`, `TRIGGER:${m === 0 ? 'PT0M' : `-PT${m}M`}`, 'END:VALARM')
    }
    L.push('END:VEVENT')
  }
  L.push('END:VCALENDAR')
  return L.map(fold).join('\r\n') + '\r\n'
}

/** Static files emitted at build time → served from /calendar/ */
export function icsFiles(): Record<string, string> {
  const files: Record<string, string> = {}
  for (const lang of ['en', 'hi'] as const) {
    files[`calendar/wedding-${lang}.ics`] = buildIcs(
      events.map((e) => eventItem(e, lang)),
      TXT[lang].calName,
    )
    for (const d of TRAVEL_LEADS) {
      files[`calendar/travel-${d}d-${lang}.ics`] = buildIcs([travelItem(d, lang)], TXT[lang].calName)
    }
  }
  return files
}

export const calendarName = (lang: Lang) => TXT[lang].calName

export const icsPath = (name: string, lang: Lang) => `calendar/${name}-${lang}.ics`
