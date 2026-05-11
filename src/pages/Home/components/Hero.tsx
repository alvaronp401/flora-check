import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import eventArt from '../../../assets/artenova.png'
import { API_URL } from '../../../config/api'

export const Hero: React.FC = () => {
  const [eventStatus, setEventStatus] = useState({ available: 50, occupied: 0 })

  useEffect(() => {
    const fetchStatus = () => {
      fetch(`${API_URL}/event-status`)
        .then(res => res.json())
        .then(data => setEventStatus(data))
        .catch(err => console.error('Erro ao buscar vagas:', err))
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // 🛰️ Atualiza a cada 5 segundos
    return () => clearInterval(interval)
  }, [])
  return (
    <header className="relative py-12 md:py-24 px-6 overflow-hidden bg-[#4B2C20]">
      <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-10 items-center">
        
        {/* Lado Esquerdo: Conteúdo (Centralizado no Mobile, Esquerda no Desktop) */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          
          {/* BADGE FOUNDER EDITION */}
          <div className="relative inline-block py-6 px-12 mb-8 group cursor-default">
            <div className="absolute inset-0 border-2 border-white/40 rounded-[100%] scale-105 -rotate-2 animate-pulse" />
            <div className="absolute inset-0 border-2 border-white/10 rounded-[100%] scale-115 rotate-3" />
            
            <span className="relative text-white text-[10px] md:text-xs font-black uppercase tracking-[0.4em] drop-shadow-lg">
              Founder Edition Brasília 2026
            </span>
          </div>
          
          {/* Container do Título com Centro Real */}
          <div className="relative mb-10 group cursor-default select-none inline-block">
            
            {/* Stack Centralizada (O coração do título) */}
            <div className="flex flex-col items-center md:items-start -skew-x-6 relative">
              <span className="text-6xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                TRAIL
              </span>
              <span className="text-6xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                RUN
              </span>
              <span className="font-serif italic text-4xl md:text-7xl text-[#D4B996] leading-none mt-4 md:mt-6 drop-shadow-2xl">
                Club
              </span>

              {/* Ampersand na Direita (Posicionamento Absoluto para não afetar o centro) */}
              <div className="absolute left-[105%] top-0 h-[65%] flex items-center">
                <span className="text-[#D4B996] font-serif italic text-5xl md:text-[8rem] leading-none drop-shadow-2xl">
                  &
                </span>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 h-20 w-40 bg-white/10 blur-3xl -z-10 rounded-full rotate-2 animate-pulse" />
          </div>
          
          <p className="text-base md:text-xl text-gray-300 mb-6 max-w-md leading-relaxed font-medium">
            Explore a Floresta Nacional em uma jornada única de superação, saúde e conexão com a natureza.
          </p>
          
          <div className="flex flex-col items-center md:items-start gap-4 mb-12 w-full">
            {/* 📉 Contador de Vagas em Tempo Real */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/60">
                Contagem ao vivo: <span className="text-[#D4B996]">{eventStatus.available} vagas restantes</span>
              </span>
            </div>

            {eventStatus.available > 0 ? (
              <Link to="/checkout" className="w-full md:w-auto">
                <Button variant="secondary" pulse showShimmer className="w-full md:w-auto text-xl py-6 px-16 group">
                  GARANTIR MINHA VAGA
                </Button>
              </Link>
            ) : (
              <div className="w-full md:w-auto opacity-50 cursor-not-allowed">
                <Button variant="secondary" className="w-full md:w-auto text-xl py-6 px-16 bg-gray-600 border-gray-500 shadow-none grayscale">
                  VAGAS ESGOTADAS
                </Button>
              </div>
            )}


            <div className="flex flex-row flex-nowrap justify-center md:justify-start gap-2 md:gap-8 items-center text-gray-400 font-bold text-[10px] md:text-sm w-full overflow-x-hidden">
              <span className="flex items-center gap-2 md:gap-3 bg-white/5 px-3 md:px-5 py-3 rounded-xl border border-white/5 whitespace-nowrap">
                <Calendar size={18} className="text-[#D4B996]" /> 06 de JUNHO
              </span>
              <span className="flex items-center gap-2 md:gap-3 bg-white/5 px-3 md:px-5 py-3 rounded-xl border border-white/5 whitespace-nowrap">
                <MapPin size={18} className="text-[#D4B996]" /> FLONA - BRASÍLIA
              </span>
            </div>
          </div>
        </div>

        {/* Imagem Principal (Visual do Evento) */}
        <div className="relative group -mt-16 md:mt-0">
          <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-75 animate-pulse" />
          <div className="relative rounded-[40px] overflow-hidden border-4 border-white/10 transform hover:scale-[1.02] transition-transform duration-500">
            <img 
              src={eventArt} 
              alt="Trail & Run Evento" 
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
