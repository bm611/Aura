interface FontOption {
  id: string
  name: string
  value: string
}

// Brutalist look locks the body font to IBM Plex Mono. Single-entry list
// preserves API compatibility for callers that read FONT_OPTIONS.
export const FONT_OPTIONS: FontOption[] = [
  { id: 'plex-mono', name: 'IBM Plex Mono', value: '"IBM Plex Mono", monospace' },
]
