import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { useTheme } from '../../theme'

interface Props extends ViewProps {
  surface?: 'deep' | 'primary' | 'surface'
  safeEdges?: Edge[]
  style?: StyleProp<ViewStyle>
}

export default function Screen({ surface = 'deep', safeEdges, style, ...rest }: Props) {
  const theme = useTheme()
  const bg =
    surface === 'primary' ? theme.colors.bgPrimary : surface === 'surface' ? theme.colors.bgSurface : theme.colors.bgDeep

  const Wrapper = safeEdges ? SafeAreaView : View
  const wrapperProps = safeEdges ? { edges: safeEdges } : {}

  return (
    <Wrapper
      {...wrapperProps}
      {...rest}
      style={[{ flex: 1, backgroundColor: bg }, style]}
    />
  )
}
