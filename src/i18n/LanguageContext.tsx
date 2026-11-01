import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { L10n, Lang } from '../content/wedding'
import { TIME_ZONE } from '../content/wedding'
import { translations, type Dict } from './translations'

const STORAGE_KEY = 'nwd-lang'

interface Ctx {
  lang: Lang
  t: Dict
  setLang: (l: Lang) => void
  /** pick the right string from a {en, hi} pair */
  l: (v: L10n) => string
  fmtDate: (iso: string, opts?: { weekday?: boolean; year?: boolean }) => string
  fmtTime: (iso: string) => string
}

const LanguageContext = createContext<Ctx | null>(null)

function initialLang(): Lang {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'hi') return saved
  } catch {
    /* storage unavailable (private mode / in-app browser) */
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      sessionStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
    document.documentElement.dataset.lang = lang
    document.title = translations[lang].meta.title
  }, [lang])

  const value = useMemo<Ctx>(() => {
    const locale = lang === 'hi' ? 'hi-IN' : 'en-IN'
    const fmtDate: Ctx['fmtDate'] = (iso, opts = {}) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: TIME_ZONE,
        day: 'numeric',
        month: 'long',
        ...(opts.weekday !== false ? { weekday: 'long' } : {}),
        ...(opts.year ? { year: 'numeric' } : {}),
        numberingSystem: 'latn',
      }).format(new Date(iso))

    const fmtTime: Ctx['fmtTime'] = (iso) => {
      const d = new Date(iso)
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIME_ZONE,
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(d)
      const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
      const m = parts.find((p) => p.type === 'minute')?.value ?? '00'
      const h12 = h % 12 === 0 ? 12 : h % 12
      if (lang === 'hi') {
        const period = h < 4 ? 'रात' : h < 12 ? 'सुबह' : h < 16 ? 'दोपहर' : h < 20 ? 'शाम' : 'रात'
        return `${period} ${h12}:${m} बजे`
      }
      return `${h12}:${m} ${h < 12 ? 'AM' : 'PM'}`
    }

    return { lang, t: translations[lang], setLang, l: (v) => v[lang], fmtDate, fmtTime }
  }, [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
