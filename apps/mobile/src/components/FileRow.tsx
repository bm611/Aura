import { TouchableOpacity, View, StyleSheet } from 'react-native'
import type { NoteFile } from '@folio/shared'
import { formatCreatedAt } from '@folio/shared'
import { useTheme } from '../theme'
import { Text } from './ui'

interface Props {
  note: NoteFile
  depth: number
  onPress: () => void
  onLongPress: () => void
}

export default function FileRow({ note, depth, onPress, onLongPress }: Props) {
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
          backgroundColor: theme.colors.bgElevated,
          borderRadius: theme.radius.md,
          borderColor: theme.colors.borderSubtle,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.glyph,
            { backgroundColor: theme.colors.pastelSage },
          ]}
        >
          <Text style={{ fontSize: 13, color: theme.colors.pastelSageInk }}>✎</Text>
        </View>
        <View style={styles.textBlock}>
          <Text
            style={{
              fontFamily: theme.fonts.bodySemibold,
              fontSize: 14,
              color: theme.colors.textPrimary,
            }}
            numberOfLines={1}
          >
            {note.title || note.name || 'Untitled'}
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 11,
              color: theme.colors.textMuted,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            Updated {formatCreatedAt(note.updatedAt || note.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  row: {
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
  textBlock: {
    flex: 1,
  },
})
