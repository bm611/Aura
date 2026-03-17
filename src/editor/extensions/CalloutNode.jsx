import { useState } from 'react'
import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import {
  IconAlertCircle,
  IconAlertOctagon,
  IconAlertTriangle,
  IconBug,
  IconChevronDown,
  IconCircleCheck,
  IconCircleX,
  IconClipboardList,
  IconFileText,
  IconFlame,
  IconHelpCircle,
  IconInfoCircle,
  IconList,
  IconMessageCircle,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'

const CALLOUT_INPUT_PATTERN = /^> \[!([A-Za-z-]+)\]([+-])?\s*(.*)$/
const CALLOUT_KINDS = ['note', 'tip', 'warning', 'caution', 'important']

const CALLOUT_ICONS = {
  abstract: IconFileText,
  bug: IconBug,
  caution: IconAlertTriangle,
  danger: IconAlertOctagon,
  example: IconList,
  failure: IconCircleX,
  important: IconAlertCircle,
  info: IconInfoCircle,
  note: IconPencil,
  question: IconHelpCircle,
  quote: IconMessageCircle,
  success: IconCircleCheck,
  tip: IconFlame,
  todo: IconClipboardList,
  warning: IconAlertTriangle,
}

function getDefaultTitle(calloutKind = 'note') {
  return `${calloutKind.charAt(0).toUpperCase()}${calloutKind.slice(1)}`
}

function CalloutView({ node, updateAttributes, deleteNode, selected }) {
  const [collapsed, setCollapsed] = useState(Boolean(node.attrs.defaultCollapsed))
  const calloutKind = node.attrs.calloutKind || 'note'
  const Icon = CALLOUT_ICONS[calloutKind] || CALLOUT_ICONS.note

  const handleToggleKind = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const currentIndex = CALLOUT_KINDS.indexOf(calloutKind)
    const nextIndex = (currentIndex + 1) % CALLOUT_KINDS.length
    const nextKind = CALLOUT_KINDS[nextIndex]
    updateAttributes({
      calloutKind: nextKind,
      title: node.attrs.title === getDefaultTitle(calloutKind) ? getDefaultTitle(nextKind) : node.attrs.title,
    })
  }

  return (
    <NodeViewWrapper
      className={`aura-callout aura-callout-${calloutKind} ${selected ? 'is-selected' : ''}`}
      data-callout-kind={calloutKind}
    >
      <div className="aura-callout-header" contentEditable={false}>
        <button
          type="button"
          className="aura-callout-icon-btn"
          onClick={handleToggleKind}
          title="Change type"
        >
          <Icon size={16} stroke={1.8} />
        </button>
        <input
          className="aura-callout-title"
          value={node.attrs.title || getDefaultTitle(calloutKind)}
          onChange={(event) => updateAttributes({ title: event.target.value })}
          onMouseDown={(event) => event.stopPropagation()}
          aria-label="Callout title"
        />
        <div className="aura-callout-actions">
          {node.attrs.foldable ? (
            <button
              type="button"
              className={`aura-callout-toggle ${collapsed ? 'is-collapsed' : ''}`}
              onClick={() => setCollapsed((current) => !current)}
              onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              aria-label={collapsed ? 'Expand callout' : 'Collapse callout'}
            >
              <IconChevronDown size={14} stroke={1.7} />
            </button>
          ) : null}
          <button
            type="button"
            className="aura-callout-delete"
            onClick={deleteNode}
            onMouseDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            title="Delete callout"
          >
            <IconTrash size={14} stroke={1.7} />
          </button>
        </div>
      </div>
      <NodeViewContent className={`aura-callout-body ${collapsed ? 'is-collapsed' : ''}`} />
    </NodeViewWrapper>
  )
}

export const CalloutNode = Node.create({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      calloutKind: {
        default: 'note',
        parseHTML: (element) => element.getAttribute('data-callout-kind') || 'note',
        renderHTML: (attributes) => ({
          'data-callout-kind': attributes.calloutKind,
        }),
      },
      title: {
        default: 'Note',
        parseHTML: (element) => element.getAttribute('data-callout-title') || 'Note',
        renderHTML: (attributes) => ({
          'data-callout-title': attributes.title,
        }),
      },
      foldable: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-callout-foldable') === 'true',
        renderHTML: (attributes) => ({
          'data-callout-foldable': attributes.foldable ? 'true' : 'false',
        }),
      },
      defaultCollapsed: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-callout-collapsed') === 'true',
        renderHTML: (attributes) => ({
          'data-callout-collapsed': attributes.defaultCollapsed ? 'true' : 'false',
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView)
  },

  addCommands() {
    return {
      insertCallout:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              calloutKind: attrs.calloutKind || 'note',
              title: attrs.title || getDefaultTitle(attrs.calloutKind || 'note'),
              foldable: Boolean(attrs.foldable),
              defaultCollapsed: Boolean(attrs.defaultCollapsed),
            },
            content: [{ type: 'paragraph' }],
          }),
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: CALLOUT_INPUT_PATTERN,
        handler: ({ chain, range, match }) => {
          const calloutKind = (match[1] || 'note').toLowerCase()
          const foldMarker = match[2] || ''
          const title = match[3]?.trim() || getDefaultTitle(calloutKind)

          chain()
            .deleteRange(range)
            .insertContent({
              type: this.name,
              attrs: {
                calloutKind,
                title,
                foldable: foldMarker === '-' || foldMarker === '+',
                defaultCollapsed: foldMarker === '-',
              },
              content: [{ type: 'paragraph' }],
            })
            .run()
        },
      }),
    ]
  },
})
