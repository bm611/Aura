export interface ThemeConfig {
  id: string
  label: string
  mode: 'dark' | 'light'
  group: string
  /** bg-primary — card outer frame color */
  bg: string
  /** bg-surface — inner "paper" panel color */
  surface: string
  /** accent — heading line + active ring */
  accent: string
}

export const THEMES: ThemeConfig[] = [
  { id: 'dark',             label: 'Dark',  mode: 'dark',  group: 'Folio',       bg: '#211e19', surface: '#2a2620', accent: '#d4714a' },
  { id: 'light',            label: 'Light', mode: 'light', group: 'Folio',       bg: '#faf8f4', surface: '#f0ece4', accent: '#b85c38' },
  { id: 'playful',          label: 'Warm',  mode: 'light', group: 'Folio',       bg: '#fdf6e3', surface: '#f8eece', accent: '#e8602a' },
  { id: 'catppuccin-mocha', label: 'Mocha', mode: 'dark',  group: 'Catppuccin',  bg: '#1e1e2e', surface: '#313244', accent: '#cba6f7' },
  { id: 'catppuccin-latte', label: 'Latte', mode: 'light', group: 'Catppuccin',  bg: '#eff1f5', surface: '#e6e9ef', accent: '#8839ef' },
  { id: 'ayu-dark',         label: 'Dark',  mode: 'dark',  group: 'Ayu',         bg: '#0d1017', surface: '#131721', accent: '#e6b450' },
  { id: 'ayu-light',        label: 'Light', mode: 'light', group: 'Ayu',         bg: '#f8f9fa', surface: '#f0f1f2', accent: '#fa8d3e' },
  { id: 'tokyo-night',      label: 'Night', mode: 'dark',  group: 'Tokyo Night', bg: '#1a1b26', surface: '#24283b', accent: '#7aa2f7' },
  { id: 'tokyo-day',        label: 'Day',   mode: 'light', group: 'Tokyo Night', bg: '#d5d6db', surface: '#cdd0d8', accent: '#2e7de9' },
]
