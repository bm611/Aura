import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { AuraTaskItem } from '../extensions/TaskItemNode'
import TaskList from '@tiptap/extension-task-list'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { textblockTypeInputRule, wrappingInputRule } from '@tiptap/core'
import { createLowlight, all } from 'lowlight'
import { CalloutNode } from '../extensions/CalloutNode'
import { SlashCommand } from '../extensions/SlashCommand'
import { MarkdownPaste } from '../extensions/MarkdownPaste'
import TableView from '../extensions/TableView'

const lowlight = createLowlight(all)

const AuraTaskList = TaskList.extend({
  addInputRules() {
    return [
      wrappingInputRule({
        find: /^\s*(\[\s\])$/,
        type: this.type,
        getAttributes: () => ({ checked: false }),
      }),
    ]
  },
})

const AuraTable = Table.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TableView)
  },
  addKeyboardShortcuts() {
    const parentShortcuts = this.parent?.() || {}
    
    const createDeleteHandler = (shortcutName) => (props) => {
      // If parent handles it (like deleteTableWhenAllCellsSelected), let it win
      if (parentShortcuts[shortcutName] && parentShortcuts[shortcutName](props)) {
        return true
      }

      const { editor } = props
      const { selection } = editor.state
      
      if (selection && typeof selection.isRowSelection === 'function' && selection.isRowSelection()) {
        if (editor.chain().focus().deleteRow().run()) {
          return true
        }
      }
      if (selection && typeof selection.isColSelection === 'function' && selection.isColSelection()) {
        if (editor.chain().focus().deleteColumn().run()) {
          return true
        }
      }
      return false
    }

    return {
      ...parentShortcuts,
      Backspace: createDeleteHandler('Backspace'),
      Delete: createDeleteHandler('Delete'),
      'Mod-Backspace': createDeleteHandler('Mod-Backspace'),
      'Mod-Delete': createDeleteHandler('Mod-Delete'),
    }
  }
})

const AuraCodeBlockLowlight = CodeBlockLowlight.extend({
  addInputRules() {
    const parentRules = this.parent?.() ?? []
    return [
      ...parentRules,
      textblockTypeInputRule({
        find: /^```([a-z]+)?$/,
        type: this.type,
        getAttributes: (match) => ({ language: match?.[1] || null }),
      }),
    ]
  },
})

export function createAuraEditorExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      link: false,
      codeBlock: false,
    }),

    Link.configure({
      autolink: true,
      defaultProtocol: 'https',
      openOnClick: false,
    }),
    AuraTaskList,
    AuraTaskItem.configure({
      nested: true,
    }),
    AuraTable.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    AuraCodeBlockLowlight.configure({
      lowlight,
    }),
    CalloutNode,
    SlashCommand,
    MarkdownPaste,
  ]
}
