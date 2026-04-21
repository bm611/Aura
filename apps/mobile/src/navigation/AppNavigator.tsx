// @ts-nocheck
// React Navigation 7 + @types/react 19 has a known JSX type conflict.
// This file is pure navigation config with no business logic — nocheck is safe here.
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import NoteListScreen from '../screens/NoteListScreen'
import EditorScreen from '../screens/EditorScreen'
import AiChatScreen from '../screens/AiChatScreen'
import SettingsScreen from '../screens/SettingsScreen'
import { useTheme } from '../theme'

export type AppStackParamList = {
  NoteList: undefined
  Editor: { noteId: string }
  AiChat: { noteId?: string }
  Settings: undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

export default function AppNavigator() {
  const theme = useTheme()
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bgDeep },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontFamily: theme.fonts.displaySemibold,
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerBackTitle: '',
        contentStyle: { backgroundColor: theme.colors.bgDeep },
      }}
    >
      <Stack.Screen name="NoteList" component={NoteListScreen} options={{ title: 'Folio' }} />
      <Stack.Screen name="Editor" component={EditorScreen} options={{ title: '' }} />
      <Stack.Screen
        name="AiChat"
        component={AiChatScreen}
        options={{ title: 'Ask Folio', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', presentation: 'modal' }}
      />
    </Stack.Navigator>
  )
}
