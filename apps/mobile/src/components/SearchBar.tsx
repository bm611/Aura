import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../theme'
import { Text } from './ui'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search notes…' }: Props) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgSurface,
          borderColor: theme.colors.borderSubtle,
          borderRadius: theme.radius.md,
          marginHorizontal: theme.spacing[4],
          marginTop: theme.spacing[2],
          marginBottom: theme.spacing[3],
        },
      ]}
    >
      <Text variant="body" tone="muted" style={{ paddingLeft: theme.spacing[3], fontSize: 15 }}>
        ⌕
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.body,
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.accent}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')} style={styles.clear} hitSlop={8}>
          <Text variant="label" tone="muted">
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    paddingLeft: 10,
    paddingRight: 4,
  },
  clear: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
})
