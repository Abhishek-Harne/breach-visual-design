'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useTheme, hexToRgba } from '@/components/breach/ThemeContext'
import { HowToPlayContent } from '@/components/breach/HowToPlayContent'
import type { GameMode } from '@/components/breach/MazeGame'

type Tab = 'about' | 'howto' | 'credits' | 'reset'

const TABS: { id: Tab; label: string }[] = [
  { id: 'about', label: 'ABOUT' },
  { id: 'howto', label: 'HOW TO PLAY' },
  { id: 'credits', label: 'CREDITS' },
  { id: 'reset', label: 'RESET PROGRESS' },
]

const LINKS = [
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/abhishek-harne/' },
  { label: 'GITHUB', href: 'https://github.com/Abhishek-Harne' },
  { label: 'PORTFOLIO', href: 'https://abhishekharne.vercel.app/' },
]

interface HamburgerMenuProps {
  mode: GameMode
  onResetProgress: () => void
}

export function HamburgerMenu({ mode, onResetProgress }: HamburgerMenuProps) {
  const { palette: theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('about')
  const [confirmingReset, setConfirmingReset] = useState(false)

  function close() {
    setOpen(false)
    setConfirmingReset(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          position: 'fixed',
          top: '8px',
          left: '8px',
          zIndex: 90,
          width: '34px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${theme.borderMed}`,
          borderRadius: '2px',
          background: hexToRgba(theme.surface, 0.9),
          color: theme.muted,
          cursor: 'pointer',
        }}
      >
        <Menu size={16} />
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            background: theme.overlay,
          }}
        >
          <div
            className="breach-card panel-fade-in"
            style={{
              width: 'min(340px, 100%)',
              height: '100%',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div className="breach-label">MENU:</div>
              <button
                onClick={close}
                aria-label="Close menu"
                style={{
                  border: `1px solid ${theme.borderMed}`,
                  borderRadius: '2px',
                  padding: '4px 8px',
                  background: theme.surface,
                  color: theme.muted,
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id)
                    setConfirmingReset(false)
                  }}
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${tab === t.id ? theme.teal : theme.borderFaint}`,
                    borderRadius: '2px',
                    padding: '10px 12px',
                    background: tab === t.id ? hexToRgba(theme.teal, 0.08) : 'transparent',
                    color: tab === t.id ? theme.teal : theme.muted,
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1 }}>
              {tab === 'about' && (
                <p style={{ fontSize: '0.72rem', color: theme.text, lineHeight: 1.65 }}>
                  Breach is a playable explainer of how a real data breach
                  happens, built to make an invisible, technical process
                  visible and understandable. Built by Abhishek Harne.
                </p>
              )}

              {tab === 'howto' && <HowToPlayContent mode={mode} />}

              {tab === 'credits' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="breach-label">SYSTEM_OPERATOR:</span>
                    <span style={{ fontSize: '0.65rem', color: theme.teal }}>@Abhishek Harne</span>
                  </div>
                  <div style={{ fontSize: '0.6rem', color: theme.mutedFaint, letterSpacing: '0.06em' }}>
                    MADE WITH LOVE AND CURIOSITY
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {LINKS.map((link) => (
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
                        }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'reset' && (
                <div>
                  {!confirmingReset ? (
                    <button
                      onClick={() => setConfirmingReset(true)}
                      style={{
                        border: `1px solid ${theme.orange}`,
                        borderRadius: '2px',
                        padding: '12px 16px',
                        background: 'transparent',
                        color: theme.orange,
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        width: '100%',
                      }}
                    >
                      RESET ALL PROGRESS
                    </button>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.7rem', color: theme.text, lineHeight: 1.55, marginBottom: '14px' }}>
                        Reset all progress? This cannot be undone.
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setConfirmingReset(false)}
                          style={{
                            flex: 1,
                            border: `1px solid ${theme.borderMed}`,
                            borderRadius: '2px',
                            padding: '10px',
                            background: 'transparent',
                            color: theme.muted,
                            fontSize: '0.62rem',
                            letterSpacing: '0.08em',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={() => {
                            onResetProgress()
                            setConfirmingReset(false)
                            close()
                          }}
                          style={{
                            flex: 1,
                            border: `1px solid ${theme.orange}`,
                            borderRadius: '2px',
                            padding: '10px',
                            background: theme.orange,
                            color: theme.bg,
                            fontSize: '0.62rem',
                            letterSpacing: '0.08em',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          RESET
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={close} />
        </div>
      )}
    </>
  )
}
