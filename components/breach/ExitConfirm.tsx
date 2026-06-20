'use client'

interface ExitConfirmProps {
  onStay: () => void
  onExit: () => void
}

export function ExitConfirm({ onStay, onExit }: ExitConfirmProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        padding: '16px',
        pointerEvents: 'none',
      }}
    >
      <div
        className="breach-card panel-fade-in"
        style={{
          padding: '18px 20px',
          maxWidth: '280px',
          pointerEvents: 'all',
        }}
      >
        <div className="breach-label" style={{ marginBottom: '8px' }}>
          EXIT_SIMULATION:
        </div>
        <p
          style={{
            fontSize: '0.72rem',
            color: 'rgba(226,232,240,0.75)',
            lineHeight: 1.55,
            marginBottom: '16px',
          }}
        >
          Leave simulation? Progress on this round will be lost.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onStay}
            style={{
              flex: 1,
              border: '1px solid rgba(0,255,204,0.5)',
              borderRadius: '2px',
              padding: '8px 0',
              background: 'transparent',
              color: '#00ffcc',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(0,255,204,0.08)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            STAY
          </button>
          <button
            onClick={onExit}
            style={{
              flex: 1,
              border: '1px solid rgba(255,107,74,0.4)',
              borderRadius: '2px',
              padding: '8px 0',
              background: 'transparent',
              color: 'rgba(255,107,74,0.8)',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,107,74,0.08)'
              e.currentTarget.style.color = '#ff6b4a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,107,74,0.8)'
            }}
          >
            EXIT
          </button>
        </div>
      </div>
    </div>
  )
}
