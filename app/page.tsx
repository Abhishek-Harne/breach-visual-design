'use client'

import { useCallback, useState } from 'react'
import { WelcomeScreen, ModeChoiceScreen, ResultScreen } from '@/components/breach/Screens'
import { MazeGame, type GameMode, type GameResult } from '@/components/breach/MazeGame'

type Screen = 'welcome' | 'modeChoice' | 'game' | 'result'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [mode, setMode] = useState<GameMode>('thief')
  const [result, setResult] = useState<GameResult | null>(null)
  const [gameKey, setGameKey] = useState(0)

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

  if (screen === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />
  }

  if (screen === 'modeChoice') {
    return (
      <ModeChoiceScreen
        onSelectThief={() => handleSelectMode('thief')}
        onSelectCop={() => handleSelectMode('cop')}
      />
    )
  }

  if (screen === 'result' && result) {
    return (
      <ResultScreen
        mode={mode}
        result={result}
        onPlayAgain={handlePlayAgain}
        onSwitchMode={handleSwitchMode}
        onGoHome={handleGoHome}
      />
    )
  }

  return <MazeGame key={gameKey} mode={mode} onFinish={handleFinish} onExit={handleGoHome} />
}
