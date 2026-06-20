'use client'

import {
  type GameState,
  type NodeId,
  NODE_IDS,
  STAGES,
  countBreached,
  countDefended,
  detectionCommentary,
} from '@/lib/game-data'

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
// Mini status bar for recap screens
// ============================================================

function MiniStatusBar({ nodeStatus, mode }: { nodeStatus: GameState['nodeStatus']; mode: 'thief' | 'cop' }) {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
      {NODE_IDS.map((id) => {
        const status = nodeStatus[id]
        const stage = STAGES.find((s) => s.id === id)!
        const color =
          status === 'breached'
            ? '#ff6b4a'
            : status === 'defended'
              ? '#00ffcc'
              : 'rgba(255,255,255,0.2)'
        return (
          <div
            key={id}
            style={{
              border: `1px solid ${color}`,
              borderRadius: '2px',
              padding: '4px 8px',
              fontSize: '0.5rem',
              letterSpacing: '0.06em',
              color,
            }}
          >
            {stage.label}
          </div>
        )
      })}
    </div>
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
        {/* Header tag */}
        <div className="breach-label" style={{ marginBottom: '12px' }}>
          SECURITY_SIMULATION_v2.4.1:
        </div>

        {/* Title */}
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
          — FOLLOW THE ATTACK
        </h2>

        {/* Description card */}
        <div
          className="breach-card"
          style={{ padding: '20px', marginBottom: '32px' }}
        >
          <div className="breach-label" style={{ marginBottom: '10px' }}>
            WHAT_YOU_WILL_LEARN:
          </div>
          <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.65 }}>
            A real API key was left in a public repo. Follow the attacker through
            all 6 stages of the breach — then switch sides and try to stop it.
            Every decision changes what gets logged, what gets caught, and what
            gets away.
          </p>
        </div>

        {/* Stage path preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '32px' }}>
          {STAGES.map((stage, i) => (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : 0 }}>
              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '2px',
                  padding: '5px 6px 3px',
                  fontSize: '0.45rem',
                  letterSpacing: '0.05em',
                  color: 'rgba(226,232,240,0.5)',
                  textAlign: 'center',
                  minWidth: '40px',
                }}
              >
                {stage.label}
              </div>
              {i < 5 && (
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    minWidth: '4px',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
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
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(0,255,204,0.08)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'transparent')
          }
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
  thiefCompleted: boolean
  onSelectThief: () => void
  onSelectCop: () => void
}

export function ModeChoiceScreen({
  thiefCompleted,
  onSelectThief,
  onSelectCop,
}: ModeChoiceScreenProps) {
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
          {/* Thief card */}
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
            <div
              style={{
                fontSize: '0.65rem',
                color: '#ff6b4a',
                letterSpacing: '0.1em',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              PLAY AS THE THIEF
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.7)', lineHeight: 1.55 }}>
              Follow the attack step by step. Choose how aggressive or quiet you
              want to be. See exactly how the breach unfolds.
            </p>
            <div
              style={{
                marginTop: '12px',
                fontSize: '0.55rem',
                color: 'rgba(255,107,74,0.6)',
                letterSpacing: '0.06em',
              }}
            >
              STAGE_1_OF_2 · AVAILABLE
            </div>
          </button>

          {/* Cop card */}
          <button
            onClick={thiefCompleted ? onSelectCop : undefined}
            disabled={!thiefCompleted}
            className="breach-card"
            style={{
              padding: '22px',
              textAlign: 'left',
              cursor: thiefCompleted ? 'pointer' : 'not-allowed',
              background: 'transparent',
              border: `1px solid ${thiefCompleted ? 'rgba(0,255,204,0.4)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '2px',
              opacity: thiefCompleted ? 1 : 0.4,
              fontFamily: 'inherit',
              position: 'relative',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!thiefCompleted) return
              e.currentTarget.style.borderColor = '#00ffcc'
              e.currentTarget.style.background = 'rgba(0,255,204,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = thiefCompleted
                ? 'rgba(0,255,204,0.4)'
                : 'rgba(255,255,255,0.12)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {/* Lock icon if locked */}
            {!thiefCompleted && (
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                ⊘
              </span>
            )}

            {/* NEW badge if unlocked */}
            {thiefCompleted && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '12px',
                  backgroundColor: '#00ffcc',
                  color: '#0a0a0f',
                  fontSize: '0.45rem',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '1px',
                }}
              >
                NEW
              </span>
            )}

            <div
              style={{
                fontSize: '0.65rem',
                color: thiefCompleted ? '#00ffcc' : 'rgba(226,232,240,0.4)',
                letterSpacing: '0.1em',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              PLAY AS THE COP
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.7)', lineHeight: 1.55 }}>
              Now that you know exactly how the attack was pulled off, try to stop
              it. Allocate a security budget across all 6 stages.
            </p>
            <div
              style={{
                marginTop: '12px',
                fontSize: '0.55rem',
                color: thiefCompleted ? 'rgba(0,255,204,0.6)' : 'rgba(255,255,255,0.2)',
                letterSpacing: '0.06em',
              }}
            >
              {thiefCompleted ? 'STAGE_2_OF_2 · UNLOCKED' : 'STAGE_2_OF_2 · COMPLETE_THIEF_ROUND_FIRST'}
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// Round Complete Screen
// ============================================================

interface RoundCompleteScreenProps {
  gameState: GameState
  onPlayAsCop: () => void
  onPlayAgain: () => void
}

export function RoundCompleteScreen({
  gameState,
  onPlayAsCop,
  onPlayAgain,
}: RoundCompleteScreenProps) {
  const {
    mode,
    nodeStatus,
    detectionLevel,
    securityBudget,
    budgetSpent,
    chosenEffectiveness,
  } = gameState

  const breachedCount = countBreached(nodeStatus)
  const defendedCount = countDefended(nodeStatus)
  const accentColor = mode === 'thief' ? '#ff6b4a' : '#00ffcc'

  const avgEffectiveness =
    chosenEffectiveness.length > 0
      ? Math.round(
          (chosenEffectiveness.reduce((a, b) => a + b, 0) / chosenEffectiveness.length) * 100
        )
      : 0

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
          padding: '40px 24px',
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Headline */}
        <div className="breach-label" style={{ marginBottom: '10px' }}>
          {mode === 'thief' ? 'ROUND_COMPLETE:' : 'MISSION_COMPLETE:'}
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
            fontWeight: 700,
            color: accentColor,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            marginBottom: '24px',
          }}
        >
          {mode === 'thief'
            ? `6/6 SYSTEMS BREACHED`
            : `6/6 ATTACKS STOPPED`}
        </h2>

        {/* Mini status bar */}
        <div className="breach-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div className="breach-label" style={{ marginBottom: '10px' }}>
            FINAL_STATUS:
          </div>
          <MiniStatusBar nodeStatus={nodeStatus} mode={mode as 'thief' | 'cop'} />
        </div>

        {/* Stats */}
        <div className="breach-card" style={{ padding: '16px', marginBottom: '20px' }}>
          {mode === 'thief' && (
            <>
              <div className="breach-label" style={{ marginBottom: '8px' }}>
                DETECTION_RISK_FINAL:
              </div>
              {/* Meter */}
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    height: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '1px',
                    overflow: 'hidden',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(detectionLevel, 100)}%`,
                      background:
                        detectionLevel < 30
                          ? '#00ffcc'
                          : detectionLevel < 60
                            ? '#f59e0b'
                            : '#ff6b4a',
                      transition: 'width 0.8s ease',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.6rem',
                  }}
                >
                  <span style={{ color: 'rgba(226,232,240,0.5)' }}>0%</span>
                  <span
                    style={{
                      color:
                        detectionLevel < 30
                          ? '#00ffcc'
                          : detectionLevel < 60
                            ? '#f59e0b'
                            : '#ff6b4a',
                      fontWeight: 700,
                    }}
                  >
                    {Math.round(detectionLevel)}%
                  </span>
                  <span style={{ color: 'rgba(226,232,240,0.5)' }}>100%</span>
                </div>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#e2e8f0', lineHeight: 1.55, fontStyle: 'italic' }}>
                &ldquo;{detectionCommentary(detectionLevel)}&rdquo;
              </p>
            </>
          )}

          {mode === 'cop' && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <span className="breach-label">BUDGET_SPENT:</span>
                <span style={{ fontSize: '0.65rem', color: '#00ffcc', fontWeight: 700 }}>
                  {budgetSpent}/{10}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="breach-label">AVERAGE_DEFENSE_STRENGTH:</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color:
                      avgEffectiveness >= 80
                        ? '#00ffcc'
                        : avgEffectiveness >= 60
                          ? '#f59e0b'
                          : '#ff6b4a',
                  }}
                >
                  {avgEffectiveness}%
                </span>
              </div>
              {avgEffectiveness < 70 && (
                <p
                  style={{
                    marginTop: '10px',
                    fontSize: '0.7rem',
                    color: 'rgba(226,232,240,0.6)',
                    lineHeight: 1.55,
                  }}
                >
                  You stayed within budget — but some of those defenses won&apos;t
                  hold for long. Stronger controls cost more for a reason.
                </p>
              )}
              {avgEffectiveness >= 70 && (
                <p
                  style={{
                    marginTop: '10px',
                    fontSize: '0.7rem',
                    color: 'rgba(226,232,240,0.6)',
                    lineHeight: 1.55,
                  }}
                >
                  Solid coverage across the board. Thoughtful allocation beats
                  just throwing money at the loudest alarms.
                </p>
              )}
            </>
          )}
        </div>

        {/* CTA */}
        {mode === 'thief' && (
          <button
            onClick={onPlayAsCop}
            style={{
              border: '1px solid #00ffcc',
              borderRadius: '2px',
              padding: '14px 24px',
              background: 'transparent',
              color: '#00ffcc',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(0,255,204,0.08)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            STOP THIS BREACH — PLAY AS THE COP →
          </button>
        )}

        {mode === 'cop' && (
          <button
            onClick={onPlayAgain}
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
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(226,232,240,0.05)'
              e.currentTarget.style.borderColor = 'rgba(226,232,240,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(226,232,240,0.3)'
            }}
          >
            PLAY AGAIN ↺
          </button>
        )}
      </main>
      <SignatureFooter />
    </div>
  )
}
