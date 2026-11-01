import { useLang } from '../i18n/LanguageContext'

export function LanguageSwitch() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-switch" role="group" aria-label={t.nav.langLabel}>
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">
        EN
      </button>
      <button type="button" className="hi" aria-pressed={lang === 'hi'} onClick={() => setLang('hi')} lang="hi">
        हिंदी
      </button>
    </div>
  )
}
