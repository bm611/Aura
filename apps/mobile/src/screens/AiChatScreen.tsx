import { useEffect, useRef, useState } from 'react'
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../navigation/AppNavigator'
import { useNotes } from '../contexts/NotesContext'
import { useAiChat } from '../hooks/useAiChat'
import AiMessageBubble from '../components/AiMessageBubble'

type Props = NativeStackScreenProps<AppStackParamList, 'AiChat'>

export default function AiChatScreen({ route }: Props) {
  const { noteId } = route.params ?? {}
  const navigation = useNavigation()
  const { findNote } = useNotes()
  const { messages, isStreaming, sendMessage, noApiKey, abort } = useAiChat()
  const [input, setInput] = useState('')
  const listRef = useRef<FlatList>(null)

  const note = noteId ? findNote(noteId) : null

  useEffect(() => {
    return () => {
      abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (noApiKey) {
      Alert.alert(
        'API Key Required',
        'Add your OpenRouter API key in Settings to use AI chat.',
        [
          { text: 'Go to Settings', onPress: () => navigation.navigate('Settings' as never) },
          { text: 'Cancel', style: 'cancel' },
        ]
      )
    }
  }, [noApiKey, navigation])

  async function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    const noteContents = note ? [{ title: note.title || note.name || 'Untitled', content: note.content || '' }] : []
    await sendMessage(text, noteContents)
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {note && (
        <View style={styles.contextBadge}>
          <Text style={styles.contextText}>Context: {note.title || note.name || 'Untitled'}</Text>
        </View>
      )}

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✦</Text>
          <Text style={styles.emptyTitle}>Ask anything</Text>
          <Text style={styles.emptySubtitle}>
            {note ? `Chatting with context from "${note.title || note.name}"` : 'Ask a question or start a conversation.'}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <AiMessageBubble message={item} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your notes…"
          placeholderTextColor="#555"
          multiline
          maxLength={2000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isStreaming) && styles.sendBtnDisabled]}
          onPress={isStreaming ? abort : handleSend}
          disabled={!isStreaming && !input.trim()}
        >
          <Text style={styles.sendBtnText}>{isStreaming ? '⏹' : '↑'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  contextBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a2a',
  },
  contextText: {
    color: '#888',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 36,
    color: '#e07a8a',
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingVertical: 12,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a2a',
    backgroundColor: '#0f0f0f',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e07a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#2a2a2a',
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
})
