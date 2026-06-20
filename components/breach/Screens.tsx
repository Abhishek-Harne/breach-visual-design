'use client'

import type { GameMode, GameResult } from '@/components/breach/MazeGame'

// ============================================================
// Shared footer
// ============================================================

function SignatureFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '20px 24px',
        marginTop: 'auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="breach-label">SYSTEM_OPERATOR:</span>
          <span style={{ fontSize: '0.65rem', color: '#00ffcc' }}>@Abhishek Harne</span>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'rgba(226,232,240,0.35)', letterSpacing: '0.06em' }}>
          MADE WITH LOVE AND CURIOSITY
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
          {[
            { label: 'LINKEDIN', href: 'https://linkedin.com/in/abhishekharne' },
            { label: 'GITHUB', href: 'https://github.com/abhishekharne' },
            { label: 'PORTFOLIO', href: '#' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.6rem',
                color: 'rgba(226,232,240,0.45)',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(226,232,240,0.2)',
                paddingBottom: '1px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00ffcc')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(226,232,240,0.45)')}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// Welcome Screen
// ============================================================

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0f',
      }}
    >
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 24px',
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="breach-label" style={{ marginBottom: '12px' }}>
          SECURITY_SIMULATION_v3.0.0:
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.8rem, 6vw, 2.8rem)',
            fontWeight: 700,
            color: '#e2e8f0',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '6px',
          }}
        >
          BREACH
        </h1>
        <h2
          style={{
            fontSize: 'clamp(0.75rem, 3vw, 1rem)',
            fontWeight: 400,
            color: '#00ffcc',
            letterSpacing: '0.15em',
            marginBottom: '24px',
          }}
        >
          — THE CHASE IS REAL-TIME NOW
        </h2>

        <div className="breach-card" style={{ padding: '20px', marginBottom: '32px' }}>
          <div className="breach-label" style={{ marginBottom: '10px' }}>
            HOW_TO_PLAY:
          </div>
          <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.65 }}>
            Run the breach yourself — grab coins through six real attack stages
            while a cop hunts you down — or flip sides and play the cop chasing
            an AI-controlled thief through the same maze. Grab the zero-day for
            a brief edge.
          </p>
        </div>

        <button
          onClick={onStart}
          style={{
            border: '1px solid #00ffcc',
            borderRadius: '2px',
            padding: '14px 28px',
            background: 'transparent',
            color: '#00ffcc',
            fontSize: '0.7rem',
            letterSpacing: '0.14em',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
            width: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,255,204,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          START SIMULATION →
        </button>
      </main>
      <SignatureFooter />
    </div>
  )
}

// ============================================================
// Mode Choice Screen
// ============================================================

interface ModeChoiceScreenProps {
  onSelectThief: () => void
  onSelectCop: () => void
}

export function ModeChoiceScreen({ onSelectThief, onSelectCop }: ModeChoiceScreenProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0f',
      }}
    >
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 24px',
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="breach-label" style={{ marginBottom: '24px' }}>
          SELECT_MODE:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            onClick={onSelectThief}
            className="breach-card"
            style={{
              padding: '22px',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid rgba(255,107,74,0.4)',
              borderRadius: '2px',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ff6b4a'
              e.currentTarget.style.background = 'rgba(255,107,74,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,107,74,0.4)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{ fontSize: '0.65rem', color: '#ff6b4a', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }}>
              PLAY AS THE THIEF
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.7)', lineHeight: 1.55 }}>
              Collect every coin through all six breach stages while the cop
              hunts you down with real pathfinding. Grab the zero-day for a
              window to breathe.
            </p>
          </button>

          <button
            onClick={onSelectCop}
            className="breach-card"
            style={{
              padding: '22px',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid rgba(0,255,204,0.4)',
              borderRadius: '2px',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00ffcc'
              e.currentTarget.style.background = 'rgba(0,255,204,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,255,204,0.4)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{ fontSize: '0.65rem', color: '#00ffcc', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }}>
              PLAY AS THE COP
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.7)', lineHeight: 1.55 }}>
              Hunt down an AI-controlled thief before it grabs every coin in
              the maze. Watch out — if it finds the zero-day, you'll slow down.
            </p>
          </button>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// Result Screen (win / lose)
// ============================================================

interface ResultScreenProps {
  mode: GameMode
  result: GameResult
  onPlayAgain: () => void
  onSwitchMode: () => void
  onGoHome: () => void
}

export function ResultScreen({ mode, result, onPlayAgain, onSwitchMode, onGoHome }: ResultScreenProps) {
  const won = result.outcome === 'won'
  const accent = won ? '#00ffcc' : '#ff6b4a'

  const headline =
    mode === 'thief'
      ? won
        ? 'BREACH COMPLETE'
        : 'CAUGHT IN THE ACT'
      : won
        ? 'SUSPECT APPREHENDED'
        : 'BREACH SUCCEEDED'

  const subtext =
    mode === 'thief'
      ? won
        ? 'You collected every coin and got out clean.'
        : 'The cop caught up with you before the job was finished.'
      : won
        ? 'You caught the thief before all the data got out.'
        : 'The thief collected every coin before you could catch it.'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0f',
      }}
    >
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 24px',
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="breach-label" style={{ marginBottom: '10px' }}>
          ROUND_COMPLETE:
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
            fontWeight: 700,
            color: accent,
            lineHeight: 1.2,
            marginBottom: '14px',
          }}
        >
          {headline}
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'rgba(226,232,240,0.7)', lineHeight: 1.6, marginBottom: '20px' }}>
          {subtext}
        </p>

        <div className="breach-card" style={{ padding: '16px', marginBottom: '24px' }}>
          <div className="breach-label" style={{ marginBottom: '6px' }}>
            COINS_COLLECTED:
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: accent }}>
            {result.coinsCollected}/{result.totalCoins}
          </span>
        </div>

        <button
          onClick={onPlayAgain}
          style={{
            border: `1px solid ${accent}`,
            borderRadius: '2px',
            padding: '14px 24px',
            background: 'transparent',
            color: accent,
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: '100%',
            marginBottom: '12px',
          }}
        >
          TRY AGAIN ↺
        </button>

        <button
          onClick={onSwitchMode}
          style={{
            border: '1px solid rgba(226,232,240,0.3)',
            borderRadius: '2px',
            padding: '14px 24px',
            background: 'transparent',
            color: 'rgba(226,232,240,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: '100%',
            marginBottom: '12px',
          }}
        >
          {mode === 'thief' ? 'SWITCH TO COP MODE →' : 'SWITCH TO THIEF MODE →'}
        </button>

        <button
          onClick={onGoHome}
          style={{
            border: '1px solid rgba(226,232,240,0.15)',
            borderRadius: '2px',
            padding: '12px 24px',
            background: 'transparent',
            color: 'rgba(226,232,240,0.45)',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: '100%',
          }}
        >
          ← BACK TO MENU
        </button>
      </main>
      <SignatureFooter />
    </div>
  )
}
