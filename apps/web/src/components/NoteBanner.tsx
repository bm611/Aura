import { useMemo } from 'react'

const W = 800
const H = 280
const HEAD = `<svg viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">`
const TAIL = `</svg>`

const PATTERNS = [
	// 1 — Topographic Waves
	(c: string) => {
		const lines = Array.from({ length: 9 }, (_, i) => {
			const y1 = 40 + i * 20;
			const y2 = 180 + i * 15;
			const c1y = -20 + i * 30;
			const c2y = 300 + i * 10;
			const opacity = 0.08 + (i / 8) * 0.15;
			return `<path d="M -100 ${y1} C 200 ${c1y}, 500 ${c2y}, 900 ${y2}" stroke="${c}" stroke-width="1.5" opacity="${opacity}" fill="none" />`;
		}).join('')
		return `${HEAD}${lines}${TAIL}`
	},

	// 2 — Diagonal/Isometric Mesh
	(c: string) => {
		const lines = [];
		const step = 40;
		for (let i = -W; i < W * 2; i += step) {
			const isMajor = i % 120 === 0;
			const opacity = isMajor ? 0.15 : 0.05;
			const stroke = isMajor ? 1.5 : 1;
			lines.push(`<line x1="${i}" y1="0" x2="${i + H}" y2="${H}" stroke="${c}" stroke-width="${stroke}" opacity="${opacity}" />`);
			lines.push(`<line x1="${i}" y1="${H}" x2="${i + H}" y2="0" stroke="${c}" stroke-width="${stroke}" opacity="${opacity}" />`);
		}
		return `${HEAD}${lines.join('')}${TAIL}`;
	},

	// 3 — Concentric Radar Rings
	(c: string) => {
		const circles = [
			{ cx: 700, cy: 50, count: 8, spacing: 30, baseOp: 0.25 },
			{ cx: 100, cy: 250, count: 6, spacing: 40, baseOp: 0.2 },
			{ cx: 400, cy: -50, count: 5, spacing: 50, baseOp: 0.15 },
		].map(({ cx, cy, count, spacing, baseOp }) =>
			Array.from({ length: count }, (_, i) => {
				const r = (i + 1) * spacing
				const op = Math.max(0, baseOp - i * 0.03)
				return `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${c}" stroke-width="1" opacity="${op}" fill="none" />`
			}).join('')
		).join('')
		return `${HEAD}${circles}${TAIL}`
	},

	// 4 — Architectural Blueprint
	(c: string) => {
		const grid = [];
		for (let x = 0; x <= W; x += 40) {
			const isMajor = x % 160 === 0;
			grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${c}" stroke-width="${isMajor ? 1.5 : 0.5}" opacity="${isMajor ? 0.25 : 0.1}" />`);
		}
		for (let y = 0; y <= H; y += 40) {
			const isMajor = y % 160 === 0;
			grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${c}" stroke-width="${isMajor ? 1.5 : 0.5}" opacity="${isMajor ? 0.25 : 0.1}" />`);
		}
		grid.push(`<circle cx="160" cy="160" r="4" fill="${c}" opacity="0.5" />`);
		grid.push(`<circle cx="480" cy="80" r="4" fill="${c}" opacity="0.5" />`);
		grid.push(`<circle cx="640" cy="240" r="4" fill="${c}" opacity="0.5" />`);
		grid.push(`<circle cx="320" cy="120" r="3" fill="${c}" opacity="0.3" fill="none" stroke="${c}" stroke-width="2" />`);
		return `${HEAD}${grid.join('')}${TAIL}`;
	},

	// 5 — Halftone Wave
	(c: string) => {
		const dots = [];
		for (let x = 20; x < W; x += 25) {
			for (let y = 20; y < H; y += 25) {
				const wave = Math.sin(x * 0.015 + y * 0.01) + Math.sin(x * 0.005 - y * 0.02);
				const r = 1.5 + wave * 1.5;
				const op = 0.1 + wave * 0.1;
				if (r > 0.3) {
					dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${op}" />`);
				}
			}
		}
		return `${HEAD}${dots.join('')}${TAIL}`;
	},

	// 6 — Circuit Routing
	(c: string) => {
		const lines = `
			<path d="M-20,40 L100,40 L140,80 L350,80" stroke="${c}" stroke-width="1.5" opacity="0.25" fill="none" />
			<circle cx="350" cy="80" r="3.5" fill="${c}" opacity="0.6" />
			<circle cx="350" cy="80" r="7" stroke="${c}" stroke-width="1" opacity="0.3" fill="none" />
			
			<path d="M-20,200 L160,200 L200,160 L450,160 L490,200 L820,200" stroke="${c}" stroke-width="1.5" opacity="0.15" fill="none" />
			<circle cx="160" cy="200" r="2.5" fill="${c}" opacity="0.4" />
			
			<path d="M220,-20 L220,60 L270,110 L270,300" stroke="${c}" stroke-width="1.5" opacity="0.2" fill="none" />
			<circle cx="220" cy="60" r="3.5" fill="${c}" opacity="0.5" />

			<path d="M620,-20 L620,100 L570,150 L570,300" stroke="${c}" stroke-width="1.5" opacity="0.25" fill="none" />
			<circle cx="620" cy="100" r="3.5" fill="${c}" opacity="0.6" />
			<circle cx="620" cy="100" r="7" stroke="${c}" stroke-width="1" opacity="0.3" fill="none" />

			<path d="M520,300 L520,230 L570,180 L820,180" stroke="${c}" stroke-width="1.5" opacity="0.2" fill="none" />
			<circle cx="520" cy="230" r="3.5" fill="${c}" opacity="0.5" />
			
			<path d="M400,300 L400,240 L360,200 L150,200" stroke="${c}" stroke-width="1.5" opacity="0.15" fill="none" />
			<circle cx="400" cy="240" r="2.5" fill="${c}" opacity="0.4" />
		`;
		return `${HEAD}${lines}${TAIL}`;
	},

	// 7 — Geometric Shards
	(c: string) => {
		const shards = [
			'M0,280 L200,0 L350,0 L150,280 Z',
			'M180,280 L400,0 L420,0 L200,280 Z',
			'M350,280 L500,0 L600,0 L450,280 Z',
			'M500,280 L700,0 L720,0 L520,280 Z',
			'M650,280 L800,0 L850,0 L700,280 Z',
			'M0,150 L800,50 L800,80 L0,180 Z',
			'M0,220 L800,280 L800,300 L0,240 Z'
		];
		const opacities = [0.03, 0.06, 0.04, 0.08, 0.05, 0.07, 0.04];
		const elements = shards.map((d, i) => `<path d="${d}" fill="${c}" opacity="${opacities[i]}" />`).join('');
		return `${HEAD}${elements}${TAIL}`;
	},

	// 8 — Crosshair Matrix
	(c: string) => {
		const crosses = [];
		for (let x = 30; x < W; x += 50) {
			for (let y = 30; y < H; y += 50) {
				const op = 0.05 + ((x + y) / (W + H)) * 0.15;
				crosses.push(`<path d="M${x - 4},${y} L${x + 4},${y} M${x},${y - 4} L${x},${y + 4}" stroke="${c}" stroke-width="1.5" opacity="${op}" stroke-linecap="round" />`);
			}
		}
		return `${HEAD}${crosses.join('')}${TAIL}`;
	},
]

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
		return PATTERNS[patternIdx]!('rgba(255,255,255,0.45)')
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
			{/* SVG pattern — spans full banner */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage: svgDataUri,
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center center',
					backgroundSize: '100% 100%',
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
