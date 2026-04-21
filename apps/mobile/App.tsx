// Initialize Supabase before any component mounts
import './src/lib/supabaseClient'

import { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans'
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './src/contexts/AuthContext'
import { ThemeProvider, useTheme } from './src/theme'
import RootNavigator from './src/navigation/RootNavigator'

SplashScreen.preventAutoHideAsync().catch(() => {})

function AppShell() {
  const theme = useTheme()
  return (
    <AuthProvider>
      {/* @ts-ignore — React Navigation 7 + @types/react 19 JSX type conflict */}
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      </NavigationContainer>
    </AuthProvider>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  })

  const onReady = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    onReady()
  }, [onReady])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={{ flex: 1 }}>
          <AppShell />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
