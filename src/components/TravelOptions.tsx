import { useLang } from '../i18n/LanguageContext'

const ICONS = `${import.meta.env.BASE_URL}icons/`

/** How to reach Surat: its airport and railway stations, with codes. */
export function TravelOptions() {
  const { t } = useLang()
  const o = t.travel
  const items: { icon: string; code: string; name: string; note: string }[] = [
    { icon: 'airport', code: 'STV', name: o.stv, note: o.stvNote },
    { icon: 'railway', code: 'ST', name: o.st, note: o.stNote },
    { icon: 'udhna', code: 'UDN', name: o.udn, note: o.udnNote },
  ]
  return (
    <div className="cal-card travel-options">
      <h3>{o.title}</h3>
      <p className="cal-sub">{o.sub}</p>
      <ul>
        {items.map((it) => (
          <li key={it.code}>
            <img className="to-icon" src={`${ICONS}${it.icon}.webp`} alt="" width={128} height={128} loading="lazy" decoding="async" />
            <span className="to-text">
              <b>{it.name}</b>
              <small>{it.note}</small>
            </span>
            <span className="to-code">{it.code}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
