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
            backgroundColor: theme.colors.pastelSage,
            borderColor: 'rgba(22,52,40,0.08)',
            borderWidth: 1,
            borderRadius: theme.radius.lg,
            borderBottomRightRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 15,
              color: theme.colors.pastelSageInk,
              lineHeight: 22,
            }}
          >
            {message.content || '…'}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.wrapper, { alignItems: 'flex-start' }]}>
      <View style={{ flexDirection: 'row', gap: 10, maxWidth: '95%' }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: theme.colors.pastelPeach,
            borderColor: 'rgba(22,52,40,0.08)',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          <Text style={{ fontSize: 14 }}>🦊</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 15,
              color: theme.colors.textPrimary,
              lineHeight: 22,
            }}
          >
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
