import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, CreditCard } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

export const FooterCTA: React.FC = () => {
  return (
    <footer className="py-20 md:py-32 bg-[#1A0F0B] relative overflow-hidden text-center">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-3 rounded-full mb-10">
          <span className="flex -space-x-3">
             {[1,2,3,4,5].map(i => (
               <img 
                 key={i}
                 src={`https://i.pravatar.cc/100?u=user${i}`}
                 className="w-8 h-8 rounded-full border-2 border-[#1A0F0B] object-cover"
                 alt="Participante"
               />
             ))}
          </span>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            + de 20 participantes confirmados
          </p>
        </div>

        <h3 className="text-white text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[1.05]">
          A PRÓXIMA <br />
          <span className="text-[#D4B996]">SUPERAÇÃO</span> <br />
          É A SUA.
        </h3>
        
        <div className="relative inline-block group mb-12">
          <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
          
          <Link to="/checkout">
            <Button 
              variant="secondary" 
              pulse 
              showShimmer 
              className="text-xl md:text-2xl py-6 px-16 transform hover:-translate-y-2 transition-all duration-500 shadow-2xl"
            >
              QUERO MINHA VAGA
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mt-12">
             <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-white font-black uppercase tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                <ShieldCheck size={20} className="text-blue-500 animate-pulse" /> Compra 100% Segura
             </div>
             <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-white font-black uppercase tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                <CreditCard size={20} className="text-blue-500" /> PIX ou Cartão
             </div>
          </div>
        </div>
      </div>
      
      <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 max-w-6xl mx-auto px-6 relative z-10">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-loose">
          © 2026 Trail Run Club • Flona Experience <br className="md:hidden" /> Todos os direitos reservados
        </p>
        <div className="flex gap-8 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-white transition-colors">Privacidade</a>
        </div>
      </div>
    </footer>
  )
}
