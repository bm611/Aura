import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
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
import { useTheme } from '../theme'
import { IconButton, Screen, Text } from '../components/ui'

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
  const theme = useTheme()
  const { tree, isLoading, isSyncing, createNote, createFolder, deleteTreeNode, renameTreeNode } = useNotes()
  const [search, setSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const filteredTree = useMemo(() => filterTreeNodes(tree, search), [tree, search])
  const listData = useMemo(
    () => buildFlatList(filteredTree, expandedFolders),
    [filteredTree, expandedFolders]
  )

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

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
    <Screen safeEdges={['top']}>
      <View style={[styles.header, { paddingHorizontal: theme.spacing[4] }]}>
        <View style={styles.brand}>
          <Text
            style={{
              fontFamily: theme.fonts.displaySemibold,
              fontSize: 28,
              color: theme.colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            Folio
          </Text>
          {isSyncing ? (
            <View style={[styles.syncPill, { backgroundColor: theme.colors.bgElevated }]}>
              <ActivityIndicator size="small" color={theme.colors.accent} style={{ transform: [{ scale: 0.7 }] }} />
              <Text variant="micro" tone="muted">
                Syncing
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          <IconButton
            glyph="✎"
            onPress={handleCreateFolder}
            accessibilityLabel="New folder"
          />
          <IconButton
            glyph="⚙"
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Settings"
          />
        </View>
      </View>

      <Text
        variant="small"
        tone="muted"
        style={{ paddingHorizontal: theme.spacing[4], marginBottom: theme.spacing[2] }}
      >
        Your notes, beautifully organized.
      </Text>

      <SearchBar value={search} onChange={setSearch} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
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

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.accent,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 14,
            elevation: 8,
          },
        ]}
        onPress={handleCreateNote}
        activeOpacity={0.85}
        accessibilityLabel="New note"
      >
        <Text style={{ color: '#fff', fontSize: 30, lineHeight: 32, marginTop: -2 }}>+</Text>
      </TouchableOpacity>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 2,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 36,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
