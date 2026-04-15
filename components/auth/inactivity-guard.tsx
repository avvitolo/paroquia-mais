'use client'

// InactivityGuard — desconecta o usuário após 30 min de inatividade (S1)
// Exibe modal de aviso com contagem regressiva de 2 min antes de desconectar

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

// 30 minutos de inatividade antes do aviso
const INACTIVITY_MS = 30 * 60 * 1000
// 2 minutos de contagem regressiva após o aviso
const COUNTDOWN_S = 120

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click']

export function InactivityGuard() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_S)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const signOut = useCallback(() => {
    window.location.href = '/auth/signout'
  }, [])

  const resetTimer = useCallback(() => {
    if (showWarning) return // não resetar se já está no modal de aviso

    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(COUNTDOWN_S)
    }, INACTIVITY_MS)
  }, [showWarning])

  // Inicia o timer ao montar e registra os event listeners de atividade
  useEffect(() => {
    resetTimer()
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [resetTimer])

  // Contagem regressiva quando o modal está visível
  useEffect(() => {
    if (!showWarning) {
      if (countdownTimer.current) clearInterval(countdownTimer.current)
      return
    }
    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current!)
          signOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current)
    }
  }, [showWarning, signOut])

  function handleContinue() {
    setShowWarning(false)
    if (countdownTimer.current) clearInterval(countdownTimer.current)
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    // Reinicia o timer de inatividade
    inactivityTimer.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(COUNTDOWN_S)
    }, INACTIVITY_MS)
  }

  if (!showWarning) return null

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const countdownStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl border shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#002045]">Sessão inativa</h2>
          <p className="text-sm text-muted-foreground">
            Você está inativo há 30 minutos. Por segurança, a sessão será encerrada automaticamente em:
          </p>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-4xl font-mono font-bold text-[#002045] tabular-nums">
            {countdownStr}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-[#002045] text-white hover:bg-[#1a365d]"
            onClick={handleContinue}
          >
            Continuar conectado
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sair agora
          </Button>
        </div>
      </div>
    </div>
  )
}
