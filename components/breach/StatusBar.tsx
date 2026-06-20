'use client'

import { useRef, useEffect, useCallback } from 'react'
import {
  type GameMode,
  type GameState,
  type NodeId,
  type NodeStatus,
  NODE_IDS,
  STAGES,
  countBreached,
  countDefended,
} from '@/lib/game-data'
import { Sprite } from './Sprite'

interface StatusBarProps {
  gameState: GameState
  onNodeClick: (nodeId: NodeId) => void
  showCaughtAnimation: boolean
}

// Node icons as inline SVG paths
function NodeIcon({ icon, size = 14 }: { icon: string; size?: number }) {
  const paths: Record<string, JSX.Element> = {
    code: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="5,4 1,8 5,12" />
        <polyline points="11,4 15,8 11,12" />
      </svg>
    ),
    plug: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="7" width="6" height="5" rx="1" />
        <line x1="6" y1="4" x2="6" y2="7" />
        <line x1="10" y1="4" x2="10" y2="7" />
        <line x1="8" y1="12" x2="8" y2="15" />
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="8" cy="4" rx="5" ry="2" />
        <path d="M3 4v4c0 1.1 2.2 2 5 2s5-.9 5-2V4" />
        <path d="M3 8v4c0 1.1 2.2 2 5 2s5-.9 5-2V8" />
      </svg>
    ),
    key: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5.5" cy="7.5" r="3" />
        <line x1="8" y1="7.5" x2="15" y2="7.5" />
        <line x1="13" y1="7.5" x2="13" y2="9.5" />
        <line x1="15" y1="7.5" x2="15" y2="9.5" />
      </svg>
    ),
    upload: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 10V3M5 6l3-3 3 3" />
        <path d="M3 12h10" />
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" />
        <ellipse cx="8" cy="8" rx="2.5" ry="6" />
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
    ),
  }
  return paths[icon] ?? null
}

function NodeBox({
  stage,
  status,
  mode,
  isClickable,
  onClick,
}: {
  stage: (typeof STAGES)[0]
  status: NodeStatus
  mode: GameMode
  isClickable: boolean
  onClick: () => void
}) {
  const activeClass =
    status === 'active'
      ? mode === 'thief'
        ? 'node-active-thief'
        : 'node-active-cop'
      : ''

  const borderStyle =
    status === 'breached'
      ? { borderColor: '#ff6b4a' }
      : status === 'defended'
        ? { borderColor: '#00ffcc' }
        : status === 'active'
          ? {}
          : { borderColor: 'rgba(255,255,255,0.2)' }

  const textColor =
    status === 'breached'
      ? '#ff6b4a'
      : status === 'defended'
        ? '#00ffcc'
        : status === 'active'
          ? mode === 'thief'
            ? '#ff6b4a'
            : '#00ffcc'
          : 'rgba(226,232,240,0.6)'

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      aria-label={`${stage.label} — ${status}`}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        opacity: isClickable || status !== 'neutral' ? 1 : 0.35,
        background: 'transparent',
        border: '1px solid',
        borderRadius: '2px',
        padding: '6px 4px 4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        width: '52px',
        minWidth: '44px',
        position: 'relative',
        transition: 'opacity 0.2s',
        color: textColor,
        ...borderStyle,
      }}
      className={activeClass}
    >
      <NodeIcon icon={stage.icon} size={13} />
      <span style={{ fontSize: '0.5rem', letterSpacing: '0.06em', lineHeight: 1 }}>
        {stage.label}
      </span>

      {/* breached X indicator */}
      {status === 'breached' && (
        <span
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-4px',
            fontSize: '0.55rem',
            color: '#ff6b4a',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ✕
        </span>
      )}

      {/* defended shield indicator */}
      {status === 'defended' && (
        <span
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-4px',
            fontSize: '0.5rem',
            color: '#00ffcc',
            lineHeight: 1,
          }}
        >
          ▲
        </span>
      )}
    </button>
  )
}

