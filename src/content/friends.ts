/**
 * Close friends Nisarg has personally asked to be there.
 * When one of them types their name in the RSVP form, a note from Nisarg appears,
 * and declining needs a genuine reason. Add people here — one entry per person.
 *
 * `name` is how the note greets them; `also` lists other spellings, nicknames or the
 * Hindi spelling. Matching ignores capitals, extra spaces, surnames, a trailing
 * "bhai"/"ben"/"ji", and one-letter typos in names of 7+ letters (see src/lib/friends.ts).
 */
export interface Friend {
  name: string
  also?: string[]
}

export const mustComeFriends: Friend[] = [
  { name: 'Jaydutt', also: ['Jaydut', 'Jaidutt', 'Jaidut', 'Jaydatt', 'जयदत्त'] },
  { name: 'Rahil', also: ['Raahil', 'राहिल'] },
  { name: 'Chaitanya', also: ['Chaitnya', 'Chaitanyaa', 'Chetanya', 'चैतन्य'] },
  { name: 'Priyal', also: ['Priyaal', 'प्रियल'] },
  { name: 'Rushi', also: ['Rishi', 'ऋषि', 'रुषि'] },
  { name: 'Hiren', also: ['हिरेन', 'हीरेन'] },
  { name: 'Vraj', also: ['Braj', 'व्रज', 'वृज'] },
  { name: 'Harsh', also: ['हर्ष'] },
  { name: 'Rutvik', also: ['Rutwik', 'Ritvik', 'Ritwik', 'Rutvick', 'ऋत्विक', 'रुत्विक'] },
  { name: 'Param', also: ['परम'] },
  { name: 'Ankit', also: ['अंकित'] },
  { name: 'Dharm', also: ['Dharam', 'Dharma', 'धर्म'] },
  { name: 'Aaditya', also: ['Aditya', 'Adithya', 'Aadithya', 'Adeetya', 'आदित्य'] },
  { name: 'Subhojit', also: ['Shubhojit', 'Subhajit', 'Shubhajit', 'Subhojeet', 'सुभोजित', 'शुभोजित'] },
  { name: 'Dhruv', also: ['Dhruva', 'Dhuruv', 'ध्रुव'] },
  { name: 'Pearl', also: ['Perl', 'पर्ल'] },
  { name: 'Parth', also: ['Paarth', 'Partha', 'पार्थ'] },
  { name: 'Jill', also: ['Jil', 'जिल'] },
  { name: 'Jaymin', also: ['Jaimin', 'Jaymeen', 'Jaimeen', 'जयमिन', 'जैमिन'] },
]
