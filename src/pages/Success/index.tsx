import { Link } from 'react-router-dom'
import { CheckCircle2, Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react'

export default function Success() {
  return (
    <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
        
        {/* Efeito de Confete Visual */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="flex justify-center mb-8">
          <div className="bg-green-50 p-4 rounded-full">
            <CheckCircle2 size={60} className="text-green-500" />
          </div>
        </div>

        <h1 className="text-4xl font-black mb-4 tracking-tight">INSCRIÇÃO CONFIRMADA!</h1>
        <p className="text-gray-500 font-medium mb-10">Parabéns, atleta! Seu kit Founder Edition já está reservado. Prepare os tênis para a FLONA.</p>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Calendar className="text-gray-400" size={20} />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Data do Evento</p>
              <p className="font-bold text-sm">06 de Junho, 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <MapPin className="text-gray-400" size={20} />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Local de Encontro</p>
              <p className="font-bold text-sm">Entrada Principal - FLONA</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Trophy className="text-gray-400" size={20} />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Sua Categoria</p>
              <p className="font-bold text-sm">Trail Run Club - 06km</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <a 
            href="https://chat.whatsapp.com/seu-link-de-grupo" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform"
          >
            Entrar no Grupo de Atletas <ArrowRight size={18} />
          </a>
          
          <Link 
            to="/" 
            className="block text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-black transition-colors pt-4"
          >
            Voltar para o Início
          </Link>
        </div>

        <p className="mt-10 text-[9px] text-gray-400 font-medium leading-relaxed">
          Um e-mail de confirmação foi enviado para você. <br />
          Dúvidas? Entre em contato com a organização.
        </p>
      </div>
    </div>
  )
}
