import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import eventArt from '../../../assets/image.png'

export const Hero: React.FC = () => {
  return (
    <header className="relative py-12 md:py-24 px-6 overflow-hidden bg-[#4B2C20]">
      <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-10 items-center">
        
        <div className="text-left">
          {/* BADGE FOUNDER EDITION */}
          <div className="relative inline-block py-6 px-12 mb-8 group cursor-default">
            <div className="absolute inset-0 border-2 border-white/40 rounded-[100%] scale-105 -rotate-2 animate-pulse" />
            <div className="absolute inset-0 border-2 border-white/10 rounded-[100%] scale-115 rotate-3" />
            
            <span className="relative text-white text-[10px] md:text-xs font-black uppercase tracking-[0.4em] drop-shadow-lg">
              Founder Edition Brasília 2026
            </span>
          </div>
          
          <h1 className="flex flex-col mb-10 relative group cursor-default select-none">
            {/* TRAIL RUN */}
            <div className="relative inline-block -skew-x-6">
              <span className="text-6xl md:text-9xl font-black text-white leading-none tracking-tighter uppercase block drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                TRAIL RUN
              </span>
              <div className="absolute -bottom-4 -left-8 -right-16 h-12 md:h-20 bg-white/10 blur-3xl -z-10 rounded-[100%] rotate-2 animate-pulse" />
            </div>
            
            {/* Club */}
            <div className="relative self-end -mt-2 md:-mt-4 group">
              <div className="absolute inset-0 bg-white/5 blur-3xl scale-150 -rotate-3 rounded-full" />
              <span className="relative font-serif italic text-5xl md:text-8xl text-[#D4B996] drop-shadow-2xl pr-6 block">
                Club
              </span>
            </div>
          </h1>
          
          <p className="text-base md:text-xl text-gray-300 mb-10 max-w-md leading-relaxed font-medium">
            Explore a Floresta Nacional em uma jornada única de superação, saúde e conexão com a natureza.
          </p>
          
          <div className="flex flex-col gap-6 mb-12">
            <Link to="/checkout" className="w-full md:w-auto">
              <Button variant="secondary" pulse showShimmer className="w-full md:w-auto text-xl py-6 px-16 group shadow-2xl">
                GARANTIR MINHA VAGA
              </Button>
            </Link>

            <div className="flex flex-row flex-wrap gap-4 md:gap-8 items-center text-gray-400 font-bold text-xs md:text-sm">
              <span className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-xl border border-white/5 whitespace-nowrap">
                <Calendar size={22} className="text-[#D4B996]" /> 06 de JUNHO
              </span>
              <span className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-xl border border-white/5 whitespace-nowrap">
                <MapPin size={22} className="text-[#D4B996]" /> FLONA - BRASÍLIA
              </span>
            </div>
          </div>
        </div>

        {/* Imagem Principal (Visual do Evento) */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-75 animate-pulse" />
          <div className="relative rounded-[40px] overflow-hidden border-4 border-white/10 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
            <img 
              src={eventArt} 
              alt="Trail Run Evento" 
              className="w-full h-auto"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

      </div>
    </header>
  )
}
