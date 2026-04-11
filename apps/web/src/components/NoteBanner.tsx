import { useMemo } from 'react'

// ── SVG pattern generators ──────────────────────────────────────────────────
// Each returns an SVG string rendered in the right side of the banner.

const PATTERNS = [
	// 1 — Concentric arcs (like the Databricks design)
	(color: string) => `
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			${[0, 1, 2, 3, 4, 5].map(i => {
				const r = 60 + i * 30
				return `<path d="M ${400 - r} 200 A ${r} ${r} 0 0 1 400 ${200 - r}" stroke="${color}" stroke-width="1.5" opacity="${0.5 - i * 0.06}" />`
			}).join('')}
		</svg>`,

	// 2 — Diagonal lines
	(color: string) => `
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			${[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
				const x = 180 + i * 30
				return `<line x1="${x}" y1="0" x2="${x - 100}" y2="200" stroke="${color}" stroke-width="1.2" opacity="${0.4 - i * 0.04}" />`
			}).join('')}
		</svg>`,

	// 3 — Concentric circles
	(color: string) => `
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			${[1, 2, 3, 4, 5].map(i => {
				const r = i * 35
				return `<circle cx="340" cy="100" r="${r}" stroke="${color}" stroke-width="1.2" opacity="${0.45 - i * 0.07}" />`
			}).join('')}
		</svg>`,

	// 4 — Wave lines
	(color: string) => `
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			${[0, 1, 2, 3, 4, 5].map(i => {
				const y = 30 + i * 30
				return `<path d="M 160 ${y} Q 230 ${y - 20} 280 ${y} Q 330 ${y + 20} 400 ${y}" stroke="${color}" stroke-width="1.3" opacity="${0.45 - i * 0.06}" fill="none" />`
			}).join('')}
		</svg>`,

	// 5 — Dot grid
	(color: string) => `
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			${Array.from({ length: 6 }, (_, row) =>
				Array.from({ length: 6 }, (_, col) => {
					const x = 200 + col * 35
					const y = 20 + row * 32
					const opacity = 0.5 - (row + col) * 0.03
					return `<circle cx="${x}" cy="${y}" r="2.5" fill="${color}" opacity="${opacity}" />`
				}).join('')
			).join('')}
		</svg>`,

	// 6 — Stacked chevrons
	(color: string) => `
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			${[0, 1, 2, 3, 4].map(i => {
				const y = 30 + i * 35
				return `<polyline points="240,${y + 20} 320,${y} 400,${y + 20}" stroke="${color}" stroke-width="1.5" fill="none" opacity="${0.5 - i * 0.08}" />`
			}).join('')}
		</svg>`,

	// 7 — Radiating lines from corner
	(color: string) => `
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
				const angle = (i * 10) * (Math.PI / 180)
				const endX = 400 - Math.cos(angle) * 250
				const endY = Math.sin(angle) * 250
				return `<line x1="400" y1="0" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="1" opacity="${0.4 - i * 0.035}" />`
			}).join('')}
		</svg>`,

	// 8 — Horizontal stripes
	(color: string) => `
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			${[0, 1, 2, 3, 4, 5, 6].map(i => {
				const y = 20 + i * 25
				const width = 200 - i * 20
				return `<line x1="${400 - width}" y1="${y}" x2="400" y2="${y}" stroke="${color}" stroke-width="2" opacity="${0.4 - i * 0.04}" stroke-linecap="round" />`
			}).join('')}
		</svg>`,
]

// Stable hash from note ID to pick a pattern index
function hashId(id: string): number {
	let h = 0
	for (let i = 0; i < id.length; i++) {
		h = id.charCodeAt(i) + ((h << 5) - h)
	}
	return Math.abs(h)
}

interface NoteBannerProps {
	noteId: string
	title: string
	onTitleChange: (title: string) => void
	onTitleKeyDown: (e: React.KeyboardEvent) => void
}

export default function NoteBanner({ noteId, title, onTitleChange, onTitleKeyDown }: NoteBannerProps) {
	const patternSvg = useMemo(() => {
		const hash = hashId(noteId)
		const patternIdx = hash % PATTERNS.length
		return PATTERNS[patternIdx]!('rgba(255,255,255,0.55)')
	}, [noteId])

	const svgDataUri = useMemo(
		() => `url("data:image/svg+xml,${encodeURIComponent(patternSvg.trim())}")`,
		[patternSvg]
	)

	return (
		<div
			className="relative w-full overflow-hidden mb-6"
			style={{
				backgroundColor: 'var(--accent)',
				minHeight: 160,
			}}
		>
			{/* SVG pattern — positioned right */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage: svgDataUri,
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'right center',
					backgroundSize: '55% auto',
				}}
			/>

			{/* Title overlay */}
			<div className="relative z-10 flex items-end h-full min-h-[160px] p-6 md:p-8">
				<input
					type="text"
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
					onKeyDown={onTitleKeyDown}
					className="w-full max-w-[60%] bg-transparent text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white placeholder:text-white/50 focus:outline-none"
					style={{ fontFamily: '"Outfit", sans-serif', textWrap: 'balance' }}
					placeholder="Untitled"
				/>
			</div>
		</div>
	)
}
