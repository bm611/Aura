import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '../../theme'

export default function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme()
  return (
    <View
      style={[
        { height: 1, backgroundColor: theme.colors.borderSubtle, width: '100%' },
        style,
      ]}
    />
  )
}
