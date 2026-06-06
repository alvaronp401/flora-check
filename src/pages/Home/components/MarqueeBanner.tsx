import React from 'react'
import { Flame } from 'lucide-react'

interface MarqueeBannerProps {
  eventStatus: any
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ eventStatus }) => {
  const lotName = eventStatus?.currentLot?.name || 'PRIMEIRO'
  const isSoldOut = eventStatus?.is_sold_out || eventStatus?.available <= 0

  const items = (
    <div className="flex items-center">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center mx-4 md:mx-8 shrink-0">
          <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-6">
            <Flame size={14} className="text-orange-500 fill-orange-500" />
            {isSoldOut ? (
              'VAGAS COMPLETAMENTE ESGOTADAS - ACOMPANHE A AGENDA DE PRÓXIMOS EVENTOS'
            ) : (
              `QUASE ESGOTANDO - GARANTA SUA VAGA NO ${lotName} LOTE -`
            )}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <nav className="bg-black py-3 overflow-hidden whitespace-nowrap border-b border-white/10 sticky top-0 z-50 shadow-2xl">
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

