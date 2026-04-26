import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getTheme, type Theme, type ThemeMode } from './tokens'

export type ThemePreference = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'folio:theme'

interface ThemeContextValue {
  theme: Theme
  mode: ThemeMode
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function resolveMode(pref: ThemePreference): ThemeMode {
  if (pref === 'system') {
    const sys = Appearance.getColorScheme()
    return sys === 'light' ? 'light' : 'dark'
  }
  return pref
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('light')
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme())

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        setPreferenceState(stored)
      }
    })
  }, [])

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme)
    })
    return () => sub.remove()
  }, [])

  function setPreference(pref: ThemePreference) {
    setPreferenceState(pref)
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {})
  }

  const mode: ThemeMode = useMemo(() => {
    if (preference === 'system') return systemScheme === 'light' ? 'light' : 'dark'
    return preference
  }, [preference, systemScheme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: getTheme(mode),
      mode,
      preference,
      setPreference,
    }),
    [mode, preference]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx.theme
}

export function useThemeController() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeController must be used inside ThemeProvider')
  return ctx
}

export { resolveMode }
