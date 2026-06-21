'use client'

import type { GameMode, GameResult } from '@/components/breach/MazeGame'
import { ThiefSVG, CopSVG } from '@/components/breach/Sprite'
import { NodeProgressBar } from '@/components/breach/NodeProgressBar'
import { useTheme, hexToRgba } from '@/components/breach/ThemeContext'
import type { ZoneId } from '@/lib/maze-data'

// ============================================================
// Shared footer
// ============================================================

function SignatureFooter() {
  const { palette: theme } = useTheme()
  return (
    <footer
      style={{
        borderTop: `1px solid ${theme.borderFaint}`,
        padding: '20px 24px',
        marginTop: 'auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="breach-label">SYSTEM_OPERATOR:</span>
          <span style={{ fontSize: '0.65rem', color: theme.teal }}>@Abhishek Harne</span>
        </div>
        <div style={{ fontSize: '0.6rem', color: theme.mutedFaint, letterSpacing: '0.06em' }}>
          MADE WITH LOVE AND CURIOSITY
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
          {[
            { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/abhishek-harne/' },
            { label: 'GITHUB', href: 'https://github.com/Abhishek-Harne' },
            { label: 'PORTFOLIO', href: 'https://abhishekharne.vercel.app/' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.6rem',
                color: theme.muted,
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderBottom: `1px solid ${theme.borderMed}`,
                paddingBottom: '1px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.teal)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.muted)}
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
  const { palette: theme } = useTheme()
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.bg,
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
            color: theme.text,
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
            color: theme.teal,
            letterSpacing: '0.15em',
            marginBottom: '24px',
          }}
        >
          — THE CHASE IS REAL-TIME NOW
        </h2>

        <div className="breach-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <div className="breach-label" style={{ marginBottom: '10px' }}>
            WHY_THIS_EXISTS:
          </div>
          <p style={{ fontSize: '0.78rem', color: theme.text, lineHeight: 1.65 }}>
            Most data breaches don&apos;t happen because of some genius hacker
            move. They happen because of one small, common mistake — a leaked
            key, a permission that&apos;s too broad, a system nobody&apos;s
            watching closely enough. This is a playable walk-through of how
            that actually happens, and how it gets stopped.
          </p>
        </div>

        <div className="breach-card" style={{ padding: '20px', marginBottom: '32px' }}>
          <div className="breach-label" style={{ marginBottom: '10px' }}>
            PICK_A_SIDE:
          </div>
          <p style={{ fontSize: '0.74rem', color: hexToRgba(theme.text, 0.85), lineHeight: 1.6, marginBottom: '8px' }}>
            <span style={{ color: theme.orange, fontWeight: 700 }}>Thief — </span>
            see how far one small mistake can take someone, from a single
            leaked key to a full breach.
          </p>
          <p style={{ fontSize: '0.74rem', color: hexToRgba(theme.text, 0.85), lineHeight: 1.6 }}>
            <span style={{ color: theme.teal, fontWeight: 700 }}>Cop — </span>
            see how close attacks usually come before they&apos;re caught, and
            what it actually takes to stop one in time.
          </p>
        </div>

        <button
          onClick={onStart}
          style={{
            border: `1px solid ${theme.teal}`,
            borderRadius: '2px',
            padding: '14px 28px',
            background: 'transparent',
            color: theme.teal,
            fontSize: '0.7rem',
            letterSpacing: '0.14em',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
            width: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = hexToRgba(theme.teal, 0.08))}
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
  const { palette: theme } = useTheme()
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.bg,
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
              border: `1px solid ${hexToRgba(theme.orange, 0.4)}`,
              borderRadius: '2px',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.orange
              e.currentTarget.style.background = hexToRgba(theme.orange, 0.05)
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = hexToRgba(theme.orange, 0.4)
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <ThiefSVG size={48} />
              <div style={{ fontSize: '0.65rem', color: theme.orange, letterSpacing: '0.1em', fontWeight: 700 }}>
                PLAY AS THE THIEF
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', color: hexToRgba(theme.text, 0.7), lineHeight: 1.55 }}>
              See how the breach happens — work your way through all six
              stages while the cop closes in. Grab the zero-day for a window
              to breathe.
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
              border: `1px solid ${hexToRgba(theme.teal, 0.4)}`,
              borderRadius: '2px',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.teal
              e.currentTarget.style.background = hexToRgba(theme.teal, 0.05)
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = hexToRgba(theme.teal, 0.4)
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <CopSVG size={48} />
              <div style={{ fontSize: '0.65rem', color: theme.teal, letterSpacing: '0.1em', fontWeight: 700 }}>
                PLAY AS THE COP
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', color: hexToRgba(theme.text, 0.7), lineHeight: 1.55 }}>
              See how close it gets before it&apos;s caught — hunt down the
              thief before they finish the job. Watch out — if they find the
              zero-day, you&apos;ll slow down.
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
  const { palette: theme } = useTheme()
  const won = result.outcome === 'won'
  const accent = won ? theme.teal : theme.orange
  const zonesCompleted = new Set<ZoneId>(result.zonesCompleted)

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
        backgroundColor: theme.bg,
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
        <p style={{ fontSize: '0.75rem', color: hexToRgba(theme.text, 0.7), lineHeight: 1.6, marginBottom: '20px' }}>
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

        <NodeProgressBar zonesCompleted={zonesCompleted} accent={accent} maxWidth={480} />

        <div style={{ marginTop: '10px' }} />

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
            border: `1px solid ${theme.borderMed}`,
            borderRadius: '2px',
            padding: '14px 24px',
            background: 'transparent',
            color: hexToRgba(theme.text, 0.7),
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
            border: `1px solid ${theme.borderFaint}`,
            borderRadius: '2px',
            padding: '12px 24px',
            background: 'transparent',
            color: theme.muted,
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
