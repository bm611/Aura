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
  accentContrast: string

  danger: string
  dangerMuted: string
  success: string
  successMuted: string
  warning: string

  colorH1: string
  colorH2: string
  colorH3: string

  // "Sunrise Pastels" — used for category cards, tag chips, mood backgrounds
  pastelSage: string
  pastelSageInk: string
  pastelPeach: string
  pastelPeachInk: string
  pastelLavender: string
  pastelLavenderInk: string
  pastelSky: string
  pastelSkyInk: string
  pastelCream: string
  pastelCreamInk: string
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
    cloud: object
  }
}

// Light "Forest Floor" — the primary Folio canvas
const lightColors: ThemeColors = {
  bgDeep: '#faf9f7',
  bgPrimary: '#faf9f7',
  bgSurface: '#f4f4f1',
  bgElevated: '#ffffff',
  bgHover: '#eeeeeb',

  borderSubtle: '#e3e2e0',
  borderDefault: '#c1c8c3',

  textPrimary: '#163428',
  textSecondary: '#424844',
  textMuted: '#727974',

  accent: '#2d4b3e',
  accentHover: '#466557',
  accentMuted: 'rgba(45, 75, 62, 0.08)',
  accentContrast: '#ffffff',

  danger: '#ba1a1a',
  dangerMuted: 'rgba(186, 26, 26, 0.08)',
  success: '#4b7d5e',
  successMuted: 'rgba(75, 125, 94, 0.10)',
  warning: '#b47a2a',

  colorH1: '#163428',
  colorH2: '#2d4b3e',
  colorH3: '#586059',

  pastelSage: '#dde5db',
  pastelSageInk: '#2d4b3e',
  pastelPeach: '#f6dcc8',
  pastelPeachInk: '#7a4a28',
  pastelLavender: '#e4dcec',
  pastelLavenderInk: '#4c3d66',
  pastelSky: '#d9e4ec',
  pastelSkyInk: '#32556e',
  pastelCream: '#f5e9d0',
  pastelCreamInk: '#6b5632',
}

// Dark "Moonlit Forest" — warm dark counterpart
const darkColors: ThemeColors = {
  bgDeep: '#1a1c1b',
  bgPrimary: '#1f2220',
  bgSurface: '#272a28',
  bgElevated: '#2f3230',
  bgHover: '#353835',

  borderSubtle: '#2f3230',
  borderDefault: '#414543',

  textPrimary: '#f1f1ee',
  textSecondary: '#c7cbc6',
  textMuted: '#878b88',

  accent: '#adcebd',
  accentHover: '#c8ead8',
  accentMuted: 'rgba(173, 206, 189, 0.14)',
  accentContrast: '#012116',

  danger: '#ff9a94',
  dangerMuted: 'rgba(255, 154, 148, 0.12)',
  success: '#9cc8ac',
  successMuted: 'rgba(156, 200, 172, 0.12)',
  warning: '#e6b56b',

  colorH1: '#adcebd',
  colorH2: '#c9cec3',
  colorH3: '#a7b4a5',

  pastelSage: '#2d4b3e',
  pastelSageInk: '#c8ead8',
  pastelPeach: '#4a3a2e',
  pastelPeachInk: '#f6dcc8',
  pastelLavender: '#3b3445',
  pastelLavenderInk: '#e4dcec',
  pastelSky: '#2a3a45',
  pastelSkyInk: '#c5d6e0',
  pastelCream: '#3d352a',
  pastelCreamInk: '#f2e3c2',
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
  body: 16,
  bodyLarge: 18,
  title: 22,
  heading: 26,
  display: 32,
  displayLarge: 44,
}

const RADIUS = { xs: 6, sm: 10, md: 14, lg: 20, xl: 26, xxl: 32, pill: 999 }

const SPACING = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 10: 56 }

const DURATION = { fast: 120, normal: 180, slow: 360 }

const darkShadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.42,
    shadowRadius: 28,
    elevation: 10,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 5,
  },
  cloud: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 12,
  },
}

// "Ambient Softness" — diffused, low-opacity forest tint on the light canvas
const lightShadow = {
  card: {
    shadowColor: '#2d4b3e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  elevated: {
    shadowColor: '#2d4b3e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 3,
  },
  button: {
    shadowColor: '#2d4b3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  cloud: {
    shadowColor: '#2d4b3e',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
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
