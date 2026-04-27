import { useMemo } from 'react'

import type { TreeNode } from '../types'

interface DayTheme {
  greeting: string
  message: string
}

const DAY_THEMES: DayTheme[] = [
  { greeting: 'Sunday rest',     message: 'Rest is part of the practice. What are you grateful for?' },
  { greeting: 'Monday energy',   message: 'New week, blank page. Make it count.' },
  { greeting: 'Tuesday focus',   message: "Yesterday's you already started. Keep going." },
  { greeting: 'Wednesday momentum', message: "You're right in the middle of something great." },
  { greeting: 'Thursday drive',  message: "One day closer. Make today's words count." },
  { greeting: 'Friday finish',   message: 'End the week with something you are proud of.' },
  { greeting: 'Saturday space',  message: 'Slow down. Write something just for you.' },
]

interface DailyHeaderProps {
  note: TreeNode
}

export default function DailyHeader({ note }: DailyHeaderProps) {
  const dayIndex = useMemo(() => {
    if (!note?.createdAt) return new Date().getDay()
    return new Date(note.createdAt).getDay()
  }, [note])

  const theme = DAY_THEMES[dayIndex]!

  const dateLabel = useMemo(() => {
    const d = note?.createdAt ? new Date(note.createdAt) : new Date()
    return d
      .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      .toUpperCase()
      .replace(',', ' ·')
  }, [note])

  return (
    <div className="panel-bordered px-5 py-4 flex flex-col gap-1">
      <h2 className="title-script text-[42px] leading-none">
        {theme.greeting}.
      </h2>
      <p className="label-mono">
        {dateLabel} — {theme.message}
      </p>
    </div>
  )
}
