import type { Editor } from '@tiptap/react'
import {
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  CodeIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  CheckListIcon,
  LeftToRightBlockQuoteIcon,
  ListIndentIncreaseIcon,
  ListIndentDecreaseIcon,
} from '@hugeicons/core-free-icons'

import Icon from './Icon'

interface ToolbarAction {
  id: string
  icon: typeof Heading01Icon
  title: string
  action: (editor: Editor) => void
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    id: 'h1',
    icon: Heading01Icon,
    title: 'Heading 1',
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    icon: Heading02Icon,
    title: 'Heading 2',
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    icon: Heading03Icon,
    title: 'Heading 3',
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bold',
    icon: TextBoldIcon,
    title: 'Bold',
    action: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    id: 'italic',
    icon: TextItalicIcon,
    title: 'Italic',
    action: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    id: 'strike',
    icon: TextStrikethroughIcon,
    title: 'Strikethrough',
    action: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    id: 'code',
    icon: CodeIcon,
    title: 'Inline Code',
    action: (e) => e.chain().focus().toggleCode().run(),
  },
  {
    id: 'bullet',
    icon: LeftToRightListBulletIcon,
    title: 'Bullet List',
    action: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'ordered',
    icon: LeftToRightListNumberIcon,
    title: 'Numbered List',
    action: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'todo',
    icon: CheckListIcon,
    title: 'Checklist',
    action: (e) =>
      e
        .chain()
        .focus()
        .insertContent({
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph' }],
            },
          ],
        })
        .run(),
  },
  {
    id: 'quote',
    icon: LeftToRightBlockQuoteIcon,
    title: 'Blockquote',
    action: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'indent',
    icon: ListIndentIncreaseIcon,
    title: 'Indent',
    action: (e) => {
      // Try taskItem first (checklists), then listItem (bullet/ordered lists)
      if (!e.chain().focus().sinkListItem('taskItem').run()) {
        e.chain().focus().sinkListItem('listItem').run()
      }
    },
  },
  {
    id: 'dedent',
    icon: ListIndentDecreaseIcon,
    title: 'Dedent',
    action: (e) => {
      if (!e.chain().focus().liftListItem('taskItem').run()) {
        e.chain().focus().liftListItem('listItem').run()
      }
    },
  },
]

interface MobileEditorToolbarProps {
  editor: Editor | null
}

export default function MobileEditorToolbar({ editor }: MobileEditorToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div
      className="mobile-action-bar mobile-action-bar--editor"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mobile-action-bar-inner mobile-editor-toolbar-inner">
        {TOOLBAR_ACTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onMouseDown={(e) => {
              // Prevent stealing focus from the editor
              e.preventDefault()
              item.action(editor)
            }}
            className="mobile-editor-toolbar-btn"
            title={item.title}
          >
            <Icon icon={item.icon} size={18} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  )
}
