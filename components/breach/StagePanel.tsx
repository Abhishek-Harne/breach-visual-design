'use client'

import { useState, useEffect } from 'react'
import {
  type GameMode,
  type NodeId,
  type ResultPhase,
  type ThiefOption,
  type CopOption,
  getStage,
  getRiskyOptionId,
} from '@/lib/game-data'
import { OptionTimer } from './OptionTimer'

interface StagePanelProps {
  activeNodeId: NodeId
  mode: GameMode
  resultPhase: ResultPhase
  selectedOptionId: string | null
  resolvedNarrative: string | null
  resolvedDefenseLine: string | null
  resolvedWasCaught: boolean
  resolvedTimedOut: boolean
  budgetRemaining: number
  panelNonce: number
  onSelectOption: (optionId: string, timedOut?: boolean) => void
  onContinue: () => void
}

function RiskDot({ risk }: { risk: 'none' | 'low' | 'medium' | 'high' }) {
  const colors: Record<string, string> = {
    none: '#00ffcc',
    low: '#4ade80',
    medium: '#f59e0b',
    high: '#ff6b4a',
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: colors[risk] ?? '#888',
        flexShrink: 0,
      }}
      aria-label={`Risk: ${risk}`}
    />
  )
}

function ProcessingSpinner() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#f59e0b',
        fontSize: '0.7rem',
        letterSpacing: '0.08em',
      }}
    >
      <span style={{ animation: 'blink-cursor 0.4s step-end infinite' }}>▮</span>
      PROCESSING...
    </span>
  )
}

export function StagePanel({
  activeNodeId,
  mode,
  resultPhase,
  selectedOptionId,
  resolvedNarrative,
  resolvedDefenseLine,
  resolvedWasCaught,
  resolvedTimedOut,
  budgetRemaining,
  panelNonce,
  onSelectOption,
  onContinue,
}: StagePanelProps) {
  const stage = getStage(activeNodeId)
  const [panelKey, setPanelKey] = useState(0)

  // re-trigger fade when transitioning to revealed
  useEffect(() => {
    if (resultPhase === 'revealed') setPanelKey((k) => k + 1)
  }, [resultPhase])

  const isChoosing = resultPhase === 'choosing'
  const isResolving = resultPhase === 'resolving'
  const isRevealed = resultPhase === 'revealed'

  const accentColor = mode === 'thief' ? '#ff6b4a' : '#00ffcc'

  const handleTimeout = () => {
    onSelectOption(getRiskyOptionId(mode, stage), true)
  }

  return (
    <div
      className="breach-card panel-fade-in"
      style={{ margin: '16px', padding: '20px', position: 'relative' }}
    >
      {/* Stage header label */}
      <div className="breach-label" style={{ marginBottom: '12px' }}>
        {stage.label}_STAGE_{stage.order + 1}_OF_6:
      </div>

      {/* Choosing / Resolving phase */}
      {(isChoosing || isResolving) && (
        <div>
          <p
            style={{
              fontSize: '0.8rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
              marginBottom: '18px',
            }}
          >
            {mode === 'thief' ? stage.thief.setup : stage.cop.setup}
            {isResolving && (
              <>
                {' '}
                <ProcessingSpinner />
              </>
            )}
          </p>

          <OptionTimer
            active={isChoosing}
            resetKey={`${activeNodeId}-${panelNonce}`}
            onExpire={handleTimeout}
          />

          {/* Options */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
            }}
          >
            {mode === 'thief'
              ? stage.thief.options.map((opt: ThiefOption) => (
                  <button
                    key={opt.id}
                    disabled={isResolving}
                    onClick={() => onSelectOption(opt.id)}
                    style={{
                      border: `1px solid ${selectedOptionId === opt.id ? accentColor : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '2px',
                      padding: '12px 14px',
                      background:
                        selectedOptionId === opt.id
                          ? 'rgba(255,107,74,0.08)'
                          : 'transparent',
                      cursor: isResolving ? 'not-allowed' : 'pointer',
                      opacity: isResolving && selectedOptionId !== opt.id ? 0.4 : 1,
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <RiskDot risk={opt.risk} />
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: '#e2e8f0',
                          letterSpacing: '0.06em',
                          fontWeight: 700,
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.55rem',
                        color: 'rgba(226,232,240,0.4)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      RISK: {opt.risk.toUpperCase()} &nbsp;·&nbsp; DETECTION +{opt.detectionDelta}%
                    </div>
                  </button>
                ))
              : stage.cop.options.map((opt: CopOption) => {
                  const canAfford = budgetRemaining >= opt.cost
                  return (
                    <button
                      key={opt.id}
                      disabled={isResolving || !canAfford}
                      onClick={() => canAfford && onSelectOption(opt.id)}
                      title={!canAfford ? 'INSUFFICIENT_BUDGET' : undefined}
                      style={{
                        border: `1px solid ${!canAfford ? 'rgba(255,255,255,0.1)' : selectedOptionId === opt.id ? accentColor : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: '2px',
                        padding: '12px 14px',
                        background:
                          selectedOptionId === opt.id
                            ? 'rgba(0,255,204,0.06)'
                            : 'transparent',
                        cursor: isResolving || !canAfford ? 'not-allowed' : 'pointer',
                        opacity: !canAfford ? 0.35 : isResolving && selectedOptionId !== opt.id ? 0.4 : 1,
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', color: '#e2e8f0', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '4px' }}>
                        {opt.label}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.55rem',
                          color: 'rgba(226,232,240,0.4)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <span>COST: {opt.cost}</span>
                        <span>
                          EFFECTIVENESS: {Math.round(opt.effectiveness * 100)}%
                        </span>
                      </div>
                      {!canAfford && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '0.5rem',
                            color: '#ff6b4a',
                            letterSpacing: '0.06em',
                          }}
                        >
                          INSUFFICIENT_BUDGET
                        </div>
                      )}
                    </button>
                  )
                })}
          </div>
        </div>
      )}

      {/* Revealed phase */}
      {isRevealed && (
        <div key={panelKey} className="panel-fade-in">
          <div className="breach-label" style={{ marginBottom: '10px' }}>
            WHAT_JUST_HAPPENED:
          </div>

          {resolvedTimedOut && (
            <p
              style={{
                fontSize: '0.72rem',
                color: '#ff6b4a',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              {mode === 'thief'
                ? 'TOO SLOW — the cop is gaining on you.'
                : 'TOO SLOW — the thief just slipped further away.'}
            </p>
          )}

          <p
            style={{
              fontSize: '0.8rem',
              color: resolvedWasCaught ? '#f59e0b' : '#e2e8f0',
              lineHeight: 1.6,
              marginBottom: resolvedDefenseLine ? '18px' : '20px',
            }}
          >
            {resolvedNarrative}
          </p>

          {resolvedDefenseLine && mode === 'thief' && (
            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '14px',
                marginBottom: '20px',
              }}
            >
              <div className="breach-label" style={{ marginBottom: '8px' }}>
                THIS_COULD_HAVE_BEEN_STOPPED_BY:
              </div>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#00ffcc',
                  lineHeight: 1.6,
                }}
              >
                {resolvedDefenseLine}
              </p>
            </div>
          )}

          <button
            onClick={onContinue}
            style={{
              border: `1px solid ${accentColor}`,
              borderRadius: '2px',
              padding: '10px 24px',
              background: 'transparent',
              color: accentColor,
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                mode === 'thief' ? 'rgba(255,107,74,0.1)' : 'rgba(0,255,204,0.1)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            CONTINUE →
          </button>
        </div>
      )}
    </div>
  )
}
