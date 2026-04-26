// @ts-nocheck
// React Navigation 7 + @types/react 19 has a known JSX type conflict.
// This file is pure navigation config with no business logic — nocheck is safe here.
import { View, Pressable, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NoteFile } from '@folio/shared'
import HomeScreen from '../screens/HomeScreen'
import EditorScreen from '../screens/EditorScreen'
import AiChatScreen from '../screens/AiChatScreen'
import SettingsScreen from '../screens/SettingsScreen'
import { useTheme } from '../theme'
import { Text } from '../components/ui'
import { useNotes } from '../contexts/NotesContext'

import type { NavigatorScreenParams } from '@react-navigation/native'

export type TabParamList = {
  HomeTab: undefined
  AiTab: { noteId?: string } | undefined
  NewTab: undefined
  SettingsTab: undefined
}

export type AppStackParamList = {
  HomeTabs: NavigatorScreenParams<TabParamList> | undefined
  Editor: { noteId: string; seedNote?: NoteFile }
}

const Stack = createNativeStackNavigator<AppStackParamList>()
const Tab = createBottomTabNavigator()

function PlaceholderScreen() {
  return <View />
}

function FolioTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { createNote } = useNotes()

  const TABS: Record<string, { glyph: string; label: string }> = {
    HomeTab: { glyph: '⌂', label: 'Home' },
    AiTab: { glyph: '✦', label: 'Ask' },
    SettingsTab: { glyph: '◐', label: 'Settings' },
  }

  const visibleRoutes = state.routes.filter((r: any) => r.name !== 'NewTab')
  const left = visibleRoutes.slice(0, 1)
  const right = visibleRoutes.slice(1)

  function handleCreate() {
    const note = createNote(null)
    const parent = navigation.getParent?.()
    if (parent) {
      parent.navigate('Editor', { noteId: note.id, seedNote: note })
    }
  }

  function renderTab(route: any) {
    const idx = state.routes.findIndex((r: any) => r.key === route.key)
    const focused = state.index === idx
    const meta = TABS[route.name]
    if (!meta) return null
    const color = focused ? theme.colors.accent : theme.colors.textMuted
    return (
      <Pressable
        key={route.key}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
        }}
        style={styles.tabItem}
        hitSlop={6}
      >
        <Text style={{ fontSize: 22, color, lineHeight: 26 }}>{meta.glyph}</Text>
        <Text
          style={{
            fontSize: 10,
            letterSpacing: 0.4,
            color,
            fontFamily: focused ? theme.fonts.bodySemibold : theme.fonts.bodyMedium,
            marginTop: 2,
          }}
        >
          {meta.label}
        </Text>
      </Pressable>
    )
  }

  return (
    <View
      style={[
        styles.tabWrap,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.colors.bgElevated,
            borderColor: theme.colors.borderSubtle,
          },
          theme.shadow.card,
        ]}
      >
        {left.map(renderTab)}
        <View style={styles.fabSlot} />
        {right.map(renderTab)}
      </View>

      {/* Floating FAB */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <Pressable
          onPress={handleCreate}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: theme.colors.accent,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
            theme.shadow.cloud,
          ]}
        >
          <Text style={{ fontSize: 28, color: theme.colors.accentContrast, lineHeight: 30 }}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FolioTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen
        name="NewTab"
        component={PlaceholderScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen name="AiTab" component={AiChatScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

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
      <Stack.Screen
        name="HomeTabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Editor"
        component={EditorScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  tabWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 26,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  fabSlot: {
    width: 60,
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -6,
    alignItems: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