export function StatusBar({
  gameState,
  onNodeClick,
  showCaughtAnimation,
}: StatusBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const nodePositions = useRef<number[]>([0, 0, 0, 0, 0, 0])

  const measurePositions = useCallback(() => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    nodeRefs.current.forEach((el, i) => {
      if (el) {
        const rect = el.getBoundingClientRect()
        nodePositions.current[i] =
          rect.left - containerRect.left + rect.width / 2
      }
    })
  }, [])

  useEffect(() => {
    measurePositions()
    const ro = new ResizeObserver(measurePositions)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measurePositions])

  const { mode, nodeStatus, resultPhase, spritePosition, detectionLevel, securityBudget, budgetSpent } =
    gameState

  const breachedCount = countBreached(nodeStatus)
  const defendedCount = countDefended(nodeStatus)

  const statusBadge =
    resultPhase === 'idle'
      ? 'IDLE'
      : mode === 'thief'
        ? 'BREACHING...'
        : 'DEFENDING...'

  const isNodeClickable = (id: NodeId) => {
    const status = nodeStatus[id]
    if (mode === 'thief') return status === 'neutral'
    if (mode === 'cop') return status === 'breached'
    return false
  }

  const detectionColor =
    detectionLevel < 30
      ? '#00ffcc'
      : detectionLevel < 60
        ? '#f59e0b'
        : '#ff6b4a'

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: '#0a0a0f',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 16px 10px',
      }}
    >
      {/* Node row with connecting lines */}
      <div
        ref={containerRef}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0 }}
      >
        {/* Sprite layer */}
        <Sprite
          mode={mode}
          spritePosition={spritePosition}
          nodePositions={nodePositions.current}
          isMoving={resultPhase === 'choosing' || resultPhase === 'resolving'}
          showCaughtAnimation={showCaughtAnimation}
        />

        {STAGES.map((stage, i) => {
          const id = stage.id as NodeId
          const status = nodeStatus[id]
          return (
            <div
              key={id}
              style={{ display: 'flex', alignItems: 'center', flex: i < 5 ? 1 : undefined }}
            >
              {/* node ref wrapper */}
              <div
                ref={(el) => {
                  nodeRefs.current[i] = el
                }}
                style={{ display: 'flex' }}
              >
                <NodeBox
                  stage={stage}
                  status={status}
                  mode={mode}
                  isClickable={
                    isNodeClickable(id) && gameState.activeNodeId === null
                  }
                  onClick={() => onNodeClick(id)}
                />
              </div>

              {/* connecting line between nodes */}
              {i < 5 && (
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    minWidth: '4px',
                    backgroundColor:
                      status === 'active' || nodeStatus[STAGES[i + 1].id as NodeId] === 'active'
                        ? mode === 'thief'
                          ? 'rgba(255,107,74,0.5)'
                          : 'rgba(0,255,204,0.5)'
                        : 'rgba(255,255,255,0.12)',
                    transition: 'background-color 0.4s ease',
                  }}
                />
              )}
            </div>
          )
        })}

        {/* Status badge */}
        <div
          style={{
            marginLeft: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              color:
                statusBadge === 'IDLE'
                  ? 'rgba(226,232,240,0.4)'
                  : mode === 'thief'
                    ? '#ff6b4a'
                    : '#00ffcc',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {statusBadge}
          </span>
          <span style={{ fontSize: '0.5rem', color: 'rgba(226,232,240,0.4)', whiteSpace: 'nowrap' }}>
            {mode === 'cop'
              ? `${defendedCount}/6 DEFENDED`
              : `${breachedCount}/6 BREACHED`}
          </span>
        </div>
      </div>

      {/* Detection / Budget meters */}
      {mode === 'thief' && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span className="breach-label">DETECTION_RISK:</span>
            <span style={{ fontSize: '0.6rem', color: detectionColor, fontWeight: 700 }}>
              {Math.round(detectionLevel)}%
            </span>
          </div>
          <div
            style={{
              height: '3px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '1px',
              overflow: 'hidden',
            }}
          >
            <div
              className="detection-meter-fill"
              style={{
                height: '100%',
                width: `${Math.min(detectionLevel, 100)}%`,
                background: detectionColor,
                transition: 'width 0.6s ease, background-color 0.4s ease',
              }}
            />
          </div>
        </div>
      )}

      {mode === 'cop' && (
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="breach-label">SECURITY_BUDGET:</span>
          <span style={{ fontSize: '0.6rem', color: securityBudget <= 2 ? '#ff6b4a' : '#00ffcc', fontWeight: 700 }}>
            {securityBudget - budgetSpent}/10 REMAINING
          </span>
        </div>
      )}
    </div>
  )
}
