import { events, TIME_ZONE, venues, type WeddingEvent } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { EventGlyph, IconArrow, IconClock, IconPin } from './Ornaments'
import { Reveal, SectionHead } from './Reveal'

const dayKey = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date(iso))
const dayNum = (iso: string) => new Intl.DateTimeFormat('en-IN', { timeZone: TIME_ZONE, day: 'numeric' }).format(new Date(iso))

function EventCard({ ev, index }: { ev: WeddingEvent; index: number }) {
  const { t, l, fmtTime } = useLang()
  const venue = venues[ev.venueId]
  return (
    <Reveal delay={index * 0.08}>
      <article className={`event-card ${ev.highlight ? 'main' : ''}`} aria-labelledby={`ev-${ev.id}`}>
        {ev.highlight && <span className="main-badge">{t.events.main}</span>}
        <div className="event-icon">
          <EventGlyph name={ev.icon} />
        </div>
        <div>
          <h3 className="event-name" id={`ev-${ev.id}`}>
            {l(ev.name)}
          </h3>
          <div className="event-sub">{l(ev.subtitle)}</div>
          <ul className="event-meta">
            <li>
              <IconClock />
              <span className="time">
                <time dateTime={ev.start}>{fmtTime(ev.start)}</time>
              </span>
            </li>
            <li>
              <IconPin />
              <span>
                {l(venue.name)}
                {ev.venueNote && <span className="note">{l(ev.venueNote)}</span>}
              </span>
            </li>
          </ul>
          <a className="event-link" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
            {t.events.directions}
            <IconArrow width={16} height={16} />
          </a>
        </div>
      </article>
    </Reveal>
  )
}

export function Events() {
  const { t, fmtDate } = useLang()
  const days = new Map<string, WeddingEvent[]>()
  for (const ev of events) {
    const k = dayKey(ev.start)
    days.set(k, [...(days.get(k) ?? []), ev])
  }

  return (
    <section className="section" id="celebrations" aria-labelledby="celebrations-title">
      <div className="container">
        <SectionHead id="celebrations-title" eyebrow={t.events.eyebrow} title={t.events.title} lede={t.events.intro} />
        {[...days.entries()].map(([k, list]) => (
          <div className="day-group" key={k}>
            <Reveal>
              <h3 className="day-title">
                <span className="dnum">{dayNum(list[0].start)}</span>
                {fmtDate(list[0].start, { year: true })}
              </h3>
            </Reveal>
            <div className="event-grid">
              {list.map((ev, i) => (
                <EventCard key={ev.id} ev={ev} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
