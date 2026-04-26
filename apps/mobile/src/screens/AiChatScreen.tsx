import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useNotes } from '../contexts/NotesContext'
import { useAiChat } from '../hooks/useAiChat'
import AiMessageBubble from '../components/AiMessageBubble'
import { useTheme } from '../theme'
import { Screen, Text } from '../components/ui'

const SUGGESTIONS = [
  { label: 'Summarize', prompt: 'Summarize this note in 3 bullets.' },
  { label: 'Key ideas', prompt: 'What are the key ideas in this note?' },
  { label: 'Draft next section', prompt: 'Help me draft the next section.' },
  { label: 'Brainstorm', prompt: 'Brainstorm 5 directions I could take this.' },
]

export default function AiChatScreen({ route }: any) {
  const theme = useTheme()
  const { noteId } = route?.params ?? {}
  const navigation = useNavigation()
  const { findNote } = useNotes()
  const { messages, isStreaming, sendMessage, noApiKey, abort } = useAiChat()
  const [input, setInput] = useState('')
  const listRef = useRef<FlatList>(null)

  const note = noteId ? findNote(noteId) : null

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

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
          { text: 'Go to Settings', onPress: () => navigation.navigate('SettingsTab' as never) },
          { text: 'Cancel', style: 'cancel' },
        ]
      )
    }
  }, [noApiKey, navigation])

  async function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    const noteContents = note ? [{ title: note.title || note.name || 'Untitled', content: note.content || '' }] : []
    await sendMessage(trimmed, noteContents)
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }

  const canSend = input.trim().length > 0 && !isStreaming

  return (
    <Screen safeEdges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.mascot,
              {
                backgroundColor: theme.colors.pastelSage,
                borderColor: 'rgba(22,52,40,0.08)',
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>🦊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: theme.fonts.displaySemibold,
                fontSize: 20,
                color: theme.colors.textPrimary,
                letterSpacing: -0.2,
              }}
            >
              Ask Folio
            </Text>
            <Text variant="small" tone="muted">
              Your gentle writing companion
            </Text>
          </View>
        </View>

        {note ? (
          <View
            style={[
              styles.contextBadge,
              {
                backgroundColor: theme.colors.pastelLavender,
                borderColor: 'rgba(22,52,40,0.08)',
              },
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fonts.bodySemibold,
                fontSize: 11,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.pastelLavenderInk,
              }}
            >
              Context
            </Text>
            <Text
              style={{
                fontFamily: theme.fonts.body,
                fontSize: 13,
                color: theme.colors.pastelLavenderInk,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {note.title || note.name || 'Untitled'}
            </Text>
          </View>
        ) : null}

        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: theme.colors.pastelSage,
                  borderColor: 'rgba(22,52,40,0.08)',
                },
              ]}
            >
              <Text style={{ fontSize: 34 }}>🦊</Text>
            </View>
            <Text
              style={{
                fontFamily: theme.fonts.displaySemibold,
                fontSize: 22,
                color: theme.colors.textPrimary,
                marginTop: 18,
                letterSpacing: -0.2,
              }}
            >
              Ask anything
            </Text>
            <Text variant="body" tone="secondary" center style={{ marginTop: 8, maxWidth: 280 }}>
              {note
                ? `Working with "${note.title || note.name || 'Untitled'}"`
                : 'Start a gentle conversation about your notes.'}
            </Text>

            <View style={styles.suggestGrid}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s.label}
                  onPress={() => submit(s.prompt)}
                  style={[
                    styles.suggestChip,
                    {
                      backgroundColor: theme.colors.bgElevated,
                      borderColor: theme.colors.borderSubtle,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={{
                      fontFamily: theme.fonts.bodyMedium,
                      fontSize: 13,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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

        <View
          style={[
            styles.composerWrap,
            { backgroundColor: theme.colors.bgPrimary },
          ]}
        >
          <View
            style={[
              styles.composer,
              {
                backgroundColor: theme.colors.bgElevated,
                borderColor: theme.colors.borderSubtle,
                borderRadius: theme.radius.xl,
              },
            ]}
          >
            <TextInput
              style={{
                flex: 1,
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.body,
                paddingHorizontal: 18,
                paddingVertical: 12,
                maxHeight: 120,
              }}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your notes…"
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.accent}
              multiline
              maxLength={2000}
              returnKeyType="send"
              onSubmitEditing={() => submit(input)}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: isStreaming
                    ? theme.colors.danger
                    : canSend
                    ? theme.colors.accent
                    : theme.colors.bgSurface,
                },
                canSend || isStreaming ? theme.shadow.button : null,
              ]}
              onPress={isStreaming ? abort : () => submit(input)}
              disabled={!isStreaming && !canSend}
              activeOpacity={0.85}
            >
              <Text
                style={{
                  color:
                    canSend || isStreaming
                      ? theme.colors.accentContrast
                      : theme.colors.textMuted,
                  fontSize: 18,
                  fontFamily: theme.fonts.bodySemibold,
                }}
              >
                {isStreaming ? '■' : '↑'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  mascot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 999,
    alignSelf: 'flex-start',
    maxWidth: '92%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    maxWidth: 340,
  },
  suggestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 999,
  },
  list: {
    paddingVertical: 14,
    paddingBottom: 8,
  },
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 100,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    paddingLeft: 2,
    paddingRight: 6,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginRight: 2,
  },
})
