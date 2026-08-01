// ─── Shared color registry ────────────────────────────────────────────────────
// Single source of truth for all product colors across the app.
// Using explicit hex values instead of CSS named colors for precise fashion shades.

export const COLOR_MAP: Record<string, string> = {
  Red:    '#E53935',
  Blue:   '#1E88E5',
  Black:  '#1A1A1A',
  White:  '#F5F5F5',
  Green:  '#43A047',
  Yellow: '#FDD835',
  Pink:   '#E91E8C',
  Grey:   '#9E9E9E',
  Violet: '#7C3AED',  // deep violet-purple
  Indigo: '#3730A3',  // classic indigo
  Orange: '#F97316',  // vibrant orange
  Maroon: '#800020',  // dark wine-red
  Beige:  '#E8DCC8',  // warm sand / cream
  Brown:  '#795548',  // earthy brown
};
