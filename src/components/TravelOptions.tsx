import { useLang } from '../i18n/LanguageContext'

type Kind = 'plane' | 'train'

/** Fine line icons, drawn to match the gold-and-maroon line art used across the site. */
function Icon({ kind }: { kind: Kind }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'plane' ? (
        <>
          {/* side-on aeroplane climbing over a short runway */}
          <path d="M5 18.5l3.2-.4 2.6 2.4 13-5.6c1.6-.7 2.4-2.1 1.6-2.9-.7-.7-2-.6-3.2-.1l-4.4 1.9-6.6-4.6-2.2.9 4.1 5.3-4 1.7-2.6-1.4-1.6.6z" />
          <path d="M6 25.5h20" />
          <path d="M9 25.5h2M14 25.5h2M19 25.5h2" strokeWidth="2" />
        </>
      ) : (
        <>
          {/* front of a train on rails */}
          <path d="M10 5.5h12a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3z" />
          <path d="M7 14h18M13 5.5v-1.5h6v1.5" />
          <path d="M10.5 8.5h11v3h-11z" />
          <circle cx="11" cy="18" r="1.2" />
          <circle cx="21" cy="18" r="1.2" />
          <path d="M11 22.5l-2.5 4M21 22.5l2.5 4M9.5 25h13" />
        </>
      )}
    </svg>
  )
}

/** How to reach Surat: its airport and railway stations, with codes. */
export function TravelOptions() {
  const { t } = useLang()
  const o = t.travel
  const items: { kind: Kind; code: string; name: string; note: string }[] = [
    { kind: 'plane', code: 'STV', name: o.stv, note: o.stvNote },
    { kind: 'train', code: 'ST', name: o.st, note: o.stNote },
    { kind: 'train', code: 'UDN', name: o.udn, note: o.udnNote },
  ]
  return (
    <div className="cal-card travel-options">
      <h3>{o.title}</h3>
      <p className="cal-sub">{o.sub}</p>
      <ul>
        {items.map((it) => (
          <li key={it.code}>
            <span className="to-icon">
              <Icon kind={it.kind} />
            </span>
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
