import { useEffect, useRef } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { useNotes } from '../contexts/NotesContext'

/** Triggers a sync whenever the device comes back online. */
export function useNotesSync() {
  const { syncNow } = useNotes()
  const isOnline = useOnlineStatus()
  const prevOnline = useRef(isOnline)

  useEffect(() => {
    if (!prevOnline.current && isOnline) {
      syncNow().catch(() => {})
    }
    prevOnline.current = isOnline
  }, [isOnline, syncNow])
}
