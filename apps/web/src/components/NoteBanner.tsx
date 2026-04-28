import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface NoteBannerProps {
	noteId: string
	title: string
	icon?: string | null
	onTitleChange: (title: string) => void
	onTitleKeyDown: (e: React.KeyboardEvent) => void
}

export default function NoteBanner({ noteId, title, onTitleChange, onTitleKeyDown }: NoteBannerProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto'
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
		}
	}, [title])

	return (
		<motion.div
			key={`banner-${noteId}`}
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
		>
			<textarea
				ref={textareaRef}
				value={title}
				onChange={(e) => onTitleChange(e.target.value)}
				onKeyDown={onTitleKeyDown}
				rows={1}
				className="banner-title-input"
				placeholder="Untitled"
			/>
		</motion.div>
	)
}
