// data.js — option lists for the signup form, drawn from the SERVE prototype.

export const DIVISIONS = [
  'U11 Boys',
  'U11 Girls',
  'U13 Boys',
  'U13 Girls',
  'U15 Boys',
  'U15 Girls',
  'U17 Boys',
  'U17 Girls',
  'U19 Boys',
  'U19 Girls',
];

export const CLUBS = [
  'Apex Squash Club',
  'Glasshouse Squash',
  'Baseline Academy',
  'Frontwall Club',
  'Center Court',
  'Heliopolis Sporting Club',
];

export const FAV_PLAYERS = [
  'Ali Farag',
  'Mostafa Asal',
  'Nour El Sherbini',
  'Nouran Gohar',
  'Hania El Hammamy',
  'Tarek Momen',
  'Paul Coll',
  'Amanda Sobhy',
];

// Pre-fills the form so first paint shows a complete, believable card.
export const SAMPLE_PLAYER = {
  name: 'Omar Khaled',
  age: '14',
  division: 'U15 Boys',
  club: 'Apex Squash Club',
  rankLabel: '#3 · U15 National',
  racket: 'Tecnifibre Carboflex 125',
  fav: 'Ali Farag',
  photo: '',
};
