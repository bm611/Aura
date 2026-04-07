import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface Props {
  onCreateNote: () => void
}

export default function EmptyState({ onCreateNote }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📝</Text>
      <Text style={styles.title}>No notes yet</Text>
      <Text style={styles.subtitle}>Tap the button below to create your first note.</Text>
      <TouchableOpacity style={styles.button} onPress={onCreateNote}>
        <Text style={styles.buttonText}>New Note</Text>
      </TouchableOpacity>
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
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#e07a8a',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
})
