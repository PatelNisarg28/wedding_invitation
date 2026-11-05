import { mustComeFriends, type Friend } from '../content/friends'

/** Lower-case, strip accents and punctuation, keep Latin and Devanagari letters. */
export function normalizeName(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\u0900-\u097f]+/g, ' ')
    .trim()
}

// Gujarati / Hindi honorifics people often add to a first name
const SUFFIXES = ['bhai', 'ben', 'behen', 'ji', 'भाई', 'बेन', 'जी']
const stripSuffix = (t: string) => {
  for (const s of SUFFIXES) if (t.length > s.length + 2 && t.endsWith(s)) return t.slice(0, -s.length)
  return t
}

/** Exact spelling only — capitals, accents and spacing are already normalised away. */
const close = (token: string, target: string) => token === target

/** The must-come friend whose name appears in what the guest typed, if any. */
export function matchFriend(input: string, list: Friend[] = mustComeFriends): Friend | null {
  const words = normalizeName(input).split(' ').filter(Boolean)
  if (!words.length) return null
  const tokens = words.flatMap((w) => [w, stripSuffix(w)])
  for (const f of list) {
    const targets = [f.name, ...(f.also ?? [])].map(normalizeName).filter(Boolean)
    if (targets.some((t) => tokens.some((w) => close(w, t)))) return f
  }
  return null
}
