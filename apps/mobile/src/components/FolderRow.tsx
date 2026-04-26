import { TouchableOpacity, View, StyleSheet } from 'react-native'
import type { NoteFolder } from '@folio/shared'
import { useTheme } from '../theme'
import { Text } from './ui'

interface Props {
  folder: NoteFolder
  depth: number
  isExpanded: boolean
  onPress: () => void
  onLongPress: () => void
}

export default function FolderRow({ folder, depth, isExpanded, onPress, onLongPress }: Props) {
  const theme = useTheme()
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          marginLeft: theme.spacing[5] + depth * theme.spacing[4],
          marginRight: theme.spacing[5],
          marginVertical: 3,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[3],
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.glyph,
          { backgroundColor: theme.colors.pastelLavender },
        ]}
      >
        <Text style={{ fontSize: 14, color: theme.colors.pastelLavenderInk }}>
          {isExpanded ? '▾' : '▸'}
        </Text>
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: theme.fonts.displaySemibold,
          fontSize: 16,
          color: theme.colors.textPrimary,
          letterSpacing: -0.1,
        }}
        numberOfLines={1}
      >
        {folder.name}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glyph: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
