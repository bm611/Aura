import { useEffect, useLayoutEffect, useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'
import { useAuth } from '../contexts/AuthContext'
import { useTheme, useThemeController, type ThemePreference } from '../theme'
import { Button, Card, Input, Screen, Text } from '../components/ui'

const OPENROUTER_KEY_STORE = 'openrouter_api_key'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
]

export default function SettingsScreen() {
  const theme = useTheme()
  const navigation = useNavigation()
  const { preference, setPreference } = useThemeController()
  const { user, signOut } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
          }}
        >
          Settings
        </Text>
      ),
    })
  }, [navigation, theme])

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

  function handleSignOut() {
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
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <SectionLabel>Appearance</SectionLabel>
        <Card elevated style={{ gap: 10 }}>
          <Text variant="body" weight="semibold">
            Theme
          </Text>
          <Text variant="small" tone="muted">
            Choose how Folio looks on this device.
          </Text>
          <View
            style={[
              styles.segmented,
              { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderSubtle },
            ]}
          >
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.value
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.segment,
                    active && {
                      backgroundColor: theme.colors.bgSurface,
                      borderColor: theme.colors.accent,
                    },
                  ]}
                  onPress={() => setPreference(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    variant="label"
                    tone={active ? 'primary' : 'muted'}
                    weight={active ? 'semibold' : 'regular'}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </Card>

        <SectionLabel>AI (OpenRouter)</SectionLabel>
        <Card elevated style={{ gap: 10 }}>
          <Text variant="body" weight="semibold">
            API Key
          </Text>
          <Text variant="small" tone="muted">
            Used for AI chat. Get a free key at openrouter.ai.
          </Text>
          <Input
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-or-..."
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={{ fontFamily: theme.fonts.mono, fontSize: 13 }}
          />
          <Button
            label={saved ? 'Saved ✓' : 'Save key'}
            onPress={handleSaveKey}
            loading={saving}
            size="md"
          />
        </Card>

        <SectionLabel>Account</SectionLabel>
        <Card elevated style={{ gap: 14 }}>
          <View>
            <Text variant="small" tone="muted">
              Signed in as
            </Text>
            <Text variant="body" style={{ marginTop: 2 }}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.signOutBtn,
              {
                borderColor: theme.colors.danger,
                backgroundColor: theme.colors.dangerMuted,
                borderRadius: theme.radius.md,
              },
            ]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text variant="label" tone="danger" weight="semibold">
              Sign out
            </Text>
          </TouchableOpacity>
        </Card>

        <Text
          variant="micro"
          tone="muted"
          center
          style={{ marginTop: 28, fontFamily: theme.fonts.display, fontStyle: 'italic' }}
        >
          Folio · a quiet place for your thoughts
        </Text>
      </ScrollView>
    </Screen>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  return (
    <Text
      variant="micro"
      tone="muted"
      style={{
        marginTop: 22,
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        fontFamily: theme.fonts.bodyMedium,
      }}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    marginTop: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  signOutBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
})
