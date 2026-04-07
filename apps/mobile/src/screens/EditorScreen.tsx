import { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../navigation/AppNavigator'
import { useNotes } from '../contexts/NotesContext'
import FormatToolbar from '../components/FormatToolbar'
import type { Selection } from '../components/FormatToolbar'

type Props = NativeStackScreenProps<AppStackParamList, 'Editor'>

export default function EditorScreen({ route, navigation }: Props) {
  const { noteId } = route.params
  const { findNote, updateNote } = useNotes()

  const note = findNote(noteId)
  const [title, setTitle] = useState(note?.title || note?.name || '')
  const [content, setContent] = useState(note?.content || '')
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 })

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<TextInput>(null)

  // Set header title button
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TextInput
          value={title}
          onChangeText={(t) => {
            setTitle(t)
            scheduleSave(t, content)
          }}
          style={headerStyles.titleInput}
          placeholder="Untitled"
          placeholderTextColor="#555"
          returnKeyType="done"
          blurOnSubmit
        />
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AiChat', { noteId })}
          style={headerStyles.aiBtn}
        >
          <Text style={headerStyles.aiBtnText}>✦ AI</Text>
        </TouchableOpacity>
      ),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content])

  function scheduleSave(newTitle: string, newContent: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNote(noteId, {
        title: newTitle,
        name: newTitle,
        content: newContent,
      })
    }, 500)
  }

  function handleContentChange(text: string) {
    setContent(text)
    scheduleSave(title, text)
  }

  function handleFormatChange(newText: string, newSelection: Selection) {
    setContent(newText)
    setSelection(newSelection)
    scheduleSave(title, newText)
    // Restore selection after state update
    setTimeout(() => {
      inputRef.current?.setNativeProps({ selection: newSelection })
    }, 10)
  }

  const handleSelectionChange = useCallback(
    (e: { nativeEvent: { selection: { start: number; end: number } } }) => {
      setSelection(e.nativeEvent.selection)
    },
    []
  )

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>Note not found.</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="interactive"
      >
        <TextInput
          ref={inputRef}
          style={styles.editor}
          value={content}
          onChangeText={handleContentChange}
          onSelectionChange={handleSelectionChange}
          multiline
          textAlignVertical="top"
          autoCorrect
          autoCapitalize="sentences"
          placeholder="Start writing…"
          placeholderTextColor="#444"
          scrollEnabled={false}
          selection={selection}
        />
      </ScrollView>

      <FormatToolbar
        text={content}
        selection={selection}
        onChange={handleFormatChange}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  editor: {
    flex: 1,
    color: '#e8e8e8',
    fontSize: 16,
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 400,
  },
})

const headerStyles = StyleSheet.create({
  titleInput: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    minWidth: 160,
    maxWidth: 220,
  },
  aiBtn: {
    marginRight: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiBtnText: {
    color: '#e07a8a',
    fontSize: 13,
    fontWeight: '600',
  },
})
