/**
 * Close friends Nisarg especially hopes will be there.
 * If one of them chooses "Regretfully Decline", a gentle note from Nisarg asks them to
 * reconsider, and declining needs a tick for an unavoidable reason. Accepting looks the
 * same as for every other guest. Add people here — one entry per person.
 *
 * Matching is on the exact spelling, ignoring capitals and extra spaces; a surname
 * after the name and a trailing "bhai"/"ben"/"ji" are fine (see src/lib/friends.ts).
 * To accept another spelling for someone, list it in `also`.
 */
export interface Friend {
  name: string
  also?: string[]
}

export const mustComeFriends: Friend[] = [
  { name: 'Amit' },
  { name: 'Kunkum' },
  { name: 'Satish' },
  { name: 'Jaydutt' },
  { name: 'Rahil' },
  { name: 'Chaitanya' },
  { name: 'Priyal' },
  { name: 'Rushi' },
  { name: 'Hiren' },
  { name: 'Vraj' },
  { name: 'Harsh' },
  { name: 'Rutvik' },
  { name: 'Param' },
  { name: 'Ankit' },
  { name: 'Dharm' },
  { name: 'Aaditya' },
  { name: 'Subhojit' },
  { name: 'Dhruv' },
  { name: 'Pearl' },
  { name: 'Parth' },
  { name: 'Jill' },
  { name: 'Jaymin' },
]
