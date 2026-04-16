// Fox mascot — "Fern" — for empty states.
// Uses var(--accent) for the body so it shifts with the user's accent color.
// Fixed warm cream (#f5e6d0) for lighter parts; dark brown for face features.

export function EmptyStateFox({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 152"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ── Ground shadow ── */}
      <ellipse cx="70" cy="144" rx="30" ry="6" fill="var(--accent)" opacity="0.10" />

      {/* ── Tail (behind body) ── */}
      <path
        d="M 44,112 Q 10,96 12,126 Q 16,148 44,134"
        fill="var(--accent)"
        stroke="none"
      />
      {/* Tail tip */}
      <ellipse cx="14" cy="128" rx="11" ry="8" fill="#f5e6d0" />

      {/* ── Body ── */}
      <ellipse cx="72" cy="116" rx="30" ry="24" fill="var(--accent)" />

      {/* ── Belly ── */}
      <ellipse cx="72" cy="120" rx="18" ry="17" fill="#f5e6d0" />

      {/* ── Note page (fox is holding) ── */}
      <g transform="rotate(-6, 97, 108)">
        <rect
          x="88"
          y="94"
          width="22"
          height="28"
          rx="3"
          fill="var(--bg-elevated)"
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
        <line x1="92" y1="101" x2="106" y2="101" stroke="var(--border-default)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="92" y1="106" x2="106" y2="106" stroke="var(--border-default)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="92" y1="111" x2="100" y2="111" stroke="var(--border-default)" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* ── Left ear (behind head) ── */}
      <polygon points="42,62 28,30 60,52" fill="var(--accent)" />
      {/* Left ear inner */}
      <polygon points="44,59 35,38 56,52" fill="#f5e6d0" />

      {/* ── Right ear (behind head) ── */}
      <polygon points="98,62 112,30 80,52" fill="var(--accent)" />
      {/* Right ear inner */}
      <polygon points="96,59 105,38 84,52" fill="#f5e6d0" />

      {/* ── Head ── */}
      <rect x="40" y="46" width="60" height="54" rx="28" fill="var(--accent)" />

      {/* ── Muzzle ── */}
      <ellipse cx="70" cy="84" rx="14" ry="10" fill="#f5e6d0" />

      {/* ── Eyes ── */}
      <circle cx="58" cy="68" r="4" fill="#3a2820" />
      <circle cx="82" cy="68" r="4" fill="#3a2820" />
      {/* Eye shines */}
      <circle cx="60" cy="66" r="1.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="84" cy="66" r="1.5" fill="rgba(255,255,255,0.8)" />

      {/* ── Nose ── */}
      <ellipse cx="70" cy="78" rx="4" ry="2.5" fill="#3a2820" />

      {/* ── Mouth ── */}
      <path
        d="M 64,83 Q 70,87 76,83"
        stroke="#3a2820"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}
