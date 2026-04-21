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
          paddingLeft: theme.spacing[4] + depth * theme.spacing[4],
          paddingRight: theme.spacing[4],
          paddingVertical: theme.spacing[3] + 2,
          borderBottomColor: theme.colors.borderSubtle,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.65}
    >
      <View style={styles.chevronWrap}>
        <Text variant="small" tone="muted">
          {isExpanded ? '▾' : '▸'}
        </Text>
      </View>
      <Text
        variant="body"
        weight="medium"
        tone="secondary"
        style={{ flex: 1, fontFamily: theme.fonts.display, letterSpacing: -0.1 }}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  chevronWrap: {
    width: 14,
    alignItems: 'center',
  },
})
