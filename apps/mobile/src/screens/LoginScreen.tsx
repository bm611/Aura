import { useEffect, useState } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../theme'
import { Button, Input, Screen, Text } from '../components/ui'

type Tab = 'signin' | 'signup'

export default function LoginScreen({ navigation, route }: any) {
  const theme = useTheme()
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const [tab, setTab] = useState<Tab>(route?.params?.initialTab === 'signup' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    const nextTab = route?.params?.initialTab
    if (nextTab === 'signin' || nextTab === 'signup') {
      setTab(nextTab)
      setError(null)
      setSuccessMsg(null)
    }
  }, [route?.params?.initialTab])

  async function handleSubmit() {
    setError(null)
    setSuccessMsg(null)
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      if (tab === 'signin') {
        await signInWithEmail(email.trim(), password)
      } else {
        await signUpWithEmail(email.trim(), password)
        setSuccessMsg('Account created! Check your email to confirm, then sign in.')
      }
    } catch (err) {
      setError((err as Error).message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen safeEdges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          {navigation?.canGoBack?.() ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={10}
              style={{ alignSelf: 'flex-start', marginBottom: 24 }}
            >
              <Text variant="small" tone="muted">
                {'‹ Back'}
              </Text>
            </TouchableOpacity>
          ) : null}

          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <View
              style={[
                styles.hero,
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
                fontSize: 44,
                lineHeight: 52,
                color: theme.colors.textPrimary,
                letterSpacing: -0.8,
                paddingVertical: 6,
                marginTop: 14,
              }}
            >
              Folio
            </Text>
            <Text
              style={{
                fontFamily: theme.fonts.display,
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginTop: 4,
                letterSpacing: -0.1,
              }}
            >
              Markdown notes, beautifully simple.
            </Text>
          </View>

          <View
            style={[
              styles.segment,
              { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderSubtle },
            ]}
          >
            {(['signin', 'signup'] as const).map((t) => {
              const active = tab === t
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.segmentItem,
                    active && {
                      backgroundColor: theme.colors.bgElevated,
                      ...theme.shadow.button,
                    },
                  ]}
                  onPress={() => {
                    setTab(t)
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{
                      fontFamily: active ? theme.fonts.bodySemibold : theme.fonts.bodyMedium,
                      fontSize: 14,
                      color: active ? theme.colors.textPrimary : theme.colors.textMuted,
                    }}
                  >
                    {t === 'signin' ? 'Sign in' : 'Sign up'}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={{ gap: 12, marginTop: 18 }}>
            <Input
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              placeholder="Password"
              secureTextEntry
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleSubmit}
              returnKeyType="go"
            />
          </View>

          {error ? (
            <Text variant="small" tone="danger" center style={{ marginTop: 14 }}>
              {error}
            </Text>
          ) : null}
          {successMsg ? (
            <Text variant="small" tone="success" center style={{ marginTop: 14 }}>
              {successMsg}
            </Text>
          ) : null}

          <View style={{ height: 20 }} />

          <Button
            label={tab === 'signin' ? 'Sign in' : 'Create account'}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            fullWidth
          />

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
            A quiet place for your thoughts.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  inner: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 36,
  },
  hero: {
    width: 76,
    height: 76,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
})
