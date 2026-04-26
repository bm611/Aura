import { useEffect, useLayoutEffect, useState } from 'react'
import {
  View,
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

const THEME_OPTIONS: { value: ThemePreference; label: string; glyph: string }[] = [
  { value: 'light', label: 'Light', glyph: '☀' },
  { value: 'dark', label: 'Dark', glyph: '☾' },
  { value: 'system', label: 'System', glyph: '◐' },
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
      headerShown: false,
    })
  }, [navigation])

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
    <Screen safeEdges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <View style={{ marginTop: 6, marginBottom: 18 }}>
          <Text
            style={{
              fontFamily: theme.fonts.displaySemibold,
              fontSize: 30,
              color: theme.colors.textPrimary,
              letterSpacing: -0.4,
            }}
          >
            Settings
          </Text>
          <Text variant="body" tone="secondary" style={{ marginTop: 4 }}>
            Tailor Folio to feel like yours.
          </Text>
        </View>

        <SectionLabel>Appearance</SectionLabel>
        <Card tone="sage" style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: theme.fonts.bodySemibold,
              fontSize: 16,
              color: theme.colors.pastelSageInk,
            }}
          >
            Theme
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 13,
              color: theme.colors.pastelSageInk,
              opacity: 0.8,
            }}
          >
            Choose how Folio looks on this device.
          </Text>
          <View style={styles.segmented}>
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.value
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: active
                        ? theme.colors.bgElevated
                        : 'rgba(255,255,255,0.35)',
                    },
                    active ? theme.shadow.button : null,
                  ]}
                  onPress={() => setPreference(opt.value)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: active ? theme.colors.accent : theme.colors.pastelSageInk,
                    }}
                  >
                    {opt.glyph}
                  </Text>
                  <Text
                    style={{
                      fontFamily: active ? theme.fonts.bodySemibold : theme.fonts.bodyMedium,
                      fontSize: 13,
                      color: active ? theme.colors.textPrimary : theme.colors.pastelSageInk,
                      marginTop: 2,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </Card>

        <SectionLabel>AI (OpenRouter)</SectionLabel>
        <Card tone="elevated" style={{ gap: 10 }}>
          <Text style={{ fontFamily: theme.fonts.bodySemibold, fontSize: 16 }}>API Key</Text>
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
        <Card tone="elevated" style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.pastelPeach,
                  borderColor: 'rgba(22,52,40,0.08)',
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>🦊</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="small" tone="muted">
                Signed in as
              </Text>
              <Text
                style={{
                  fontFamily: theme.fonts.bodySemibold,
                  fontSize: 15,
                  color: theme.colors.textPrimary,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {user?.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.signOutBtn,
              {
                borderColor: theme.colors.danger,
                backgroundColor: theme.colors.dangerMuted,
                borderRadius: theme.radius.pill,
              },
            ]}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Text
              style={{
                fontFamily: theme.fonts.bodySemibold,
                fontSize: 14,
                color: theme.colors.danger,
              }}
            >
              Sign out
            </Text>
          </TouchableOpacity>
        </Card>

        <Text
          variant="micro"
          tone="muted"
          center
          style={{
            marginTop: 32,
            fontFamily: theme.fonts.display,
            fontStyle: 'italic',
            fontSize: 13,
          }}
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
        marginBottom: 10,
        marginLeft: 4,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        fontFamily: theme.fonts.bodySemibold,
        fontSize: 11,
      }}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  signOutBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
