import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import { Button } from './Button'

/**
 * CookieBanner (Modo Sênior: Compliance & LGPD) 🍪
 * 
 * Este componente garante que o usuário saiba que estamos coletando dados
 * e dá a ele o poder de escolha. Essencial para evitar multas e bloqueios.
 */
export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000) // Aparece após 2s
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setIsVisible(false)
    // Aqui você dispararia o evento de ativação de Pixels/Analytics
    // Cookies aceitos.
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
          <Cookie size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">Privacidade & Cookies</h4>
          <p className="text-xs text-gray-500 leading-relaxed mt-1">
            Usamos cookies para melhorar sua experiência e analisar o tráfego do site. 
            Ao continuar, você concorda com nossa política de privacidade.
          </p>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-gray-300 hover:text-black">
          <X size={18} />
        </button>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 py-3 text-xs" 
          onClick={() => setIsVisible(false)}
        >
          RECUSAR
        </Button>
        <Button 
          variant="primary" 
          className="flex-1 py-3 text-xs" 
          onClick={acceptCookies}
        >
          ACEITAR TUDO
        </Button>
      </div>
    </div>
  )
}
