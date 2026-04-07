import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import type { NoteFile } from '@folio/shared'
import { formatCreatedAt } from '@folio/shared'

interface Props {
  note: NoteFile
  depth: number
  onPress: () => void
  onLongPress: () => void
}

export default function FileRow({ note, depth, onPress, onLongPress }: Props) {
  const excerpt = note.content?.trim().split('\n')[0]?.slice(0, 80) || ''

  return (
    <TouchableOpacity
      style={[styles.container, { paddingLeft: 20 + depth * 16 }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={styles.icon}>📄</Text>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>{note.title || note.name || 'Untitled'}</Text>
          {excerpt ? <Text style={styles.excerpt} numberOfLines={1}>{excerpt}</Text> : null}
        </View>
        <Text style={styles.date}>{formatCreatedAt(note.updatedAt || note.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e1e1e',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  excerpt: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  date: {
    color: '#555',
    fontSize: 12,
  },
})
