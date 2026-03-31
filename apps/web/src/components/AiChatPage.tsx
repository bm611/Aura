import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

import {
  ArrowUp02Icon,
  Add01Icon,
  Cancel01Icon,
  File01Icon,
  SidebarLeftIcon,
  Copy01Icon,
  Tick01Icon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

import Icon from './Icon'
import { streamAiChat } from '../utils/aiChat'
import type { NoteFile } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface AiChatPageProps {
  notes: NoteFile[]
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  onCloseChat?: () => void
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CodeBlock({ node, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const isBlock = !!match || (className || '').includes('hljs')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = String(children).replace(/\n$/, '')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isBlock) {
    return (
      <code className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 text-[0.9em] font-mono text-[var(--accent)]" {...props}>
        {children}
      </code>
    )
  }

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] font-mono text-sm shadow-sm group">
      {language && (
        <div className="flex items-center justify-between bg-[var(--bg-hover)] px-4 py-1.5 text-xs font-medium text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
          <span>{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
            title="Copy code"
          >
            <Icon icon={copied ? Tick01Icon : Copy01Icon} size={12} strokeWidth={2} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      {!language && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-sm"
            title="Copy code"
          >
            <Icon icon={copied ? Tick01Icon : Copy01Icon} size={14} strokeWidth={2} />
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 m-0 bg-transparent border-none">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className={`group ${isUser ? 'flex justify-end' : 'w-full'} ${!isUser ? 'mb-8 mt-2' : ''}`}
    >
      <div
        className={`relative px-3.5 py-2 text-[14.5px] leading-relaxed [text-wrap:pretty] ${
          isUser
            ? 'max-w-[88%] rounded-2xl rounded-tr-sm text-white md:max-w-[82%]'
            : 'w-full px-0 py-0 text-[var(--text-primary)]'
        }`}
        style={
          isUser
            ? {
                background: 'var(--accent)',
                boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 25%, transparent)',
              }
            : undefined
        }
      >
        {isUser ? (
          <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content}
          </span>
        ) : (
          <div className="ai-markdown-content w-full overflow-hidden break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({ children }) => <>{children}</>,
                code: CodeBlock,
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
                h1: ({ children }) => <h1 className="mb-3 mt-4 text-xl font-bold">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-3 mt-4 text-lg font-bold">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-3 text-base font-bold">{children}</h3>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-[var(--accent)] pl-3 text-[var(--text-muted)] italic my-2">{children}</blockquote>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">{children}</a>,
              }}
            >
              {message.content}
            </ReactMarkdown>
            
            {!message.streaming && (
              <div className="absolute -bottom-8 left-0 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-2">
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-[background,color,border-color,transform] duration-150 hover:border-[var(--border-default)] hover:text-[var(--text-primary)] active:scale-[0.96] shadow-sm"
                  title="Copy response"
                >
                  <Icon icon={copied ? Tick01Icon : Copy01Icon} size={11} strokeWidth={2.2} />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}
        {message.streaming && (
          <span
            className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-px align-middle"
            style={{
              background: 'var(--text-muted)',
              animation: 'chat-cursor-blink 1s steps(1) infinite',
            }}
          />
        )}
      </div>
    </motion.div>
  )
}

function MentionPill({
  note,
  onRemove,
}: {
  note: NoteFile
  onRemove: (id: string) => void
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.88, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.88, filter: 'blur(4px)' }}
      transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--border-default)_80%,transparent)] bg-[color-mix(in_srgb,var(--bg-primary)_70%,var(--bg-elevated))] px-2.5 py-1 text-[11px] font-medium tracking-[0.02em] text-[var(--text-secondary)] shadow-[0_6px_18px_-16px_rgba(0,0,0,0.8)]"
    >
      <Icon icon={File01Icon} size={11} strokeWidth={2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <span className="max-w-[120px] truncate">{note.title || note.name || 'Untitled'}</span>
      <button
        type="button"
        onClick={() => onRemove(note.id)}
        className="relative ml-0.5 flex h-4 w-4 items-center justify-center rounded-full opacity-45 transition-[opacity,transform,color] hover:opacity-100 hover:text-[var(--text-primary)] active:scale-[0.96] after:absolute after:-inset-2"
        aria-label={`Remove ${note.title}`}
      >
        <Icon icon={Cancel01Icon} size={9} strokeWidth={2.5} />
      </button>
    </motion.span>
  )
}

