// @ts-nocheck
// React Navigation 7 + @types/react 19 has a known JSX type conflict.
// This file is pure navigation config with no business logic — nocheck is safe here.
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import NoteListScreen from '../screens/NoteListScreen'
import EditorScreen from '../screens/EditorScreen'
import AiChatScreen from '../screens/AiChatScreen'
import SettingsScreen from '../screens/SettingsScreen'

export type AppStackParamList = {
  NoteList: undefined
  Editor: { noteId: string }
  AiChat: { noteId?: string }
  Settings: undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0f0f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      <Stack.Screen name="NoteList" component={NoteListScreen} options={{ title: 'Folio' }} />
      <Stack.Screen name="Editor" component={EditorScreen} options={{ title: '' }} />
      <Stack.Screen name="AiChat" component={AiChatScreen} options={{ title: 'AI Chat', presentation: 'modal' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings', presentation: 'modal' }} />
    </Stack.Navigator>
  )
}
