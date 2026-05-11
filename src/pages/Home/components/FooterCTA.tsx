import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import atleta1 from '../../../assets/atleta1.png'
import atleta2 from '../../../assets/atleta2.png'
import atleta3 from '../../../assets/atleta3.png'
import { API_URL } from '../../../config/api'

export const FooterCTA: React.FC = () => {
  const [eventStatus, setEventStatus] = useState({ available: 50, occupied: 0 })

  useEffect(() => {
    // 📡 Buscar status das vagas ao carregar
    const fetchStatus = () => {
      fetch(`${API_URL}/event-status`)
        .then(res => res.json())
        .then(data => setEventStatus(data))
        .catch(err => console.error('Erro ao buscar status:', err))
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bg-[#1A0F0A] py-24 border-t border-white/5 relative overflow-hidden">
      {/* Luzes de Fundo (Blur) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4B996]/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Badge Social Proof Restaurado */}
        <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-full mb-10 backdrop-blur-sm">
          <div className="flex -space-x-3">
            {[atleta1, atleta2, atleta3].map((atleta, i) => (
              <img 
                key={i}
                src={atleta} 
                className="w-8 h-8 rounded-full border-2 border-[#1A0F0A] object-cover" 
                alt="Participante"
                loading="lazy"
              />
            ))}
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
            + de 20 participantes confirmados
          </p>
        </div>

        <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-none">
          A PRÓXIMA SUPERAÇÃO <br /> É A <span className="text-[#D4B996]">SUA</span>
        </h2>
        
        <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          As vagas são limitadas. Garanta seu kit exclusivo e faça parte da Founder Edition no coração da FLONA.
        </p>

        <div className="flex flex-col items-center gap-6">
          {eventStatus.available > 0 ? (
            <Link to="/checkout" className="inline-block w-full md:w-auto">
              <Button variant="secondary" pulse showShimmer className="w-full md:w-auto text-xl py-6 px-16 group shadow-2xl">
                QUERO ME INSCREVER AGORA
              </Button>
            </Link>
          ) : (
            <div className="w-full md:w-auto opacity-50 cursor-not-allowed">
              <Button variant="secondary" className="w-full md:w-auto text-xl py-6 px-16 bg-gray-600 border-gray-500 shadow-none grayscale">
                INSCRIÇÕES ENCERRADAS
              </Button>
            </div>
          )}
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4B996] animate-pulse">
            {eventStatus.available > 0 ? `Apenas ${eventStatus.available} vagas restantes` : 'Lote Final Esgotado'}
          </p>
        </div>

      </div>
      
      <div className="mt-20 pt-10 border-t border-white/10 flex flex-col items-center gap-8 max-w-6xl mx-auto px-6 relative z-10">
        <p className="text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-loose text-center">
          © 2026 Trail & Run Club • Flona Experience • CNPJ: 63.031.213/0001-09 <br /> Todos os direitos reservados
        </p>
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex gap-8">
            <Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
          <a href="https://instagram.com/eualvaronoronha" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4B996] transition-colors border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12 text-center md:text-left">
            Desenvolvido por: <span className="font-black text-[#D4B996]">@eualvaronoronha</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
