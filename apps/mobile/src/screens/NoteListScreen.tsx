import { useCallback, useMemo, useState } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Haptics from 'expo-haptics'
import type { NoteFile, NoteFolder, TreeNode } from '@folio/shared'
import { filterTreeNodes, collectSubtreeIds } from '@folio/shared'
import { useNotes } from '../contexts/NotesContext'
import type { AppStackParamList } from '../navigation/AppNavigator'
import SearchBar from '../components/SearchBar'
import TreeNodeRow from '../components/TreeNodeRow'
import EmptyState from '../components/EmptyState'

type Props = NativeStackScreenProps<AppStackParamList, 'NoteList'>

interface FlatItem {
  node: TreeNode
  depth: number
}

function buildFlatList(nodes: TreeNode[], expandedFolders: Set<string>, depth = 0): FlatItem[] {
  const items: FlatItem[] = []
  for (const node of nodes) {
    items.push({ node, depth })
    if (node.type === 'folder' && expandedFolders.has(node.id) && node.children) {
      items.push(...buildFlatList(node.children, expandedFolders, depth + 1))
    }
  }
  return items
}

export default function NoteListScreen({ navigation }: Props) {
  const { tree, isLoading, isSyncing, createNote, createFolder, deleteTreeNode, renameTreeNode } = useNotes()
  const [search, setSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const filteredTree = useMemo(() => filterTreeNodes(tree, search), [tree, search])
  const listData = useMemo(
    () => buildFlatList(filteredTree, expandedFolders),
    [filteredTree, expandedFolders]
  )

  function handleCreateNote() {
    const note = createNote(null)
    navigation.push('Editor', { noteId: note.id })
  }

  function handleFilePress(note: NoteFile) {
    navigation.push('Editor', { noteId: note.id })
  }

  function handleFolderPress(folder: NoteFolder) {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folder.id)) next.delete(folder.id)
      else next.add(folder.id)
      return next
    })
  }

  function handleLongPress(node: TreeNode) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const isFolder = node.type === 'folder'

    Alert.alert(node.name || 'Untitled', undefined, [
      {
        text: 'Rename',
        onPress: () => {
          Alert.prompt(
            'Rename',
            undefined,
            (newName) => {
              if (newName?.trim()) renameTreeNode(node.id, newName.trim())
            },
            'plain-text',
            node.name
          )
        },
      },
      ...(isFolder
        ? [
            {
              text: 'New note inside',
              onPress: () => {
                const note = createNote(node.id)
                setExpandedFolders((prev) => new Set([...prev, node.id]))
                navigation.push('Editor', { noteId: note.id })
              },
            },
          ]
        : []),
      {
        text: 'Delete',
        style: 'destructive' as const,
        onPress: () => {
          const ids = collectSubtreeIds(tree, node.id)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          Alert.alert('Delete?', `This will delete "${node.name}"${isFolder ? ' and all its contents' : ''}.`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteTreeNode(node.id, ids),
            },
          ])
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const renderItem = useCallback(
    ({ item }: { item: FlatItem }) => (
      <TreeNodeRow
        node={item.node}
        depth={item.depth}
        isExpanded={expandedFolders.has(item.node.id)}
        onFilePress={handleFilePress}
        onFolderPress={handleFolderPress}
        onLongPress={handleLongPress}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expandedFolders, tree]
  )

  function handleCreateFolder() {
    Alert.prompt('New Folder', 'Enter folder name', (name) => {
      if (name?.trim()) createFolder(null, name.trim())
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>⚙</Text>
        </TouchableOpacity>
        {isSyncing && <ActivityIndicator color="#e07a8a" size="small" style={{ marginLeft: 8 }} />}
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleCreateFolder} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>📁+</Text>
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChange={setSearch} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#e07a8a" size="large" />
        </View>
      ) : listData.length === 0 ? (
        <EmptyState onCreateNote={handleCreateNote} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.node.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateNote}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerBtn: {
    padding: 6,
  },
  headerBtnText: {
    fontSize: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e07a8a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
  },
})
