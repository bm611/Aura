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
  { label: 'Draft', prompt: 'Help me draft the next section.' },
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
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.colors.bgDeep },
      headerTintColor: theme.colors.textPrimary,
      headerShadowVisible: false,
      headerTitle: () => (
        <Text
          style={{
            fontFamily: theme.fonts.displaySemibold,
            fontSize: 18,
            color: theme.colors.textPrimary,
            letterSpacing: -0.2,
          }}
        >
          Ask Folio
        </Text>
      ),
    })
  }, [navigation, theme])

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
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {note ? (
          <View
            style={[
              styles.contextBadge,
              {
                backgroundColor: theme.colors.bgElevated,
                borderColor: theme.colors.borderSubtle,
              },
            ]}
          >
            <Text variant="micro" tone="accent" style={{ fontFamily: theme.fonts.mono }}>
              Context
            </Text>
            <Text variant="small" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
              {note.title || note.name || 'Untitled'}
            </Text>
          </View>
        ) : null}

        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: theme.colors.accentMuted,
                borderWidth: 1,
                borderColor: theme.colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ color: theme.colors.accent, fontSize: 28 }}>✦</Text>
            </View>
            <Text variant="heading" center weight="semibold">
              Ask anything
            </Text>
            <Text variant="body" tone="secondary" center style={{ marginTop: 8, maxWidth: 280 }}>
              {note
                ? `Working with "${note.title || note.name || 'Untitled'}"`
                : 'Ask a question or start a conversation.'}
            </Text>

            <View style={styles.suggestGrid}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s.label}
                  onPress={() => submit(s.prompt)}
                  style={[
                    styles.suggestChip,
                    {
                      backgroundColor: theme.colors.bgSurface,
                      borderColor: theme.colors.borderSubtle,
                      borderRadius: theme.radius.md,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text variant="label" tone="secondary">
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
            {
              borderTopColor: theme.colors.borderSubtle,
              backgroundColor: theme.colors.bgDeep,
            },
          ]}
        >
          <View
            style={[
              styles.composer,
              {
                backgroundColor: theme.colors.bgSurface,
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
                paddingHorizontal: 16,
                paddingVertical: 10,
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
                  backgroundColor:
                    isStreaming
                      ? theme.colors.danger
                      : canSend
                      ? theme.colors.accent
                      : theme.colors.bgElevated,
                },
              ]}
              onPress={isStreaming ? abort : () => submit(input)}
              disabled={!isStreaming && !canSend}
              activeOpacity={0.85}
            >
              <Text
                style={{
                  color: canSend || isStreaming ? '#fff' : theme.colors.textMuted,
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
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  suggestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    maxWidth: 320,
  },
  suggestChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  list: {
    paddingVertical: 14,
    paddingBottom: 8,
  },
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginRight: 2,
  },
})
