import { View, StyleSheet } from 'react-native'
import { useTheme } from '../theme'
import { Button, Text } from './ui'

interface Props {
  onCreateNote: () => void
}

export default function EmptyState({ onCreateNote }: Props) {
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.accentMuted, borderColor: theme.colors.accent },
        ]}
      >
        <Text variant="title" style={{ color: theme.colors.accent, fontFamily: theme.fonts.displaySemibold }}>
          ✎
        </Text>
      </View>
      <Text variant="heading" center weight="semibold" style={{ marginTop: 20 }}>
        A blank page awaits
      </Text>
      <Text
        variant="body"
        tone="secondary"
        center
        style={{ marginTop: 8, maxWidth: 280 }}
      >
        Start your first note and let your ideas find a home.
      </Text>
      <View style={{ height: 24 }} />
      <Button label="Create your first note" onPress={onCreateNote} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
