import { useState, useEffect } from 'react'
import { Trophy, Users, DollarSign, Shirt, Search, Lock, Download, RefreshCw, CheckCircle2, Clock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Registration {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  shirt_size: string;
  payment_status: 'paid' | 'pending';
  created_at: string;
}

interface Stats {
  total: number;
  paid: number;
  pending: number;
  revenue: number;
  shirts: Record<string, number>;
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [secret, setSecret] = useState(localStorage.getItem('admin_secret') || '')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [data, setData] = useState<Registration[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [revealedIds, setRevealedIds] = useState<string[]>([])

  // 🛡️ Muralha 1: Verificar se existe sessão no Supabase
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/organizacao') // Xô, xereta!
      }
    }
    checkAuth()
  }, [])

  const fetchData = async () => {
    if (!secret) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada')

      const response = await fetch('http://localhost:3001/admin/registrations', {
        headers: { 
          'x-admin-secret': secret,
          'Authorization': `Bearer ${session.access_token}` // Token Digital Sênior 🛡️
        }
      })
      if (!response.ok) throw new Error('Acesso negado pela Fortaleza')
      
      const result = await response.json()
      setData(result.registrations)
      setStats(result.stats)
      setIsAuthorized(true)
      localStorage.setItem('admin_secret', secret)
    } catch (err: any) {
      alert(err.message || 'Falha na autenticação dupla.')
      setIsAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (secret) fetchData()
  }, [])

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const maskData = (val: string, type: 'cpf' | 'phone') => {
    if (type === 'cpf') return `***.${val.substring(3, 6)}.***-**`
    return `(61) *****-${val.substring(val.length - 4)}`
  }

  const exportCSV = () => {
    const headers = ['Nome', 'CPF', 'Email', 'Telefone', 'Tamanho', 'Status', 'Data']
    const csvContent = [
      headers.join(','),
      ...data.map(r => [
        r.full_name,
        r.cpf,
        r.email,
        r.phone,
        r.shirt_size,
        r.payment_status,
        new Date(r.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inscritos_flona_${new Date().toLocaleDateString()}.csv`
    link.click()
  }

  const filteredData = data.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cpf.includes(searchTerm)
  )

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#1A0F0A] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 text-center">
          <Lock className="text-[#D4B996] mx-auto mb-6" size={48} />
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Segunda Tranca</h1>
          <p className="text-gray-400 text-sm mb-8">Insira sua Chave Mestra de 64 caracteres.</p>
          <input 
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-center mb-6 outline-none focus:border-[#D4B996] transition-all"
            placeholder="••••••••••••"
          />
          <button 
            onClick={fetchData}
            disabled={loading}
            className="w-full bg-[#D4B996] text-[#1A0F0A] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#E5CBA7] transition-all disabled:opacity-50"
          >
            {loading ? 'Validando Chave...' : 'Abrir Fortaleza'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-20">
      <div className="bg-[#1A0F0A] text-white py-6 px-8 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Trophy className="text-[#D4B996]" size={24} />
            <h1 className="font-black text-xl tracking-tighter uppercase">Painel de Comando Flona</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={async () => { 
                await supabase.auth.signOut()
                localStorage.removeItem('admin_secret'); 
                navigate('/organizacao')
              }}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
            >
              Logoff Seguro
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl"><Users className="text-blue-500" size={24} /></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Atletas</span>
            </div>
            <p className="text-3xl font-black">{stats?.total || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-50 p-3 rounded-2xl"><CheckCircle2 className="text-green-500" size={24} /></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pagos</span>
            </div>
            <p className="text-3xl font-black text-green-600">{stats?.paid || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-50 p-3 rounded-2xl"><Clock className="text-orange-500" size={24} /></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pendentes</span>
            </div>
            <p className="text-3xl font-black text-orange-500">{stats?.pending || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 p-3 rounded-2xl"><DollarSign className="text-emerald-500" size={24} /></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receita</span>
            </div>
            <p className="text-3xl font-black">R$ {stats?.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Shirt Summary */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Shirt className="text-gray-400" size={20} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Resumo de Camisetas</h2>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {['PP', 'P', 'M', 'G', 'GG'].map(size => (
              <div key={size} className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 mb-1">{size}</p>
                <p className="text-xl font-black">{stats?.shirts[size] || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#1A0F0A]/5 transition-all text-sm font-medium"
            />
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download size={16} /> Exportar Planilha
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Atleta</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Documentos</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Tamanho</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((reg) => {
                  const isRevealed = revealedIds.includes(reg.id);
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50/30 transition-all group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-gray-900 leading-none mb-1">{reg.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{reg.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 font-mono tracking-tighter">
                            CPF: {isRevealed ? reg.cpf : maskData(reg.cpf, 'cpf')}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono tracking-tighter">
                            TEL: {isRevealed ? reg.phone : maskData(reg.phone, 'phone')}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] font-black">{reg.shirt_size}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          reg.payment_status === 'paid' 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          {reg.payment_status === 'paid' ? 'Confirmado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => toggleReveal(reg.id)}
                          className="p-2 text-gray-300 hover:text-[#1A0F0A] transition-colors"
                          title={isRevealed ? 'Ocultar dados' : 'Revelar dados'}
                        >
                          {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
