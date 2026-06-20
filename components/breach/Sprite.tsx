'use client'

export function ThiefSVG({ opacity = 1, size = 24 }: { opacity?: number; size?: number }) {
  const scale = size / 28
  return (
    <svg
      width={20 * scale}
      height={28 * scale}
      viewBox="0 0 20 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {/* body */}
      <rect x="4" y="12" width="12" height="12" rx="1" fill="#1a1a2e" />
      {/* head */}
      <rect x="6" y="4" width="8" height="8" rx="1" fill="#1e1e32" />
      {/* eye mask */}
      <rect x="5" y="8" width="10" height="3" rx="0.5" fill="#0a0a0f" />
      {/* eye gleam */}
      <rect x="7" y="8.5" width="2" height="1.5" rx="0.5" fill="#ff6b4a" opacity="0.8" />
      <rect x="11" y="8.5" width="2" height="1.5" rx="0.5" fill="#ff6b4a" opacity="0.8" />
    </svg>
  )
}

export function CopSVG({
  opacity = 1,
  size = 24,
  debuffed = false,
}: {
  opacity?: number
  size?: number
  debuffed?: boolean
}) {
  const scale = size / 28
  const accent = debuffed ? 'rgba(226,232,240,0.35)' : '#00ffcc'
  return (
    <svg
      width={20 * scale}
      height={28 * scale}
      viewBox="0 0 20 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {/* body */}
      <rect x="4" y="12" width="12" height="12" rx="1" fill={debuffed ? '#1c1c24' : '#0f2a2a'} />
      {/* badge on chest */}
      <rect x="8" y="14" width="4" height="4" rx="0.5" fill={accent} opacity="0.9" />
      <rect x="9.5" y="15.5" width="1" height="1" fill="#0a0a0f" />
      {/* head */}
      <rect x="6" y="4" width="8" height="8" rx="1" fill={debuffed ? '#1c1c24' : '#0f2a2a'} />
      {/* cap */}
      <rect x="5" y="4" width="10" height="2.5" rx="0.5" fill={accent} opacity="0.7" />
      {/* eyes */}
      <rect x="7" y="8" width="2" height="1.5" rx="0.5" fill={accent} opacity="0.9" />
      <rect x="11" y="8" width="2" height="1.5" rx="0.5" fill={accent} opacity="0.9" />
    </svg>
  )
}
