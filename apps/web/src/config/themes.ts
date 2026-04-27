export interface ThemeConfig {
  id: string
  label: string
  mode: 'dark' | 'light'
  group: string
  bg: string
  surface: string
  accent: string
}

// Single brutalist theme. Kept as an array for API compatibility with
// callers that previously enumerated themes (e.g. CommandPalette cycle action).
export const THEMES: ThemeConfig[] = [
  {
    id: 'brutal',
    label: 'Brutal',
    mode: 'light',
    group: 'Folio',
    bg: '#f5f1e6',
    surface: '#faf7ee',
    accent: '#5d3fd3',
  },
]