function AiChatEmptyPrompt() {
  return (
    <div className="flex select-none flex-col items-center justify-center px-4 pb-1 pt-1 md:pb-2 md:pt-2">
      <div className="relative h-32 w-36 md:h-44 md:w-48">
        <svg
          viewBox="0 0 192 176"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Glow backdrop */}
          <motion.ellipse
            cx="96"
            cy="110"
            rx="64"
            ry="18"
            fill="var(--accent)"
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: [0.06, 0.12, 0.06], scaleX: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Abstract background card */}
          <motion.g
            initial={{ opacity: 0, y: 14, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
            style={{ transformOrigin: '96px 95px' }}
          >
            <motion.rect
              x="56"
              y="36"
              width="80"
              height="100"
              rx="16"
              fill="var(--bg-elevated)"
              stroke="var(--border-subtle)"
              strokeWidth="1.2"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
          </motion.g>

          {/* Front AI card */}
          <motion.g
            initial={{ opacity: 0, y: 20, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 3 }}
            transition={{ duration: 0.65, delay: 0.55, ease: [0.25, 1, 0.5, 1] }}
            style={{ transformOrigin: '96px 95px' }}
          >
            <motion.rect
              x="44"
              y="26"
              width="104"
              height="104"
              rx="20"
              fill="var(--bg-surface)"
              stroke="var(--border-default)"
              strokeWidth="1.2"
              animate={{ y: [0, -5, 0], rotate: [3, 4.5, 3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '96px 78px' }}
            />
            
            {/* Top accent bar */}
            <motion.rect
              x="44"
              y="26"
              width="104"
              height="24"
              rx="20"
              fill="var(--accent)"
              opacity="0.12"
              animate={{ opacity: [0.12, 0.2, 0.12] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            {/* Central Sparkle Group */}
            <motion.g
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{ transformOrigin: '96px 72px' }}
            >
              {/* Main big sparkle */}
              <motion.path
                d="M96 46C96 46 98.5 63 113 65C98.5 67 96 84 96 84C96 84 93.5 67 79 65C93.5 63 96 46 96 46Z"
                fill="var(--accent)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1, ease: [0.34, 1.56, 0.64, 1] }}
              />
              
              {/* Top right small sparkle */}
              <motion.path
                d="M122 36C122 36 123 44 128 45C123 46 122 54 122 54C122 54 121 46 116 45C121 44 122 36 122 36Z"
                fill="var(--accent)"
                opacity="0.8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ duration: 0.5, delay: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
              />
              
              {/* Bottom left small sparkle */}
              <motion.path
                d="M74 80C74 80 74.8 86 78.5 86.5C74.8 87 74 93 74 93C74 93 73.2 87 69.5 86.5C73.2 86 74 80 74 80Z"
                fill="var(--accent)"
                opacity="0.6"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.6 }}
                transition={{ duration: 0.5, delay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </motion.g>

            {/* AI thinking waveform lines */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              {[82, 90, 98, 106].map((x, i) => (
                <motion.line
                  key={x}
                  x1={x}
                  y1="106"
                  x2={x}
                  y2="106"
                  stroke="var(--border-default)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ 
                    y1: [106, 106 - (i % 2 === 0 ? 6 : 4), 106], 
                    y2: [106, 106 + (i % 2 === 0 ? 6 : 4), 106] 
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.g>
          </motion.g>

          {/* Orbiting sparkle ring - matching the theme */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '96px 78px' }}
          >
            {[0, 72, 144, 216, 288].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const r = 66;
              const cx = 96 + r * Math.cos(rad);
              const cy = 78 + r * Math.sin(rad);
              return (
                <motion.circle
                  key={deg}
                  cx={cx}
                  cy={cy}
                  r={i % 2 === 0 ? 2.5 : 1.5}
                  fill={i % 2 === 0 ? 'var(--accent)' : 'var(--color-h2)'}
                  animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4
                  }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              );
            })}
          </motion.g>

          {/* Floating ink drops - matching the theme */}
          {[
            { x: 32, y: 44, delay: 0.8, color: 'var(--accent)' },
            { x: 158, y: 58, delay: 1.4, color: 'var(--color-h2)' },
            { x: 148, y: 128, delay: 2.1, color: 'var(--success)' }
          ].map(({ x, y, delay, color }, i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill={color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0], y: [0, -12, -20] }}
              transition={{
                duration: 2.8,
                delay,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeOut'
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AiChatPage({ notes, sidebarCollapsed, onToggleSidebar, onCloseChat }: AiChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [mentionedNotes, setMentionedNotes] = useState<NoteFile[]>([])
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionAnchorIndex, setMentionAnchorIndex] = useState<number>(-1)
  const [highlightedMention, setHighlightedMention] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasMessages = messages.length > 0

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Auto-resize textarea ─────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const nextHeight = Math.min(Math.max(ta.scrollHeight, 32), 160)
    ta.style.height = `${nextHeight}px`
    ta.style.overflowY = ta.scrollHeight > 160 ? 'auto' : 'hidden'
  }, [inputValue])

  // ── Mention filtering ────────────────────────────────────────────────────
  const filteredMentions = useMemo(
    () =>
      mentionQuery !== null
        ? notes
            .filter((n) => !n.deletedAt)
            .filter((n) => {
              const title = (n.title || n.name || '').toLowerCase()
              return title.includes(mentionQuery.toLowerCase())
            })
            .filter((n) => !mentionedNotes.find((m) => m.id === n.id))
            .slice(0, 8)
        : [],
    [mentionQuery, notes, mentionedNotes]
  )



  // ── Input change handler ─────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      setInputValue(val)

      const cursor = e.target.selectionStart ?? val.length
      const textBefore = val.slice(0, cursor)
      const atMatch = textBefore.match(/@([^@\s]*)$/)

      if (atMatch) {
        setMentionQuery(atMatch[1] ?? '')
        setMentionAnchorIndex(textBefore.lastIndexOf('@'))
        setHighlightedMention(0)
      } else {
        setMentionQuery(null)
        setMentionAnchorIndex(-1)
        setHighlightedMention(0)
      }
    },
    []
  )

  // ── Select a mentioned note ──────────────────────────────────────────────
  const selectMention = useCallback(
    (note: NoteFile) => {
      if (mentionAnchorIndex === -1) return
      const before = inputValue.slice(0, mentionAnchorIndex)
      const after = inputValue.slice(mentionAnchorIndex + 1 + (mentionQuery?.length ?? 0))
      setInputValue(before + after)
      setMentionedNotes((prev) => [...prev, note])
      setMentionQuery(null)
      setMentionAnchorIndex(-1)
      setTimeout(() => textareaRef.current?.focus(), 0)
    },
    [inputValue, mentionAnchorIndex, mentionQuery]
  )

  const removeMention = useCallback((id: string) => {
    setMentionedNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const question = (overrideText ?? inputValue).trim()
      if (!question || isStreaming) return

      setError(null)
      const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: question }
      const assistantId = crypto.randomUUID()
      const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', streaming: true }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setInputValue('')
      setMentionQuery(null)
      setIsStreaming(true)

      const abort = new AbortController()
      abortRef.current = abort

      await streamAiChat(
        {
          question,
          noteContents: mentionedNotes.map((n) => ({
            title: n.title || n.name || 'Untitled',
            content: n.content,
          })),
        },
        {
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m))
            )
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
            )
            setIsStreaming(false)
            abortRef.current = null
          },
          onError: (err) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
            )
            setError(err)
            setIsStreaming(false)
            abortRef.current = null
          },
        },
        abort.signal
      )
    },
    [inputValue, isStreaming, mentionedNotes]
  )

  // ── New chat ──────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setMentionedNotes([])
    setInputValue('')
    setMentionQuery(null)
    setError(null)
    setIsStreaming(false)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [])

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionQuery !== null && filteredMentions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setHighlightedMention((i) => Math.min(i + 1, filteredMentions.length - 1))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setHighlightedMention((i) => Math.max(i - 1, 0))
          return
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          const note = filteredMentions[highlightedMention]
          if (note) selectMention(note)
          return
        }
        if (e.key === 'Escape') {
          setMentionQuery(null)
          return
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [mentionQuery, filteredMentions, highlightedMention, selectMention, sendMessage]
  )

  // ─── Shared input box ─────────────────────────────────────────────────────
  const inputBox = (
    <div className="relative w-full">
      <AnimatePresence initial={false}>
        {mentionedNotes.length > 0 && !hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 4, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
            className="mb-3 flex flex-wrap gap-1.5"
          >
            {mentionedNotes.map((note) => (
              <MentionPill key={note.id} note={note} onRemove={removeMention} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* @ mention dropdown */}
      <AnimatePresence>
        {mentionQuery !== null && filteredMentions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 4, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.13, ease: [0.2, 0, 0, 1] }}
              className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-[22px] border border-[color-mix(in_srgb,var(--border-default)_80%,transparent)] bg-[color-mix(in_srgb,var(--bg-primary)_12%,var(--bg-elevated))] py-1.5 backdrop-blur-sm"
              style={{ boxShadow: '0 24px 48px -32px rgba(0,0,0,0.55), 0 10px 24px -18px color-mix(in srgb, var(--accent) 20%, transparent)' }}
            >
            <div className="px-3 pb-1 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Notes
              </span>
            </div>
            {filteredMentions.map((note, idx) => (
              <button
                key={note.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectMention(note)
                }}
                onMouseEnter={() => setHighlightedMention(idx)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-100 ${
                  idx === highlightedMention
                    ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon icon={File01Icon} size={13} strokeWidth={2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span className="truncate">{note.title || note.name || 'Untitled'}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative overflow-hidden rounded-[24px] border border-[color-mix(in_srgb,var(--border-default)_76%,transparent)] bg-[color-mix(in_srgb,var(--bg-primary)_16%,var(--bg-elevated))] shadow-[0_30px_90px_-48px_color-mix(in_srgb,var(--accent)_24%,transparent),0_20px_48px_-34px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-[color-mix(in_srgb,var(--accent)_34%,var(--border-default))] focus-within:bg-[color-mix(in_srgb,var(--bg-primary)_10%,var(--bg-surface))] focus-within:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_22%,transparent),0_34px_90px_-48px_color-mix(in_srgb,var(--accent)_30%,transparent),0_22px_48px_-30px_rgba(0,0,0,0.58)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, white 10%, transparent), transparent 32%, color-mix(in srgb, var(--accent) 3%, transparent) 100%)',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, white 32%, transparent), transparent)' }}
        />

        <div className="relative z-10 px-4 py-4 md:px-6 md:py-5">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="m-0 min-h-[32px] w-full resize-none bg-transparent py-0 text-[15px] leading-8 text-[var(--text-primary)] outline-none placeholder:text-[color-mix(in_srgb,var(--text-muted)_92%,transparent)] font-mono tracking-[0.015em] md:text-[17px]"
            style={{ maxHeight: '160px', overflowY: 'hidden' }}
            disabled={isStreaming}
            autoFocus
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isStreaming}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-transparent transition-[transform,opacity,background,box-shadow,color,border-color] duration-150 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-45 after:absolute after:-inset-2 md:h-11 md:w-11 md:rounded-[15px]"
              style={{
                background: inputValue.trim() && !isStreaming ? 'var(--accent)' : 'color-mix(in srgb, var(--bg-primary) 28%, var(--bg-hover))',
                color: inputValue.trim() && !isStreaming ? 'white' : 'var(--text-muted)',
                borderColor:
                  inputValue.trim() && !isStreaming
                    ? 'color-mix(in srgb, white 18%, var(--accent))'
                    : 'color-mix(in srgb, var(--border-default) 84%, transparent)',
                boxShadow:
                  inputValue.trim() && !isStreaming
                    ? '0 14px 24px -16px color-mix(in srgb, var(--accent) 58%, transparent), inset 0 1px 0 color-mix(in srgb, white 22%, transparent)'
                    : 'inset 0 1px 0 color-mix(in srgb, white 8%, transparent)',
              }}
              aria-label="Send message"
            >
              <Icon icon={ArrowUp02Icon} size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes chat-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <div className="relative flex flex-1 min-w-0 flex-col max-md:rounded-none rounded-2xl bg-[var(--bg-primary)] overflow-hidden">

        {/* ── Persistent top bar ───────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between px-4 py-2 md:px-5">
          {/* Left section: Sidebar toggle (desktop) & Back button (mobile) */}
          <div className="flex items-center">
            {sidebarCollapsed ? (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="relative hidden md:flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition-[transform,background-color,color,border-color] duration-150 ease-out hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-subtle)] after:absolute after:-inset-2 active:scale-[0.96]"
                title="Open sidebar (Cmd+B)"
              >
                <Icon icon={SidebarLeftIcon} size={22} strokeWidth={1.5} style={{ transform: 'scaleX(-1)' }} />
              </button>
            ) : (
              <div className="hidden md:block h-10 w-10" />
            )}
            
            <button
              type="button"
              onClick={onCloseChat}
              className="relative flex md:hidden h-10 w-10 items-center justify-center -ml-2 rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.96]"
              title="Back to notes"
            >
              <Icon icon={ArrowLeft01Icon} size={24} strokeWidth={1.8} />
            </button>
          </div>

          {/* New Chat — only when conversation is active */}
          <AnimatePresence>
            {hasMessages && (
              <motion.button
                initial={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
                transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-[background,color,border-color,transform] duration-150 hover:border-[var(--border-default)] hover:text-[var(--text-primary)] active:scale-[0.96]"
              >
                <Icon icon={Add01Icon} size={12} strokeWidth={2.2} />
                New Chat
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {!hasMessages && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              className="absolute inset-0 flex flex-col items-center overflow-y-auto px-5 pt-16 pointer-events-none md:px-6 md:pt-[15vh]"
              style={{ zIndex: 1 }}
            >
              <div className="w-full max-w-[56rem] pb-12 antialiased pointer-events-auto">
                <AiChatEmptyPrompt />
                
                {/* Greeting */}
                <motion.div
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
                  className="mb-5 text-center font-mono md:mb-8"
                >
                  <h2 
                    className="mb-2 text-[1.7rem] font-bold tracking-tight md:text-3xl"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Ask about your notes
                  </h2>
                  <p className="mx-auto max-w-[18rem] text-[13px] tracking-[0.18em] text-[var(--text-muted)] md:max-w-none md:text-[14px] md:tracking-wide">
                    Search across all your knowledge instantly
                  </p>
                </motion.div>

                {/* Input - larger and more prominent */}
                <motion.div
                  initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.35, delay: 0.07, ease: [0.2, 0, 0, 1] }}
                  className="mb-2"
                >
                  {inputBox}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Conversation view ────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {hasMessages && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
              <div 
                  className="mx-auto flex flex-col gap-3"
                  style={{ maxWidth: '860px' }}
                >
                  {/* Fade blur at bottom */}
                  <div 
                    className="pointer-events-none h-16 -mb-4"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, var(--bg-primary))',
                      maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
                    }}
                  />
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input pinned at bottom */}
              <div className="shrink-0 px-4 pt-3 pb-4 md:px-6 md:pt-4 md:pb-5">
                <div 
                  className="mx-auto"
                  style={{ maxWidth: '860px' }}
                >
                  {inputBox}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error toast ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              transition={{ duration: 0.18 }}
              className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border px-5 py-2.5 text-sm"
              style={{
                borderColor: 'var(--danger)',
                background: 'color-mix(in srgb, var(--danger) 12%, var(--bg-elevated))',
                color: 'var(--danger)',
                boxShadow: 'var(--neu-shadow)',
              }}
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="relative shrink-0 opacity-60 transition-[opacity,transform] hover:opacity-100 active:scale-[0.96] after:absolute after:-inset-2"
              >
                <Icon icon={Cancel01Icon} size={13} strokeWidth={2.2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}
