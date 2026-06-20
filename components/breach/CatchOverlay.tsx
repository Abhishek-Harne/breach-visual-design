'use client'

interface CatchOverlayProps {
  nodeLabel: string
  onRetry: () => void
}

export function CatchOverlay({ nodeLabel, onRetry }: CatchOverlayProps) {
  return (
    <div
      className="breach-card"
      style={{ margin: '16px', padding: '36px 20px', textAlign: 'center' }}
    >
      <div
        className="caught-burst"
        style={{
          fontSize: 'clamp(1.6rem, 6vw, 2.2rem)',
          fontWeight: 700,
          color: '#ff6b4a',
          letterSpacing: '0.08em',
          marginBottom: '14px',
        }}
      >
        CAUGHT!
      </div>
      <p
        style={{
          fontSize: '0.78rem',
          color: 'rgba(226,232,240,0.7)',
          lineHeight: 1.6,
          marginBottom: '22px',
        }}
      >
        Busted at {nodeLabel}. Let&apos;s try that one again.
      </p>
      <button
        onClick={onRetry}
        style={{
          border: '1px solid #ff6b4a',
          borderRadius: '2px',
          padding: '12px 28px',
          background: 'transparent',
          color: '#ff6b4a',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,74,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        RETRY STAGE ↺
      </button>
    </div>
  )
}
