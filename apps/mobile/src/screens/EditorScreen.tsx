import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../navigation/AppNavigator'
import { useNotes } from '../contexts/NotesContext'
import TenTapEditor from '../components/TenTapEditor'
import { useTheme } from '../theme'
import { Screen, Text, IconButton } from '../components/ui'

type Props = NativeStackScreenProps<AppStackParamList, 'Editor'>

function countWords(html: string): number {
  if (!html) return 0
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return 0
  return text.split(' ').length
}

export default function EditorScreen({ route, navigation }: Props) {
  const theme = useTheme()
  const { noteId } = route.params
  const { findNote, updateNote } = useNotes()

  const note = findNote(noteId)
  const [title, setTitle] = useState(note?.title || note?.name || '')
  const [content, setContent] = useState(note?.content || '')

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestContent = useRef(note?.content || '')

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.colors.bgDeep },
      headerTintColor: theme.colors.textPrimary,
      headerTitle: '',
      headerShadowVisible: false,
      headerBackTitle: '',
      headerRight: () => (
        <IconButton
          glyph="✦"
          tone="accent"
          variant="ghost"
          onPress={() => navigation.navigate('HomeTabs', { screen: 'AiTab', params: { noteId } })}
          accessibilityLabel="AI chat"
        />
      ),
    })
  }, [navigation, theme, noteId])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  function scheduleSave(newTitle: string, newContent: string, newContentDoc?: object) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNote(noteId, {
        title: newTitle,
        name: newTitle,
        content: newContent,
        ...(newContentDoc ? { contentDoc: newContentDoc as Record<string, unknown>, editorVersion: 2 } : {}),
      })
    }, 500)
  }

  const handleContentChange = useCallback(
    (html: string, json: object) => {
      latestContent.current = html
      setContent(html)
      scheduleSave(title, html, json)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title]
  )

  if (!note) {
    return (
      <Screen>
        <View style={styles.notFound}>
          <Text variant="heading" tone="secondary" center>
            Note not found
          </Text>
        </View>
      </Screen>
    )
  }

  const words = countWords(content)
  const readTime = Math.max(1, Math.round(words / 220))

  return (
    <Screen surface="primary">
      <View style={{ paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[2] }}>
        <TextInput
          value={title}
          onChangeText={(t) => {
            setTitle(t)
            scheduleSave(t, latestContent.current)
          }}
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.displaySemibold,
            fontSize: 30,
            letterSpacing: -0.5,
            paddingVertical: 6,
          }}
          placeholder="Untitled"
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.accent}
          returnKeyType="done"
          blurOnSubmit
          multiline={false}
        />
        <View
          style={[
            styles.statsRow,
            { borderBottomColor: theme.colors.borderSubtle, paddingVertical: theme.spacing[2] },
          ]}
        >
          <Text variant="micro" tone="muted" style={{ fontFamily: theme.fonts.mono }}>
            {words} words
          </Text>
          <Text variant="micro" tone="muted" style={{ fontFamily: theme.fonts.mono }}>
            ·
          </Text>
          <Text variant="micro" tone="muted" style={{ fontFamily: theme.fonts.mono }}>
            {readTime} min read
          </Text>
        </View>
      </View>

      <TenTapEditor
        initialContent={note.content || ''}
        initialContentDoc={note.contentDoc}
        onChange={handleContentChange}
        placeholder="Start writing…"
        style={styles.editor}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  editor: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

