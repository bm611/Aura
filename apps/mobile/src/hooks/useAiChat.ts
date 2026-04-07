import { useCallback, useRef, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { streamAiChat } from '@folio/shared'
import type { AiChatRequest } from '@folio/shared'

const OPENROUTER_KEY_STORE = 'openrouter_api_key'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface UseAiChatResult {
  messages: ChatMessage[]
  isStreaming: boolean
  sendMessage: (question: string, noteContents: AiChatRequest['noteContents']) => Promise<void>
  abort: () => void
  noApiKey: boolean
}

let _msgId = 0
function nextId() {
  return String(++_msgId)
}

export function useAiChat(): UseAiChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [noApiKey, setNoApiKey] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (question: string, noteContents: AiChatRequest['noteContents']) => {
    const apiKey = await SecureStore.getItemAsync(OPENROUTER_KEY_STORE)
    if (!apiKey) {
      setNoApiKey(true)
      return
    }
    setNoApiKey(false)

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: question }
    const assistantMsg: ChatMessage = { id: nextId(), role: 'assistant', content: '' }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    await streamAiChat(
      { question, noteContents },
      {
        onToken: (token: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: m.content + token } : m
            )
          )
        },
        onDone: () => {
          setIsStreaming(false)
          abortRef.current = null
        },
        onError: (err: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: `Error: ${err}` } : m
            )
          )
          setIsStreaming(false)
          abortRef.current = null
        },
      },
      apiKey,
      controller.signal
    )
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  return { messages, isStreaming, sendMessage, noApiKey, abort }
}
