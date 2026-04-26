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
          marginTop: 20,
          textAlign: 'center',
          letterSpacing: -0.2,
        }}
      >
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
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
