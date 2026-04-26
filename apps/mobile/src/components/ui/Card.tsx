import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '../../theme'

export type CardTone = 'surface' | 'elevated' | 'sage' | 'peach' | 'lavender' | 'sky' | 'cream'

interface Props extends ViewProps {
  padded?: boolean
  elevated?: boolean
  tone?: CardTone
  style?: StyleProp<ViewStyle>
}

export default function Card({ padded = true, elevated, tone = 'surface', style, ...rest }: Props) {
  const theme = useTheme()

  const bg =
    tone === 'elevated'
      ? theme.colors.bgElevated
      : tone === 'sage'
      ? theme.colors.pastelSage
      : tone === 'peach'
      ? theme.colors.pastelPeach
      : tone === 'lavender'
      ? theme.colors.pastelLavender
      : tone === 'sky'
      ? theme.colors.pastelSky
      : tone === 'cream'
      ? theme.colors.pastelCream
      : theme.colors.bgSurface

  // Soft outline: a 1px border ~10% darker than the card's own fill
  const borderColor =
    tone === 'surface' || tone === 'elevated'
      ? theme.colors.borderSubtle
      : 'rgba(22, 52, 40, 0.08)'

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: bg,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor,
          padding: padded ? theme.spacing[4] : 0,
        },
        elevated ? theme.shadow.card : null,
        style,
      ]}
    />
  )
}
