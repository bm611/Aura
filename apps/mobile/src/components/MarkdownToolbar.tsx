import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import type { MarkdownEditorHandle, EditorCommand } from './MarkdownEditor'

interface MarkdownToolbarProps {
  editorRef: React.RefObject<MarkdownEditorHandle | null>
}

interface ToolbarAction {
  label: string
  command: EditorCommand
  payload?: Record<string, unknown>
}

const ACTIONS: ToolbarAction[] = [
  { label: 'H1', command: 'heading1' },
  { label: 'H2', command: 'heading2' },
  { label: 'H3', command: 'heading3' },
  { label: 'B', command: 'bold' },
  { label: 'I', command: 'italic' },
  { label: '`', command: 'code' },
  { label: '—', command: 'codeBlock' },
  { label: '•', command: 'bulletList' },
  { label: '1.', command: 'orderedList' },
  { label: '☐', command: 'taskList' },
  { label: '❝', command: 'blockquote' },
  { label: '—', command: 'horizontalRule' },
  { label: '↶', command: 'undo' },
  { label: '↷', command: 'redo' },
]

export default function MarkdownToolbar({ editorRef }: MarkdownToolbarProps) {
  function handlePress(action: ToolbarAction) {
    editorRef.current?.runCommand(action.command, action.payload)
  }

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
          key={action.label + action.command}
          style={styles.btn}
          onPress={() => handlePress(action)}
          activeOpacity={0.6}
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
    maxHeight: 48,
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
    minWidth: 36,
    alignItems: 'center',
  },
  btnText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
})
