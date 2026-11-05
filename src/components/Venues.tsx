import { useState } from 'react'
import { events, venues, type Venue } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { IconNavigate, IconPin } from './Ornaments'
import { Reveal, SectionHead } from './Reveal'
import { LeafShadow } from './Scenery'

const ORDER: Venue['id'][] = ['somiba', 'samajWadi', 'residence']

function VenueCard({ v, index }: { v: Venue; index: number }) {
  const { t, l, lang } = useLang()
  const [showMap, setShowMap] = useState(false)
  const here = events.filter((e) => e.venueId === v.id)
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(v.embedQuery)}&hl=${lang}&z=15&output=embed`

  return (
    <Reveal delay={index * 0.1} className="venue-card">
      <div className={`venue-map${showMap ? ' is-open' : ''}`}>
        {showMap ? (
          <iframe title={t.venues.mapTitle(l(v.name))} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        ) : (
          <>
            <IconPin className="pin" />
            <button type="button" className="load" onClick={() => setShowMap(true)}>
              {t.venues.loadMap}
            </button>
          </>
        )}
      </div>
      <div className="venue-body">
        <h3 className="venue-name">{l(v.name)}</h3>
        <p className="venue-addr">{l(v.address)}</p>
        <ul className="chips" aria-label={t.venues.hosts}>
          {here.map((e) => (
            <li key={e.id}>{l(e.name)}</li>
          ))}
        </ul>
        <a className="btn" href={v.mapsUrl} target="_blank" rel="noopener noreferrer">
          <IconNavigate width={18} height={18} />
          {t.venues.getDirections}
        </a>
      </div>
    </Reveal>
  )
}

export function Venues() {
  const { t } = useLang()
  return (
    <section className="section venues-bg" id="venues" aria-labelledby="venues-title">
      <LeafShadow className="left" />
      <div className="container">
        <SectionHead id="venues-title" eyebrow={t.venues.eyebrow} title={t.venues.title} />
        <div className="venue-grid">
          {ORDER.map((id, i) => (
            <VenueCard key={id} v={venues[id]} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
