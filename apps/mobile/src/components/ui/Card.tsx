import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '../../theme'

interface Props extends ViewProps {
  padded?: boolean
  elevated?: boolean
  style?: StyleProp<ViewStyle>
}

export default function Card({ padded = true, elevated, style, ...rest }: Props) {
  const theme = useTheme()
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.colors.bgSurface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          padding: padded ? theme.spacing[4] : 0,
        },
        elevated ? theme.shadow.card : null,
        style,
      ]}
    />
  )
}
