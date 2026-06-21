'use client'

import { useCallback, useState } from 'react'
import { WelcomeScreen, ModeChoiceScreen, ResultScreen } from '@/components/breach/Screens'
import { MazeGame, type GameMode, type GameResult } from '@/components/breach/MazeGame'
import { ThemeProvider } from '@/components/breach/ThemeContext'
import { ThemeToggle } from '@/components/breach/ThemeToggle'
import { HamburgerMenu } from '@/components/breach/HamburgerMenu'

type Screen = 'welcome' | 'modeChoice' | 'game' | 'result'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [mode, setMode] = useState<GameMode>('thief')
  const [result, setResult] = useState<GameResult | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const [seenHowTo, setSeenHowTo] = useState<Record<GameMode, boolean>>({ thief: false, cop: false })

  const handleStart = useCallback(() => setScreen('modeChoice'), [])

  const handleSelectMode = useCallback((m: GameMode) => {
    setMode(m)
    setGameKey((k) => k + 1)
    setScreen('game')
  }, [])

  const handleFinish = useCallback((r: GameResult) => {
    setResult(r)
    setScreen('result')
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameKey((k) => k + 1)
    setScreen('game')
  }, [])

  const handleSwitchMode = useCallback(() => {
    setMode((m) => (m === 'thief' ? 'cop' : 'thief'))
    setGameKey((k) => k + 1)
    setScreen('game')
  }, [])

  const handleGoHome = useCallback(() => setScreen('welcome'), [])

  const handleHowToSeen = useCallback((m: GameMode) => {
    setSeenHowTo((prev) => ({ ...prev, [m]: true }))
  }, [])

  const handleResetProgress = useCallback(() => {
    setResult(null)
    setSeenHowTo({ thief: false, cop: false })
    setGameKey(0)
    setScreen('welcome')
  }, [])

  let content: React.ReactNode
  if (screen === 'welcome') {
    content = <WelcomeScreen onStart={handleStart} />
  } else if (screen === 'modeChoice') {
    content = (
      <ModeChoiceScreen
        onSelectThief={() => handleSelectMode('thief')}
        onSelectCop={() => handleSelectMode('cop')}
      />
    )
  } else if (screen === 'result' && result) {
    content = (
      <ResultScreen
        mode={mode}
        result={result}
        onPlayAgain={handlePlayAgain}
        onSwitchMode={handleSwitchMode}
        onGoHome={handleGoHome}
      />
    )
  } else {
    content = (
      <MazeGame
        key={gameKey}
        mode={mode}
        onFinish={handleFinish}
        onExit={handleGoHome}
        showHowToInitially={!seenHowTo[mode]}
        onHowToSeen={() => handleHowToSeen(mode)}
      />
    )
  }

  return (
    <ThemeProvider>
      <HamburgerMenu mode={mode} onResetProgress={handleResetProgress} />
      <ThemeToggle />
      <div style={{ paddingTop: '46px' }}>{content}</div>
    </ThemeProvider>
  )
}
