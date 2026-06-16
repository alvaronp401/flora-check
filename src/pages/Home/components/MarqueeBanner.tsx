import React from 'react'
import { Flame, Waves } from 'lucide-react'
import type { EventStatus } from '../types'

interface MarqueeBannerProps {
  eventStatus: EventStatus | null
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ eventStatus }) => {
  const lotName = eventStatus?.currentLot?.name || 'PRIMEIRO'
  const available = eventStatus?.available ?? 0
  const isSoldOut = eventStatus?.is_sold_out || available <= 0
  const isEixao = eventStatus?.slug === 'alongamento-corrida-eixao-sul'
  const Icon = isEixao ? Waves : Flame

  const message = isSoldOut
    ? 'VAGAS COMPLETAMENTE ESGOTADAS - ACOMPANHE A AGENDA DE PROXIMOS EVENTOS'
    : isEixao
      ? 'AULAO NO EIXAO SUL - 08H - ALONGAMENTO + CORRIDA/CAMINHADA - LEVE SUA CANGA - CAFE EM GRUPO -'
      : `QUASE ESGOTANDO - GARANTA SUA VAGA NO ${lotName} LOTE -`

  const items = (
    <div className="flex items-center">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mx-4 flex shrink-0 items-center md:mx-8">
          <span className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white md:text-xs">
            <Icon size={14} className={isEixao ? 'text-sky-300' : 'fill-orange-500 text-orange-500'} />
            {message}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <nav className={`sticky top-0 z-50 overflow-hidden whitespace-nowrap border-b py-3 shadow-2xl ${isEixao ? 'border-sky-300/20 bg-[#031024]' : 'border-white/10 bg-black'}`}>
      <div className="flex w-max animate-marquee hover:pause will-change-transform backface-hidden">
        {items}
        {items}
        {items}
        {items}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee 19s linear infinite;
        }
        .pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </nav>
  )
}
