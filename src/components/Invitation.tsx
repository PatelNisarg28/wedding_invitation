import { couple } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { Divider, Sprig } from './Ornaments'
import { Reveal } from './Reveal'
import { LeafShadow } from './Scenery'

export function Invitation() {
  const { t, l } = useLang()
  return (
    <section className="section" id="invitation" aria-labelledby="invite-title">
      <LeafShadow className="left" />
      <div className="narrow">
        <Reveal className="invite-card">
          <Sprig className="card-sprig" style={{ left: -38, top: -44, transform: 'rotate(100deg) scaleX(-1)' }} />
          <Sprig className="card-sprig" style={{ right: -38, bottom: -44, transform: 'rotate(-80deg) scaleX(-1)' }} />
          <span className="eyebrow">{t.invitation.eyebrow}</span>
          <h2 className="h2" id="invite-title">
            {t.invitation.title}
          </h2>
          <Divider />
          <p className="invite-msg">{t.invitation.message}</p>

          <div className="parents">
            <div className="parent">
              <div className="who">{l(couple.groom)}</div>
              <div className="of">{t.invitation.sonOf(l(couple.groomParents))}</div>
            </div>
            <div className="weds" aria-hidden="true">
              {t.invitation.weds}
            </div>
            <div className="parent">
              <div className="who">{l(couple.bride)}</div>
              <div className="of">{t.invitation.daughterOf(l(couple.brideParents))}</div>
            </div>
          </div>

          <div className="muhurat">{t.invitation.muhurat}</div>
        </Reveal>
      </div>
    </section>
  )
}
