/**
 * Close friends Nisarg has personally asked to be there.
 * When one of them types their name in the RSVP form, a note from Nisarg appears,
 * and declining needs a genuine reason. Add people here — one entry per person.
 *
 * `name` is how the note greets them; `also` lists other spellings, nicknames or the
 * Hindi spelling. Matching ignores capitals, extra spaces, surnames, a trailing
 * "bhai"/"ben"/"ji", and small typos in longer names (see src/lib/friends.ts).
 */
export interface Friend {
  name: string
  also?: string[]
}

export const mustComeFriends: Friend[] = [
  { name: 'Amit', also: ['अमित'] },
  { name: 'Kunkum', also: ['Kumkum', 'Kunkoom', 'कुमकुम', 'कुंकुम'] },
  { name: 'Satish', also: ['Sathish', 'सतीश'] },
]
