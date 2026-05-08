import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Lock, Construction, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [clickCount, setClickCount] = useState(0)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogoClick = () => {
    const newCount = clickCount + 1
    // Silêncio absoluto no console 🤫
    if (newCount >= 3) {
      setShowLogin(true)
    }
    setClickCount(newCount)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) {
        navigate('/portal-flona')
      }
    } catch (error: any) {
      // Erro genérico para não dar pistas
      console.error('Falha na autenticação administrativa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-6 text-center">
      
      {!showLogin ? (
        <div 
          onClick={handleLogoClick}
          className="max-w-md cursor-default select-none active:scale-[0.99] transition-transform"
        >
          <div className="mb-8 opacity-20">
            <Construction size={80} className="text-gray-200 mx-auto mb-6" />
          </div>
          <h1 className="text-xl font-black text-gray-200 uppercase tracking-widest mb-2">
            Página em Manutenção
          </h1>
          <p className="text-gray-300 text-[10px] font-medium">
            Obrigado pela paciência. <br />
            Estamos trabalhando para você.
          </p>
          <div className="mt-20 flex items-center justify-center gap-2 text-[9px] text-gray-100 font-bold uppercase tracking-[0.4em]">
            FLONA 2024
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
          <Lock className="text-[#1A0F0A] mx-auto mb-6" size={40} />
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tight">Identificação</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email"
              placeholder="Identificador"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:border-black transition-all text-sm font-medium"
              required
            />
            <input 
              type="password"
              placeholder="Chave de Acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:border-black transition-all text-sm font-medium"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Acessar'}
            </button>
          </form>
          <button 
            onClick={() => setShowLogin(false)}
            className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-black"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  )
}
