// ─── Brutalist Accent Palette ────────────────────────────────────────────────
// Single light-mode brutalist look. Each swatch overrides --accent on the
// document root. Both dark/light fields kept for API compatibility but
// resolve to the same value.

interface AccentThemeValues {
  accent: string
  accentHover: string
  colorH1: string
}

export interface AccentColor {
  id: string
  label: string
  dark: AccentThemeValues
  light: AccentThemeValues
}

const swatch = (accent: string, accentHover: string): AccentColor['light'] => ({
  accent,
  accentHover,
  colorH1: '#0a0a0a',
})

export const ACCENT_COLORS: AccentColor[] = [
  {
    id: 'violet',
    label: 'Violet',
    dark:  swatch('#5d3fd3', '#4a2fb8'),
    light: swatch('#5d3fd3', '#4a2fb8'),
  },
  {
    id: 'ink',
    label: 'Ink',
    dark:  swatch('#0a0a0a', '#2a2a2a'),
    light: swatch('#0a0a0a', '#2a2a2a'),
  },
  {
    id: 'vermilion',
    label: 'Vermilion',
    dark:  swatch('#c43d3d', '#a02a2a'),
    light: swatch('#c43d3d', '#a02a2a'),
  },
  {
    id: 'ochre',
    label: 'Ochre',
    dark:  swatch('#b8821a', '#8e6510'),
    light: swatch('#b8821a', '#8e6510'),
  },
  {
    id: 'sage',
    label: 'Sage',
    dark:  swatch('#3a7a52', '#285a3c'),
    light: swatch('#3a7a52', '#285a3c'),
  },
  {
    id: 'rose',
    label: 'Rose',
    dark:  swatch('#c4566a', '#a03e52'),
    light: swatch('#c4566a', '#a03e52'),
  },
  {
    id: 'teal',
    label: 'Teal',
    dark:  swatch('#1f5f5f', '#0e4040'),
    light: swatch('#1f5f5f', '#0e4040'),
  },
  {
    id: 'electric',
    label: 'Electric',
    dark:  swatch('#1e6dff', '#0050d8'),
    light: swatch('#1e6dff', '#0050d8'),
  },
]
