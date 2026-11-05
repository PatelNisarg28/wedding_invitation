import { mustComeFriends, type Friend } from '../content/friends'

/** Lower-case, strip accents and punctuation, keep Latin and Devanagari letters. */
export function normalizeName(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-zऀ-ॿ]+/g, ' ')
    .trim()
}

// Gujarati / Hindi honorifics people often add to a first name
const SUFFIXES = ['bhai', 'ben', 'behen', 'ji', 'भाई', 'बेन', 'जी']
const stripSuffix = (t: string) => {
  for (const s of SUFFIXES) if (t.length > s.length + 2 && t.endsWith(s)) return t.slice(0, -s.length)
  return t
}

function editDistance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 2
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = tmp
    }
  }
  return prev[b.length]
}

/**
 * Names under 7 letters must match exactly (otherwise Rahil would catch Rahul, Priyal would catch Priya);
 * longer names may be off by one letter (Chaitnya, Subhajit). Known variants are listed in friends.ts.
 */
const close = (token: string, target: string) => token === target || (target.length >= 7 && editDistance(token, target) <= 1)

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
