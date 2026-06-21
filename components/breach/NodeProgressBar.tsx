'use client'

import { useEffect, useRef, useState } from 'react'
import { ZONES, type ZoneId } from '@/lib/maze-data'
import { NODE_CONTENT } from '@/lib/node-content'

interface NodeProgressBarProps {
  zonesCompleted: Set<ZoneId>
  accent: string
  maxWidth: number
}

// Shared, self-contained progress bar + node learning panel. Used both
// during active gameplay (MazeGame) and on the round-complete screen
// (ResultScreen) so players can review what each stage meant either way.
export function NodeProgressBar({ zonesCompleted, accent, maxWidth }: NodeProgressBarProps) {
  const [openNodeId, setOpenNodeId] = useState<ZoneId | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<ZoneId | null>(null)
  const [hasOpenedNode, setHasOpenedNode] = useState(false)
  const nodePanelRef = useRef<HTMLDivElement | null>(null)
  const nodeBarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!openNodeId) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (nodePanelRef.current?.contains(target)) return
      if (nodeBarRef.current?.contains(target)) return
      setOpenNodeId(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openNodeId])

  function handleNodeClick(id: ZoneId) {
    setHasOpenedNode(true)
    setOpenNodeId((current) => (current === id ? null : id))
  }

  return (
    <div style={{ width: '100%', maxWidth, marginTop: '18px', position: 'relative' }}>
      <div className="breach-label" style={{ marginBottom: '6px' }}>
        HACK_PROGRESS: <span style={{ color: '#00ffcc' }}>{zonesCompleted.size}/{ZONES.length} SYSTEMS COMPROMISED</span>
      </div>
      <div ref={nodeBarRef} style={{ display: 'flex', gap: '8px' }}>
        {ZONES.map((z) => {
          const done = zonesCompleted.has(z.id)
          const hovered = hoveredNodeId === z.id
          const isOpen = openNodeId === z.id
          return (
            <button
              key={z.id}
              onClick={() => handleNodeClick(z.id)}
              onMouseEnter={() => setHoveredNodeId(z.id)}
              onMouseLeave={() => setHoveredNodeId((id) => (id === z.id ? null : id))}
              aria-label={`Learn about the ${z.label} stage`}
              style={{
                flex: 1,
                position: 'relative',
                height: '8px',
                border: `1px solid ${isOpen ? '#00ffcc' : 'rgba(0,255,204,0.3)'}`,
                borderRadius: '1px',
                overflow: 'visible',
                background: 'rgba(15,15,24,0.8)',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transform: hovered ? 'scale(1.045)' : 'scale(1)',
                transition: 'transform 150ms ease-out, border-color 150ms ease-out',
              }}
            >
              <div
                style={{
                  width: done ? '100%' : '0%',
                  height: '100%',
                  background: '#00ffcc',
                  transition: 'width 300ms ease-out',
                  overflow: 'hidden',
                }}
              />
              <span
                className={hasOpenedNode ? 'node-icon-pulse-subtle' : 'node-icon-pulse'}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: '1px solid rgba(0,255,204,0.7)',
                  background: '#0a0a0f',
                  color: '#00ffcc',
                  fontSize: '6px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}
              >
                i
              </span>
            </button>
          )
        })}
      </div>

      {openNodeId && (
        <div
          ref={nodePanelRef}
          className="breach-card panel-fade-in"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            padding: '14px 16px',
            zIndex: 50,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: accent, letterSpacing: '0.04em' }}>
              {ZONES.find((z) => z.id === openNodeId)?.label} — {NODE_CONTENT[openNodeId].name}
            </div>
            <button
              onClick={() => setOpenNodeId(null)}
              aria-label="Close"
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '2px',
                padding: '2px 6px',
                background: '#0f0f18',
                color: 'rgba(226,232,240,0.6)',
                fontSize: '0.6rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '0.68rem', color: '#e2e8f0', lineHeight: 1.55, marginBottom: '6px' }}>
            <span style={{ color: '#ff6b4a', fontWeight: 700 }}>EXPLOIT: </span>
            {NODE_CONTENT[openNodeId].exploit}
          </p>
          <p style={{ fontSize: '0.68rem', color: '#e2e8f0', lineHeight: 1.55, marginBottom: '6px' }}>
            <span style={{ color: '#00ffcc', fontWeight: 700 }}>DEFENSE: </span>
            {NODE_CONTENT[openNodeId].defense}
          </p>
          <p style={{ fontSize: '0.68rem', color: 'rgba(226,232,240,0.85)', lineHeight: 1.55 }}>
            <span style={{ fontWeight: 700 }}>DO / DON&apos;T: </span>
            {NODE_CONTENT[openNodeId].doDont}
          </p>
        </div>
      )}
    </div>
  )
}
