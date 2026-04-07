import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import type { NativeSyntheticEvent, TextInputSelectionChangeEventData } from 'react-native'

export interface Selection {
  start: number
  end: number
}

interface Props {
  text: string
  selection: Selection
  onChange: (newText: string, newSelection: Selection) => void
}

interface FormatAction {
  label: string
  prefix?: string
  suffix?: string
  linePrefix?: string
}

const ACTIONS: FormatAction[] = [
  { label: 'H1', linePrefix: '# ' },
  { label: 'H2', linePrefix: '## ' },
  { label: 'B', prefix: '**', suffix: '**' },
  { label: 'I', prefix: '_', suffix: '_' },
  { label: '`', prefix: '`', suffix: '`' },
  { label: '—', prefix: '```\n', suffix: '\n```' },
  { label: '•', linePrefix: '- ' },
  { label: '1.', linePrefix: '1. ' },
  { label: '❝', linePrefix: '> ' },
]

export function applyFormat(text: string, selection: Selection, action: FormatAction): { text: string; selection: Selection } {
  const { start, end } = selection
  const selected = text.slice(start, end)

  if (action.linePrefix) {
    // Find start of the current line
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    const prefix = action.linePrefix
    const newText = text.slice(0, lineStart) + prefix + text.slice(lineStart)
    const offset = prefix.length
    return {
      text: newText,
      selection: { start: start + offset, end: end + offset },
    }
  }

  const prefix = action.prefix ?? ''
  const suffix = action.suffix ?? prefix

  if (start === end) {
    // No selection: insert markers and place cursor between them
    const newText = text.slice(0, start) + prefix + suffix + text.slice(start)
    const cursor = start + prefix.length
    return { text: newText, selection: { start: cursor, end: cursor } }
  }

  // Wrap selection
  const newText = text.slice(0, start) + prefix + selected + suffix + text.slice(end)
  return {
    text: newText,
    selection: { start: end + prefix.length + suffix.length, end: end + prefix.length + suffix.length },
  }
}

export type { NativeSyntheticEvent, TextInputSelectionChangeEventData }

export default function FormatToolbar({ text, selection, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="always"
    >
      {ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={styles.btn}
          onPress={() => {
            const result = applyFormat(text, selection, action)
            onChange(result.text, result.selection)
          }}
        >
          <Text style={styles.btnText}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a2a',
    maxHeight: 44,
  },
  content: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  btnText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
})
