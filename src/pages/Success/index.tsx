import { Link } from 'react-router-dom'
import { CheckCircle, Trophy, MessageCircle } from 'lucide-react'

/**
 * Página de Sucesso ✅
 * 
 * DESIGN PHILOSOPHY:
 * 1. Confirmação Visual: Uso de cores verdes e ícones de sucesso.
 * 2. Próximos Passos: Instruções claras para reduzir a ansiedade pós-compra.
 * 3. Gatilho de Dopamina: Parabenizar o usuário pela decisão.
 */
export default function Success() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-8">
        
        {/* Ícone de Sucesso Animado (CSS) */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
          <CheckCircle className="text-green-500 relative z-10" size={100} />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            INSCRIÇÃO <br /> REALIZADA!
          </h1>
          <p className="text-gray-500 text-lg">
            Parabéns, você deu o primeiro passo para uma experiência incrível na Flona.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
          <h3 className="font-bold flex items-center justify-center gap-2">
            <Trophy className="text-yellow-600" size={18} /> O QUE ACONTECE AGORA?
          </h3>
          <ul className="text-sm text-gray-600 text-left space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">01.</span>
              Verifique seu e-mail (inclusive a caixa de spam).
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">02.</span>
              Salve o comprovante de pagamento.
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">03.</span>
              Nos vemos no dia 06 de Junho às 07:00!
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <a 
            href="https://wa.me/seu-numero" 
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all"
          >
            <MessageCircle size={20} /> ENTRAR NO GRUPO DO WHATSAPP
          </a>
          <Link 
            to="/" 
            className="text-gray-400 hover:text-black font-medium text-sm transition-colors"
          >
            Voltar para o site
          </Link>
        </div>

      </div>
    </div>
  )
}
