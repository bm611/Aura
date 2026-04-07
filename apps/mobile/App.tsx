// Initialize Supabase before any component mounts
import './src/lib/supabaseClient'

import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/contexts/AuthContext'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <AuthProvider>
      {/* @ts-ignore — React Navigation 7 + @types/react 19 JSX type conflict */}
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  )
}
