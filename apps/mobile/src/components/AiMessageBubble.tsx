import { View, StyleSheet } from 'react-native'
import { useTheme } from '../theme'
import { Text } from './ui'
import type { ChatMessage } from '../hooks/useAiChat'

interface Props {
  message: ChatMessage
}

export default function AiMessageBubble({ message }: Props) {
  const theme = useTheme()
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <View style={[styles.wrapper, { alignItems: 'flex-end' }]}>
        <View
          style={{
            maxWidth: '85%',
            backgroundColor: theme.colors.bgElevated,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            borderRadius: theme.radius.lg,
            borderBottomRightRadius: 6,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text variant="body">{message.content || '…'}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.wrapper, { alignItems: 'flex-start' }]}>
      <View style={{ flexDirection: 'row', gap: 10, maxWidth: '95%' }}>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: theme.colors.accentMuted,
            borderColor: theme.colors.accent,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          <Text variant="small" tone="accent">
            ✦
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="body" tone="primary" style={{ lineHeight: 22 }}>
            {message.content || '…'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
})
