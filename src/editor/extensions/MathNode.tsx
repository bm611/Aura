import { useState, useEffect, useRef, useCallback } from 'react'

import { Node, mergeAttributes, InputRule } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import katex from 'katex'

function MathInlineView({ node, updateAttributes, selected, getPos, editor }: NodeViewProps) {
  const [editing, setEditing] = useState(!node.attrs.latex)
  const inputRef = useRef<HTMLInputElement>(null)
  const renderedRef = useRef<HTMLSpanElement>(null)
  const latex = (node.attrs.latex as string) || ''

  useEffect(() => {
    if (!editing && renderedRef.current && latex) {
      try {
        katex.render(latex, renderedRef.current, {
          throwOnError: false,
          displayMode: false,
        })
      } catch {
        renderedRef.current.textContent = latex
      }
    }
  }, [latex, editing])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const commit = useCallback(() => {
    const value = inputRef.current?.value ?? ''
    if (!value.trim()) {
      const pos = getPos()
      if (typeof pos === 'number') {
        editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
      }
    } else {
      updateAttributes({ latex: value })
      setEditing(false)
    }
  }, [updateAttributes, getPos, editor, node.nodeSize])

  if (editing) {
    return (
      <NodeViewWrapper as="span" className="aura-math-inline is-editing">
        <span className="aura-math-inline-indicator" contentEditable={false}>$</span>
        <input
          ref={inputRef}
          type="text"
          className="aura-math-inline-input"
          defaultValue={latex}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault()
              commit()
            }
          }}
          onBlur={commit}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <span className="aura-math-inline-indicator" contentEditable={false}>$</span>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`aura-math-inline ${selected ? 'is-selected' : ''}`}
      onClick={() => setEditing(true)}
    >
      <span ref={renderedRef} contentEditable={false} />
    </NodeViewWrapper>
  )
}

function MathBlockView({ node, updateAttributes, selected, getPos, editor }: NodeViewProps) {
  const [editing, setEditing] = useState(!node.attrs.latex)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const renderedRef = useRef<HTMLDivElement>(null)
  const latex = (node.attrs.latex as string) || ''

  useEffect(() => {
    if (!editing && renderedRef.current && latex) {
      try {
        katex.render(latex, renderedRef.current, {
          throwOnError: false,
          displayMode: true,
        })
      } catch {
        renderedRef.current.textContent = latex
      }
    }
  }, [latex, editing])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [editing])

  const commit = useCallback(() => {
    const value = textareaRef.current?.value ?? ''
    if (!value.trim()) {
      const pos = getPos()
      if (typeof pos === 'number') {
        editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
      }
    } else {
      updateAttributes({ latex: value })
      setEditing(false)
    }
  }, [updateAttributes, getPos, editor, node.nodeSize])

  if (editing) {
    return (
      <NodeViewWrapper className={`aura-math-block is-editing ${selected ? 'is-selected' : ''}`}>
        <div className="aura-math-block-header" contentEditable={false}>
          <span className="aura-math-block-label">LaTeX</span>
        </div>
        <textarea
          ref={textareaRef}
          className="aura-math-block-input"
          defaultValue={latex}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              commit()
            }
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              commit()
            }
          }}
          onBlur={commit}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }}
          placeholder="Enter LaTeX expression..."
        />
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      className={`aura-math-block ${selected ? 'is-selected' : ''}`}
      onClick={() => setEditing(true)}
    >
      <div ref={renderedRef} className="aura-math-block-rendered" contentEditable={false} />
    </NodeViewWrapper>
  )
}

export const MathInline = Node.create({
  name: 'mathInline',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-latex': attributes.latex,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-type="mathInline"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'mathInline' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView)
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\$([^$]+)\$$/,
        handler: ({ chain, range, match }) => {
          const latex = match[1] || ''
          chain()
            .deleteRange(range)
            .insertContent({
              type: this.name,
              attrs: { latex },
            })
            .run()
        },
      }),
    ]
  },
})

export const MathBlock = Node.create({
  name: 'mathBlock',

  group: 'block',

  atom: true,

  defining: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-latex': attributes.latex,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="mathBlock"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mathBlock' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView)
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^\$\$\s$/,
        handler: ({ chain, range }) => {
          chain()
            .deleteRange(range)
            .insertContent({
              type: this.name,
              attrs: { latex: '' },
            })
            .run()
        },
      }),
    ]
  },
})
