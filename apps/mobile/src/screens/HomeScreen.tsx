// @ts-nocheck
import { useMemo, useState } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import type { NoteFile, TreeNode } from '@folio/shared'
import { formatCreatedAt } from '@folio/shared'
import { useNotes } from '../contexts/NotesContext'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../theme'
import { Screen, Text, Card } from '../components/ui'
import NoteListScreen from './NoteListScreen'

function collectFiles(nodes: TreeNode[]): NoteFile[] {
  const files: NoteFile[] = []
  for (const node of nodes) {
    if (node.type === 'file') files.push(node as NoteFile)
    if (node.type === 'folder' && node.children) files.push(...collectFiles(node.children))
  }
  return files
}

function countFolders(nodes: TreeNode[]): number {
  let n = 0
  for (const node of nodes) {
    if (node.type === 'folder') {
      n += 1
      if (node.children) n += countFolders(node.children)
    }
  }
  return n
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

interface CategoryCard {
  key: string
  label: string
  count: number
  tone: 'sage' | 'peach' | 'lavender' | 'cream'
  glyph: string
}

export default function HomeScreen({ navigation }: any) {
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const { tree, createNote } = useNotes()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const allFiles = useMemo(() => collectFiles(tree), [tree])
  const recentNotes = useMemo(
    () =>
      [...allFiles]
        .sort((a, b) =>
          (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '')
        )
        .slice(0, 5),
    [allFiles]
  )

  const categories: CategoryCard[] = useMemo(() => {
    const folderCount = countFolders(tree)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentCount = allFiles.filter((f) => {
      const t = new Date(f.updatedAt || f.createdAt || 0).getTime()
      return t > weekAgo
    }).length
    return [
      { key: 'all', label: 'Notes', count: allFiles.length, tone: 'sage', glyph: '❋' },
      { key: 'recent', label: 'This week', count: recentCount, tone: 'peach', glyph: '✦' },
      { key: 'folders', label: 'Folders', count: folderCount, tone: 'lavender', glyph: '❀' },
      { key: 'starred', label: 'Drafts', count: Math.max(0, allFiles.length - recentCount), tone: 'cream', glyph: '✎' },
    ]
  }, [tree, allFiles])

  function handleCreateNote() {
    const note = createNote(null)
    navigation.getParent()?.navigate('Editor', { noteId: note.id, seedNote: note })
  }

  function handleOpenNote(note: NoteFile) {
    navigation.getParent()?.navigate('Editor', { noteId: note.id })
  }

  const firstName = user?.email?.split('@')[0] ?? ''
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'Writer'

  const getInk = (tone: CategoryCard['tone']) =>
    tone === 'sage'
      ? theme.colors.pastelSageInk
      : tone === 'peach'
      ? theme.colors.pastelPeachInk
      : tone === 'lavender'
      ? theme.colors.pastelLavenderInk
      : theme.colors.pastelCreamInk

  return (
    <Screen safeEdges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing[5],
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarOpen(true)} hitSlop={10}>
            <View style={styles.iconRow}>
              <View style={[styles.line, { backgroundColor: theme.colors.textPrimary }]} />
              <View style={[styles.line, { backgroundColor: theme.colors.textPrimary, width: 16 }]} />
              <View style={[styles.line, { backgroundColor: theme.colors.textPrimary }]} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity hitSlop={10} onPress={() => navigation.navigate('AiTab' as any)}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: 20 }}>⌕</Text>
            </TouchableOpacity>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.pastelPeach,
                  borderColor: 'rgba(22,52,40,0.08)',
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>🦊</Text>
            </View>
          </View>
        </View>

        {/* Greeting */}
        <View style={{ marginTop: theme.spacing[5] }}>
          <Text
            style={{
              fontFamily: theme.fonts.displaySemibold,
              fontSize: 30,
              lineHeight: 36,
              color: theme.colors.textPrimary,
              letterSpacing: -0.4,
            }}
          >
            {getGreeting()}, {displayName}!{' '}
            <Text style={{ fontSize: 26 }}>☀️</Text>
          </Text>
          <Text
            variant="body"
            tone="secondary"
            style={{ marginTop: 6 }}
          >
            Ready to capture your next idea?
          </Text>
        </View>

        {/* Categories */}
        <View style={[styles.grid, { marginTop: theme.spacing[5], gap: theme.spacing[3] }]}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={cat.key}
              style={{ width: '48.5%' }}
              activeOpacity={0.85}
              onPress={() => setSidebarOpen(true)}
            >
              <Card tone={cat.tone} padded style={{ paddingVertical: 18 }}>
                <View style={styles.catIconWrap}>
                  <View
                    style={[
                      styles.catIcon,
                      {
                        backgroundColor: 'rgba(255,255,255,0.55)',
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 18, color: getInk(cat.tone) }}>{cat.glyph}</Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontFamily: theme.fonts.bodySemibold,
                    fontSize: 16,
                    color: getInk(cat.tone),
                    marginTop: 12,
                  }}
                >
                  {cat.label}
                </Text>
                <Text
                  style={{
                    fontFamily: theme.fonts.body,
                    fontSize: 14,
                    color: getInk(cat.tone),
                    opacity: 0.72,
                    marginTop: 2,
                  }}
                >
                  {cat.count}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent notes header */}
        <View style={styles.sectionHead}>
          <Text
            style={{
              fontFamily: theme.fonts.displaySemibold,
              fontSize: 20,
              color: theme.colors.textPrimary,
              letterSpacing: -0.2,
            }}
          >
            Recent Notes
          </Text>
          <TouchableOpacity onPress={() => setSidebarOpen(true)} hitSlop={8}>
            <Text
              style={{
                fontFamily: theme.fonts.bodyMedium,
                fontSize: 13,
                color: theme.colors.textSecondary,
              }}
            >
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent notes list */}
        <View style={{ marginTop: theme.spacing[3], gap: theme.spacing[2] }}>
          {recentNotes.length === 0 ? (
            <Card tone="elevated" padded style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🌱</Text>
              <Text
                variant="body"
                tone="secondary"
                style={{ fontFamily: theme.fonts.bodyMedium }}
                center
              >
                A blank page awaits.
              </Text>
              <Text
                variant="small"
                tone="muted"
                center
                style={{ marginTop: 4, maxWidth: 240 }}
              >
                Tap the green plus to plant your first note.
              </Text>
            </Card>
          ) : (
            recentNotes.map((note, idx) => (
              <TouchableOpacity
                key={note.id}
                activeOpacity={0.75}
                onPress={() => handleOpenNote(note)}
              >
                <Card tone="elevated" padded={false} style={{ paddingVertical: 14, paddingHorizontal: 14 }}>
                  <View style={styles.noteRow}>
                    <View
                      style={[
                        styles.noteGlyph,
                        {
                          backgroundColor:
                            idx % 4 === 0
                              ? theme.colors.pastelSage
                              : idx % 4 === 1
                              ? theme.colors.pastelPeach
                              : idx % 4 === 2
                              ? theme.colors.pastelLavender
                              : theme.colors.pastelSky,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 14, color: theme.colors.accent }}>✎</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontFamily: theme.fonts.bodySemibold,
                          fontSize: 15,
                          color: theme.colors.textPrimary,
                        }}
                        numberOfLines={1}
                      >
                        {note.title || note.name || 'Untitled'}
                      </Text>
                      <Text
                        style={{
                          fontFamily: theme.fonts.body,
                          fontSize: 12,
                          color: theme.colors.textMuted,
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                      >
                        Updated {formatCreatedAt(note.updatedAt || note.createdAt)}
                      </Text>
                    </View>
                    {idx === 0 ? (
                      <Text style={{ fontSize: 14 }}>📌</Text>
                    ) : null}
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={sidebarOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={styles.sidebarOverlay}>
          <View
            style={[
              styles.sidebarPanel,
              {
                width: Math.min(width * 0.9, 380),
                backgroundColor: theme.colors.bgPrimary,
                borderRightColor: theme.colors.borderSubtle,
              },
            ]}
          >
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: theme.spacing[5],
                paddingTop: theme.spacing[6],
                paddingBottom: theme.spacing[3],
              }}
            >
              <View>
                <Text
                  style={{
                    color: theme.colors.textPrimary,
                    fontFamily: theme.fonts.displaySemibold,
                    fontSize: 28,
                    lineHeight: 34,
                  }}
                >
                  Folio
                </Text>
                <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
                  Your notes, beautifully simple.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSidebarOpen(false)} hitSlop={10}>
                <Text style={{ fontSize: 20, color: theme.colors.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>
            <NoteListScreen onNoteOpen={() => setSidebarOpen(false)} />
          </View>
          <Pressable style={styles.sidebarBackdrop} onPress={() => setSidebarOpen(false)} />
        </View>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  iconRow: {
    gap: 4,
  },
  line: {
    height: 2,
    width: 22,
    borderRadius: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catIconWrap: {
    flexDirection: 'row',
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteGlyph: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 52, 40, 0.28)',
  },
  sidebarBackdrop: {
    flex: 1,
  },
  sidebarPanel: {
    flexShrink: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
})
