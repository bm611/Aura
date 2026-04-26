import { ScrollView, StyleSheet, View } from 'react-native'

import { Button, Card, Screen, Text } from '../components/ui'
import { useTheme } from '../theme'

const FEATURES = [
  {
    tone: 'sage' as const,
    glyph: '❋',
    title: 'Write in Markdown',
    description: 'Headings, lists, and tasks render as you type — no formatting friction.',
  },
  {
    tone: 'peach' as const,
    glyph: '🌱',
    title: 'Local-first by default',
    description: 'Capture ideas instantly. Sync when you\'re ready, on your terms.',
  },
  {
    tone: 'lavender' as const,
    glyph: '✦',
    title: 'Ask AI about your notes',
    description: 'Summaries, rewrites, and brainstorming grounded in your own words.',
  },
  {
    tone: 'cream' as const,
    glyph: '❀',
    title: 'Beautifully organized',
    description: 'Folders and a focused sidebar keep your library gentle and simple.',
  },
]

export default function WelcomeScreen({ navigation }: any) {
  const theme = useTheme()

  const getInk = (tone: 'sage' | 'peach' | 'lavender' | 'cream') =>
    tone === 'sage'
      ? theme.colors.pastelSageInk
      : tone === 'peach'
      ? theme.colors.pastelPeachInk
      : tone === 'lavender'
      ? theme.colors.pastelLavenderInk
      : theme.colors.pastelCreamInk

  return (
    <Screen safeEdges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: theme.spacing[6],
            paddingHorizontal: theme.spacing[5],
            paddingTop: theme.spacing[7],
            paddingBottom: theme.spacing[7],
          },
        ]}
      >
        <View style={{ gap: theme.spacing[3] }}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.colors.pastelSage,
                borderColor: 'rgba(22,52,40,0.08)',
              },
            ]}
          >
            <Text style={{ fontSize: 44 }}>🦊</Text>
          </View>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.displaySemibold,
              fontSize: 40,
              lineHeight: 46,
              letterSpacing: -0.8,
              marginTop: 8,
            }}
          >
            Folio
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.display,
              fontSize: 20,
              lineHeight: 28,
              color: theme.colors.textSecondary,
              letterSpacing: -0.2,
              maxWidth: 320,
            }}
          >
            Markdown notes, beautifully simple.
          </Text>
          <Text variant="body" tone="secondary" style={{ maxWidth: 340, marginTop: 4 }}>
            A quiet space for writing — rich markdown, AI assistance, and optional sync across
            devices.
          </Text>
        </View>

        <View style={{ gap: theme.spacing[3] }}>
          {FEATURES.map((feature) => (
            <Card key={feature.title} tone={feature.tone} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={[
                    styles.featureGlyph,
                    { backgroundColor: 'rgba(255,255,255,0.55)' },
                  ]}
                >
                  <Text style={{ fontSize: 16, color: getInk(feature.tone) }}>{feature.glyph}</Text>
                </View>
                <Text
                  style={{
                    fontFamily: theme.fonts.bodySemibold,
                    fontSize: 16,
                    color: getInk(feature.tone),
                  }}
                >
                  {feature.title}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: 14,
                  lineHeight: 20,
                  color: getInk(feature.tone),
                  opacity: 0.82,
                }}
              >
                {feature.description}
              </Text>
            </Card>
          ))}
        </View>

        <View style={{ gap: theme.spacing[3], marginTop: theme.spacing[2] }}>
          <Button
            label="Create account"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Login', { initialTab: 'signup' })}
          />
          <Button
            label="Sign in to sync"
            variant="subtle"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Login', { initialTab: 'signin' })}
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  hero: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  featureGlyph: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
