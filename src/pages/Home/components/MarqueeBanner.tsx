import React from 'react'

export const MarqueeBanner: React.FC = () => {
  return (
    <div className="bg-black text-white py-4 overflow-hidden border-b border-white/5 relative z-50">
      <div className="flex animate-marquee whitespace-nowrap">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="mx-8 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] flex items-center gap-4">
            <span className="w-2 h-2 bg-[#D4B996] rounded-full animate-pulse" />
            Lote 1 Quase Esgotando
            <span className="text-white/20">/</span>
            Garanta sua Vaga no Maior Evento de Trail Run
            <span className="w-2 h-2 bg-[#D4B996] rounded-full animate-pulse" />
          </span>
        ))}
      </div>
    </div>
  )
}
