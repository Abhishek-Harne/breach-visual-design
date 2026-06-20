'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  type GameState,
  type NodeId,
  INITIAL_STATE,
  INITIAL_NODE_STATUS,
  getStage,
  NODE_IDS,
  countBreached,
  countDefended,
} from '@/lib/game-data'
import { StatusBar } from '@/components/breach/StatusBar'
import { StagePanel } from '@/components/breach/StagePanel'
import { ExitConfirm } from '@/components/breach/ExitConfirm'
import {
  WelcomeScreen,
  ModeChoiceScreen,
  RoundCompleteScreen,
} from '@/components/breach/Screens'

export default function Page() {
  const [gs, setGs] = useState<GameState>(INITIAL_STATE)
  const [showCaughtAnimation, setShowCaughtAnimation] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const caughtTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ----------------------------------------------------------------
  // WELCOME → MODE CHOICE
  // ----------------------------------------------------------------
  const handleStart = useCallback(() => {
    setGs((s) => ({ ...s, screen: 'modeChoice' }))
  }, [])

  // ----------------------------------------------------------------
  // START THIEF ROUND
  // ----------------------------------------------------------------
  const handleSelectThief = useCallback(() => {
    setGs((s) => ({
      ...s,
      screen: 'game',
      mode: 'thief',
      nodeStatus: { ...INITIAL_NODE_STATUS },
      detectionLevel: 0,
      activeNodeId: null,
      selectedOptionId: null,
      resultPhase: 'idle',
      spritePosition: 0,
      resolvedNarrative: null,
      resolvedDefenseLine: null,
      resolvedWasCaught: false,
      chosenEffectiveness: [],
    }))
  }, [])

  // ----------------------------------------------------------------
  // START COP ROUND (all nodes start breached — cop defends each one)
  // ----------------------------------------------------------------
  const handleSelectCop = useCallback(() => {
    setGs((s) => ({
      ...s,
      screen: 'game',
      mode: 'cop',
      securityBudget: 10,
      budgetSpent: 0,
      nodeStatus: {
        github: 'breached',
        api: 'breached',
        db: 'breached',
        admin: 'breached',
        exfil: 'breached',
        world: 'breached',
      },
      activeNodeId: null,
      selectedOptionId: null,
      resultPhase: 'idle',
      spritePosition: 0,
      resolvedNarrative: null,
      resolvedDefenseLine: null,
      resolvedWasCaught: false,
      chosenEffectiveness: [],
    }))
  }, [])

  // ----------------------------------------------------------------
  // NODE CLICK
  // ----------------------------------------------------------------
  const handleNodeClick = useCallback((nodeId: NodeId) => {
    setGs((s) => {
      if (s.activeNodeId !== null) return s
      const stage = getStage(nodeId)
      return {
        ...s,
        activeNodeId: nodeId,
        resultPhase: 'choosing',
        selectedOptionId: null,
        resolvedNarrative: null,
        resolvedDefenseLine: null,
        resolvedWasCaught: false,
        nodeStatus: { ...s.nodeStatus, [nodeId]: 'active' },
        spritePosition: stage.order,
      }
    })
  }, [])

  // ----------------------------------------------------------------
  // OPTION SELECT + RESOLUTION
  // ----------------------------------------------------------------
  const handleSelectOption = useCallback((optionId: string) => {
    setGs((s) => ({
      ...s,
      selectedOptionId: optionId,
      resultPhase: 'resolving',
    }))

    // 700ms delay then reveal
    resolveTimer.current = setTimeout(() => {
      setGs((s) => {
        if (!s.activeNodeId) return s
        const nodeId = s.activeNodeId
        const stage = getStage(nodeId)

        if (s.mode === 'thief') {
          const opt = stage.thief.options.find((o) => o.id === optionId)!
          const roll = Math.random()
          const caught = roll > opt.successChance
          const narrative = caught ? opt.outcomeIfCaught : opt.narrative
          const newDetection = Math.min(100, s.detectionLevel + opt.detectionDelta)

          return {
            ...s,
            resultPhase: 'revealed',
            nodeStatus: { ...s.nodeStatus, [nodeId]: 'breached' },
            detectionLevel: newDetection,
            resolvedNarrative: narrative,
            resolvedDefenseLine: stage.thief.defenseLine,
            resolvedWasCaught: caught,
          }
        } else {
          // cop mode
          const opt = stage.cop.options.find((o) => o.id === optionId)!
          const newBudgetSpent = s.budgetSpent + opt.cost

          // trigger caught animation
          setShowCaughtAnimation(true)
          caughtTimer.current = setTimeout(() => setShowCaughtAnimation(false), 850)

          return {
            ...s,
            resultPhase: 'revealed',
            nodeStatus: { ...s.nodeStatus, [nodeId]: 'defended' },
            budgetSpent: newBudgetSpent,
            resolvedNarrative: opt.narrative,
            resolvedDefenseLine: null,
            resolvedWasCaught: false,
            chosenEffectiveness: [...s.chosenEffectiveness, opt.effectiveness],
          }
        }
      })
    }, 700)
  }, [])

  // ----------------------------------------------------------------
  // CONTINUE (close panel, check for round complete)
  // ----------------------------------------------------------------
  const handleContinue = useCallback(() => {
    setGs((s) => {
      const next = {
        ...s,
        activeNodeId: null,
        selectedOptionId: null,
        resultPhase: 'idle' as const,
      }

      // check completion
      if (s.mode === 'thief') {
        const breached = countBreached(next.nodeStatus)
        if (breached === 6) {
          return { ...next, screen: 'roundComplete', thiefCompleted: true }
        }
      } else if (s.mode === 'cop') {
        const defended = countDefended(next.nodeStatus)
        if (defended === 6) {
          return { ...next, screen: 'roundComplete', copCompleted: true }
        }
      }
      return next
    })
  }, [])

  // ----------------------------------------------------------------
  // EXIT TO WELCOME
  // ----------------------------------------------------------------
  const handleExitConfirmed = useCallback(() => {
    setShowExitConfirm(false)
    setGs({ ...INITIAL_STATE })
  }, [])

  // ----------------------------------------------------------------
  // PLAY AGAIN (full reset)
  // ----------------------------------------------------------------
  const handlePlayAgain = useCallback(() => {
    setGs({ ...INITIAL_STATE })
  }, [])

  // ----------------------------------------------------------------
  // COP: from round-complete go to mode choice (cop card now unlocked)
  // ----------------------------------------------------------------
  const handleGoToCopMode = useCallback(() => {
    setGs((s) => ({ ...s, screen: 'modeChoice' }))
  }, [])

  // cleanup timers
  useEffect(() => {
    return () => {
      if (resolveTimer.current) clearTimeout(resolveTimer.current)
      if (caughtTimer.current) clearTimeout(caughtTimer.current)
    }
  }, [])

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------

  if (gs.screen === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />
  }

  if (gs.screen === 'modeChoice') {
    return (
      <ModeChoiceScreen
        thiefCompleted={gs.thiefCompleted}
        onSelectThief={handleSelectThief}
        onSelectCop={handleSelectCop}
      />
    )
  }

  if (gs.screen === 'roundComplete') {
    return (
      <RoundCompleteScreen
        gameState={gs}
        onPlayAsCop={handleGoToCopMode}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // ----------------------------------------------------------------
  // GAME SCREEN
  // ----------------------------------------------------------------

  const budgetRemaining = gs.securityBudget - gs.budgetSpent

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Exit button — fixed bottom-left */}
      <button
        onClick={() => setShowExitConfirm(true)}
        aria-label="Exit simulation"
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 40,
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '2px',
          padding: '6px 10px',
          background: '#0f0f18',
          color: 'rgba(226,232,240,0.45)',
          fontSize: '0.55rem',
          letterSpacing: '0.1em',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
          e.currentTarget.style.color = '#e2e8f0'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
          e.currentTarget.style.color = 'rgba(226,232,240,0.45)'
        }}
      >
        ← HOME
      </button>

      {/* Exit confirmation overlay */}
      {showExitConfirm && (
        <ExitConfirm
          onStay={() => setShowExitConfirm(false)}
          onExit={handleExitConfirmed}
        />
      )}

      <StatusBar
        gameState={gs}
        onNodeClick={handleNodeClick}
        showCaughtAnimation={showCaughtAnimation}
      />

      <div style={{ flex: 1 }}>
        {/* No active node — idle prompt */}
        {gs.activeNodeId === null && (
          <div
            style={{
              padding: '32px 24px',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            <div className="breach-label" style={{ marginBottom: '12px' }}>
              {gs.mode === 'thief' ? 'THIEF_MODE_ACTIVE:' : 'COP_MODE_ACTIVE:'}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(226,232,240,0.65)', lineHeight: 1.65 }}>
              {gs.mode === 'thief'
                ? 'Select a node above to begin your attack. Start with GITHUB — the leaked key is already out there.'
                : 'Select a breached node above to start defending it. Each defence costs budget — spend it wisely.'}
            </p>

            {/* Remaining node hints */}
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {NODE_IDS.filter((id) => {
                const st = gs.nodeStatus[id]
                return gs.mode === 'thief' ? st === 'neutral' : st === 'breached'
              }).map((id) => {
                const stage = getStage(id)
                return (
                  <button
                    key={id}
                    onClick={() => handleNodeClick(id)}
                    style={{
                      border: `1px solid ${gs.mode === 'thief' ? 'rgba(255,107,74,0.35)' : 'rgba(0,255,204,0.35)'}`,
                      borderRadius: '2px',
                      padding: '6px 12px',
                      background: 'transparent',
                      color: gs.mode === 'thief' ? 'rgba(255,107,74,0.8)' : 'rgba(0,255,204,0.8)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        gs.mode === 'thief'
                          ? 'rgba(255,107,74,0.08)'
                          : 'rgba(0,255,204,0.08)'
                      e.currentTarget.style.borderColor =
                        gs.mode === 'thief' ? '#ff6b4a' : '#00ffcc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor =
                        gs.mode === 'thief'
                          ? 'rgba(255,107,74,0.35)'
                          : 'rgba(0,255,204,0.35)'
                    }}
                  >
                    {stage.label} →
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Active node panel */}
        {gs.activeNodeId && gs.resultPhase !== 'idle' && (
          <StagePanel
            activeNodeId={gs.activeNodeId}
            mode={gs.mode}
            resultPhase={gs.resultPhase}
            selectedOptionId={gs.selectedOptionId}
            resolvedNarrative={gs.resolvedNarrative}
            resolvedDefenseLine={gs.resolvedDefenseLine}
            resolvedWasCaught={gs.resolvedWasCaught}
            budgetRemaining={budgetRemaining}
            onSelectOption={handleSelectOption}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  )
}
