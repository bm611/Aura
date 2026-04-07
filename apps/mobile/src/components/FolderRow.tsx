import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import type { NoteFolder } from '@folio/shared'

interface Props {
  folder: NoteFolder
  depth: number
  isExpanded: boolean
  onPress: () => void
  onLongPress: () => void
}

export default function FolderRow({ folder, depth, isExpanded, onPress, onLongPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, { paddingLeft: 16 + depth * 16 }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Text style={styles.chevron}>{isExpanded ? '▾' : '▸'}</Text>
      <Text style={styles.icon}>📁</Text>
      <Text style={styles.name} numberOfLines={1}>{folder.name}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e1e1e',
    gap: 6,
  },
  chevron: {
    color: '#555',
    fontSize: 12,
    width: 14,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    flex: 1,
    color: '#ccc',
    fontSize: 15,
    fontWeight: '500',
  },
})
