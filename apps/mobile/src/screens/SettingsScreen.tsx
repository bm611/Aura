import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useAuth } from '../contexts/AuthContext'

const OPENROUTER_KEY_STORE = 'openrouter_api_key'

export default function SettingsScreen() {
  const { user, signOut } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    SecureStore.getItemAsync(OPENROUTER_KEY_STORE).then((key) => {
      if (key) setApiKey(key)
    })
  }, [])

  async function handleSaveKey() {
    setSaving(true)
    try {
      await SecureStore.setItemAsync(OPENROUTER_KEY_STORE, apiKey.trim())
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      Alert.alert('Error', 'Failed to save API key.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut()
          } catch (err) {
            Alert.alert('Error', (err as Error).message)
          }
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeader}>AI (OpenRouter)</Text>
      <View style={styles.card}>
        <Text style={styles.label}>API Key</Text>
        <Text style={styles.hint}>
          Used for AI chat. Get a free key at openrouter.ai.
        </Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="sk-or-..."
          placeholderTextColor="#555"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveKey} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>{saved ? 'Saved ✓' : 'Save Key'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.accountEmail}>{user?.email}</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  sectionHeader: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  hint: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  saveBtn: {
    backgroundColor: '#e07a8a',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  accountEmail: {
    color: '#ccc',
    fontSize: 15,
  },
  signOutBtn: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  signOutText: {
    color: '#f87171',
    fontWeight: '600',
    fontSize: 14,
  },
})

