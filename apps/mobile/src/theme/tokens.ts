export type ThemeMode = 'dark' | 'light'

export interface ThemeColors {
  bgDeep: string
  bgPrimary: string
  bgSurface: string
  bgElevated: string
  bgHover: string

  borderSubtle: string
  borderDefault: string

  textPrimary: string
  textSecondary: string
  textMuted: string

  accent: string
  accentHover: string
  accentMuted: string

  danger: string
  dangerMuted: string
  success: string
  successMuted: string
  warning: string

  colorH1: string
  colorH2: string
  colorH3: string
}

export interface Theme {
  mode: ThemeMode
  colors: ThemeColors
  fonts: {
    display: string
    displaySemibold: string
    body: string
    bodyMedium: string
    bodySemibold: string
    mono: string
    monoMedium: string
  }
  fontSize: {
    micro: number
    small: number
    label: number
    body: number
    bodyLarge: number
    title: number
    heading: number
    display: number
    displayLarge: number
  }
  radius: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
    pill: number
  }
  spacing: {
    0: number
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    7: number
    8: number
    10: number
  }
  duration: {
    fast: number
    normal: number
    slow: number
  }
  shadow: {
    card: object
    elevated: object
    button: object
  }
}

const darkColors: ThemeColors = {
  bgDeep: '#1a1814',
  bgPrimary: '#211e19',
  bgSurface: '#2a2620',
  bgElevated: '#332f28',
  bgHover: '#3d382f',

  borderSubtle: '#332f28',
  borderDefault: '#3d382f',

  textPrimary: '#f0ece4',
  textSecondary: '#c8bfb0',
  textMuted: '#8a8178',

  accent: '#d4714a',
  accentHover: '#e08560',
  accentMuted: 'rgba(212, 113, 74, 0.15)',

  danger: '#e05c5c',
  dangerMuted: 'rgba(224, 92, 92, 0.12)',
  success: '#6aafca',
  successMuted: 'rgba(106, 175, 202, 0.12)',
  warning: '#c89640',

  colorH1: '#d4714a',
  colorH2: '#c8a070',
  colorH3: '#7a9e8a',
}

const lightColors: ThemeColors = {
  bgDeep: '#e8e2d8',
  bgPrimary: '#faf8f4',
  bgSurface: '#f0ece4',
  bgElevated: '#faf8f4',
  bgHover: '#e4ddd4',

  borderSubtle: '#ddd8d0',
  borderDefault: '#ccc4b8',

  textPrimary: '#2a2420',
  textSecondary: '#5c5248',
  textMuted: '#8c8278',

  accent: '#b85c38',
  accentHover: '#cc7048',
  accentMuted: 'rgba(184, 92, 56, 0.10)',

  danger: '#c84040',
  dangerMuted: 'rgba(200, 64, 64, 0.08)',
  success: '#4b829c',
  successMuted: 'rgba(75, 130, 156, 0.08)',
  warning: '#a07830',

  colorH1: '#b85c38',
  colorH2: '#8a7050',
  colorH3: '#5a8070',
}

const FONTS = {
  display: 'Fraunces_500Medium',
  displaySemibold: 'Fraunces_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemibold: 'DMSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
}

const FONT_SIZES = {
  micro: 11,
  small: 13,
  label: 14,
  body: 15,
  bodyLarge: 16,
  title: 20,
  heading: 24,
  display: 32,
  displayLarge: 44,
}

const RADIUS = { xs: 4, sm: 6, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999 }

const SPACING = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 10: 40 }

const DURATION = { fast: 120, normal: 150, slow: 350 }

const darkShadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
}

const lightShadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
}

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  fonts: FONTS,
  fontSize: FONT_SIZES,
  radius: RADIUS,
  spacing: SPACING,
  duration: DURATION,
  shadow: darkShadow,
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  fonts: FONTS,
  fontSize: FONT_SIZES,
  radius: RADIUS,
  spacing: SPACING,
  duration: DURATION,
  shadow: lightShadow,
}

export function getTheme(mode: ThemeMode): Theme {
  return mode === 'light' ? lightTheme : darkTheme
}
