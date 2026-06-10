// ─────────────────────────────────────────────────────────────────────────────
// 📌 UrgencyTimer — Timer de Urgência Reutilizável
//
// POR QUÊ? O Checkout.tsx e a Flona12km/index.tsx ambos têm um timer de
// contagem regressiva. Estava DUPLICADO. Extraímos aqui.
//
// REGRA SÊNIOR: Se você copiou e colou um bloco de código em 2 lugares,
// já é hora de criar um componente.
//
// COMO USAR:
//   <UrgencyTimer
//     storageKey="flona12km_expiry"
//     totalSeconds={600}
//     available={eventStatus?.available}
//     capacity={eventStatus?.capacity}
//     onExpire={() => navigate('/')}
//   />
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'

interface UrgencyTimerProps {
  /** Chave única no localStorage para salvar o tempo de expiração. Deve ser única por evento. */
  storageKey: string
  /** Tempo total em segundos. Padrão: 600 (10 minutos) */
  totalSeconds?: number
  /** Quantas vagas ainda disponíveis */
  available?: number
  /** Capacidade total do evento */
  capacity?: number
  /** Função chamada quando o timer chega a zero */
  onExpire: () => void
}

export function UrgencyTimer({
  storageKey,
  totalSeconds = 600,
  available,
  capacity,
  onExpire,
}: UrgencyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds)

  // ─────────────────────────────────────────────────────────────────────────
  // 📌 CONCEITO: Persistência do timer no localStorage
  // Se o usuário recarregar a página, o timer continua de onde parou.
  // Como? Salvamos o momento de EXPIRAÇÃO (não o tempo restante).
  // Ao montar, calculamos: expiryTime - Date.now() = tempo restante.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const now = Date.now()
    const savedExpiry = localStorage.getItem(storageKey)
    let expiryTime: number

    if (savedExpiry && parseInt(savedExpiry) > now) {
      // Timer já existia e ainda não expirou — continua de onde parou
      expiryTime = parseInt(savedExpiry)
    } else {
      // Timer novo — marca a expiração no futuro
      expiryTime = now + totalSeconds * 1000
      localStorage.setItem(storageKey, expiryTime.toString())
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000))
      setTimeLeft(remaining)

      if (remaining <= 0) {
        localStorage.removeItem(storageKey)
        clearInterval(interval)
        onExpire()
      }
    }, 1000)

    // cleanup: cancela o interval ao desmontar o componente
    return () => clearInterval(interval)
  }, [storageKey, totalSeconds, onExpire])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec < 10 ? '0' : ''}${sec}`
  }

  // Alerta vermelho pulsante quando falta menos de 60 segundos
  const isUrgent = timeLeft < 60

  return (
    <div className="sticky top-0 z-50 bg-[#0A1A0A] border-b border-green-900/30 py-3 px-6 overflow-hidden">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Indicador de reserva ativa */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isUrgent ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'
            }`}
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
            Vaga Reservada
          </span>
        </div>

        {/* Contadores */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[8px] text-gray-600 uppercase font-bold">Tempo Restante</p>
            <p
              className={`text-sm font-black tabular-nums ${
                isUrgent ? 'text-red-400 animate-pulse' : 'text-green-400'
              }`}
            >
              {formatTime(timeLeft)}
            </p>
          </div>

          {/* Divisor vertical */}
          <div className="h-6 w-px bg-white/10" />

          {available !== undefined && capacity !== undefined && (
            <div className="text-right">
              <p className="text-[8px] text-gray-600 uppercase font-bold">Vagas</p>
              <p className="text-sm font-black text-white">
                {available}
                <span className="text-[10px] text-gray-500"> / {capacity}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Barra de progresso do tempo — diminui da esquerda para a direita */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-green-500 transition-all duration-1000 ease-linear"
        style={{ width: `${(timeLeft / totalSeconds) * 100}%` }}
      />
    </div>
  )
}
