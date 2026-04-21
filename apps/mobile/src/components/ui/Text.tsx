import { Text as RNText, type TextProps, type TextStyle } from 'react-native'
import { useTheme } from '../../theme'

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyLarge'
  | 'label'
  | 'small'
  | 'micro'
  | 'mono'

export type TextTone = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger' | 'success'

interface Props extends TextProps {
  variant?: TextVariant
  tone?: TextTone
  weight?: 'regular' | 'medium' | 'semibold'
  center?: boolean
}

export default function Text({
  variant = 'body',
  tone = 'primary',
  weight,
  center,
  style,
  ...rest
}: Props) {
  const theme = useTheme()

  const toneColor: Record<TextTone, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    accent: theme.colors.accent,
    danger: theme.colors.danger,
    success: theme.colors.success,
  }

  const variantStyle: Record<TextVariant, TextStyle> = {
    display: {
      fontFamily: theme.fonts.displaySemibold,
      fontSize: theme.fontSize.display,
      lineHeight: theme.fontSize.display * 1.15,
      letterSpacing: -0.5,
    },
    title: {
      fontFamily: theme.fonts.display,
      fontSize: theme.fontSize.title,
      lineHeight: theme.fontSize.title * 1.3,
      letterSpacing: -0.2,
    },
    heading: {
      fontFamily: theme.fonts.displaySemibold,
      fontSize: theme.fontSize.heading,
      lineHeight: theme.fontSize.heading * 1.2,
      letterSpacing: -0.3,
    },
    body: {
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSize.body,
      lineHeight: theme.fontSize.body * 1.5,
    },
    bodyLarge: {
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSize.bodyLarge,
      lineHeight: theme.fontSize.bodyLarge * 1.5,
    },
    label: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: theme.fontSize.label,
      lineHeight: theme.fontSize.label * 1.4,
    },
    small: {
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSize.small,
      lineHeight: theme.fontSize.small * 1.45,
    },
    micro: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: theme.fontSize.micro,
      lineHeight: theme.fontSize.micro * 1.4,
      letterSpacing: 0.5,
    },
    mono: {
      fontFamily: theme.fonts.mono,
      fontSize: theme.fontSize.small,
      lineHeight: theme.fontSize.small * 1.5,
    },
  }

  const weightFont =
    weight === 'semibold'
      ? variant === 'display' || variant === 'title' || variant === 'heading'
        ? theme.fonts.displaySemibold
        : theme.fonts.bodySemibold
      : weight === 'medium'
      ? variant === 'display' || variant === 'title' || variant === 'heading'
        ? theme.fonts.display
        : theme.fonts.bodyMedium
      : undefined

  return (
    <RNText
      {...rest}
      style={[
        variantStyle[variant],
        { color: toneColor[tone] },
        weightFont ? { fontFamily: weightFont } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
    />
  )
}
