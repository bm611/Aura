import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { PluginKey } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/react'

const DateSuggestionPluginKey = new PluginKey('dateSuggestion')

interface DateOption {
  id: string
  label: string
  date: string
}

function getDateOptions(query: string): DateOption[] {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const options: DateOption[] = [
    { id: 'today', label: 'Today', date: today.toISOString() },
    { id: 'yesterday', label: 'Yesterday', date: yesterday.toISOString() },
    { id: 'tomorrow', label: 'Tomorrow', date: tomorrow.toISOString() },
  ]

  if (!query.trim()) return options

  const q = query.toLowerCase()
  return options.filter((o) => o.label.toLowerCase().includes(q) || o.id.includes(q))
}

function createMenu(): HTMLDivElement {
  const element = document.createElement('div')
  element.className = 'folio-date-menu'
  document.body.appendChild(element)
  return element
}

function formatDateChip(isoDate: string): string {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const mon = d.toLocaleString('en-US', { month: 'short' })
  const year = d.getFullYear()
  return `${day}-${mon}-${year}`
}

interface SuggestionProps {
  items: DateOption[]
  command: (item: DateOption) => void
  clientRect?: () => DOMRect | null
}

function renderItems(element: HTMLDivElement, props: SuggestionProps, selectedIndex: number): void {
  element.innerHTML = ''

  props.items.forEach((item, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `folio-date-item ${index === selectedIndex ? 'is-active' : ''}`
    button.innerHTML = `<span class="folio-date-label">${item.label}</span><span class="folio-date-preview">${formatDateChip(item.date)}</span>`
    button.addEventListener('mousedown', (event) => {
      event.preventDefault()
      props.command(item)
    })
    element.appendChild(button)
  })
}

function positionMenu(element: HTMLDivElement, props: SuggestionProps): void {
  const rect = props.clientRect?.()
  if (!rect) return

  element.style.left = `${rect.left + window.scrollX}px`
  element.style.top = `${rect.bottom + window.scrollY + 10}px`
}

export const DateCommand = Extension.create({
  name: 'dateCommand',

  addOptions() {
    return {
      suggestion: {
        char: '@',
        startOfLine: false,
        items: ({ query }: { query: string }) => getDateOptions(query),
        command: ({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: DateOption }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: 'dateMention',
              attrs: { date: props.date },
            })
            .run()
        },
        render: () => {
          let element: HTMLDivElement | null = null
          let selectedIndex = 0
          let currentProps: SuggestionProps | null = null

          const update = (props: SuggestionProps) => {
            currentProps = props
            selectedIndex = Math.min(selectedIndex, Math.max(props.items.length - 1, 0))

            if (!element) {
              element = createMenu()
            }

            renderItems(element, props, selectedIndex)
            positionMenu(element, props)
          }

          const destroy = () => {
            if (element) {
              element.remove()
            }

            element = null
            currentProps = null
            selectedIndex = 0
          }

          return {
            onStart: update,
            onUpdate: update,
            onKeyDown: ({ event }: { event: KeyboardEvent }) => {
              if (!currentProps) return false

              if (event.key === 'ArrowDown') {
                selectedIndex = Math.min(selectedIndex + 1, currentProps.items.length - 1)
                renderItems(element!, currentProps, selectedIndex)
                return true
              }

              if (event.key === 'ArrowUp') {
                selectedIndex = Math.max(selectedIndex - 1, 0)
                renderItems(element!, currentProps, selectedIndex)
                return true
              }

              if (event.key === 'Enter') {
                currentProps.command(currentProps.items[selectedIndex]!)
                return true
              }

              if (event.key === 'Escape') {
                destroy()
                return false
              }

              return false
            },
            onExit: destroy,
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, pluginKey: DateSuggestionPluginKey, ...this.options.suggestion })]
  },
})
