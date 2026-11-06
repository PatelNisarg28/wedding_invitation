import { useLang } from '../i18n/LanguageContext'

type Kind = 'plane' | 'train'

function Icon({ kind }: { kind: Kind }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'plane' ? (
        <path d="M10.5 21l1.5-1v-4.5l6.5 3v-2L12 11.5V5.5a1.5 1.5 0 0 0-3 0v6L2.5 16.5v2l6.5-3V20l1.5 1z" transform="rotate(45 12 12)" />
      ) : (
        <>
          <rect x="5.5" y="3" width="13" height="14" rx="3" />
          <path d="M5.5 10h13M9 13.5h.01M15 13.5h.01M8 21l2-4M16 21l-2-4" />
        </>
      )}
    </svg>
  )
}

/** How to reach Surat: nearest airport and railway stations, with codes. */
export function TravelOptions() {
  const { t } = useLang()
  const o = t.travel
  const items: { kind: Kind; code: string; name: string; note: string }[] = [
    { kind: 'plane', code: 'STV', name: o.stv, note: o.stvNote },
    { kind: 'train', code: 'ST', name: o.st, note: o.stNote },
    { kind: 'train', code: 'UDN', name: o.udn, note: o.udnNote },
    { kind: 'plane', code: 'BOM · AMD', name: o.big, note: o.bigNote },
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
