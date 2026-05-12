import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Ticket, 
  Settings, 
  Search, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  LogOut,
  CircleDollarSign,
  Eye,
  EyeOff
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const API_URL = import.meta.env.VITE_API_URL

interface Registration {
  id: string
  full_name: string
  email: string
  cpf: string
  phone: string
  shirt_size: string
  payment_status: 'pending' | 'paid'
  created_at: string
  emergency_phone?: string
  blood_type?: string
  medication?: string
  gender?: string
  coupon_code?: string
  reserved_until?: string
}

interface Coupon {
  id: string
  code: string
  discount_type: string
  discount_value: number
  usage_limit: number
  used_count: number
}

interface Stats {
  total: number
  paid: number
  pending: number
  revenue: number
  lots: {
    lot1: { current: number, max: number }
    lot2: { current: number, max: number }
    lot3: { current: number }
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'registrations' | 'coupons' | 'settings'>('registrations')
  const [stats, setStats] = useState<Stats | null>(null)
  const [lotPrices, setLotPrices] = useState({ lot1: 110, lot2: 130, lot3: 150 })
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showSensitive, setShowSensitive] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [adminSecret, setAdminSecret] = useState(localStorage.getItem('admin_secret') || '')
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    limit: 10
  })

  const [feeSettings, setFeeSettings] = useState({
    name: 'SEGURO AVENTURA',
    price: 10
  })
  
  const [isUpdatingFee, setIsUpdatingFee] = useState(false)

  useEffect(() => {
    if (adminSecret) {
      fetchData()
    } else {
      const secret = window.prompt('Digite a Chave Mestra de Administração:')
      if (secret) {
        setAdminSecret(secret)
        localStorage.setItem('admin_secret', secret)
      } else {
        navigate('/')
      }
    }
  }, [adminSecret, page])

  const fetchData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: any = { 
        'x-admin-secret': adminSecret,
        'Authorization': session ? `Bearer ${session.access_token}` : ''
      }
      
      const res = await fetch(`${API_URL}/admin/registrations?page=${page}&limit=100`, { headers })
      if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.')
      if (res.status === 403) throw new Error('Acesso negado! Chave mestra inválida.')
      
      const data = await res.json()
      setRegistrations(data.registrations || [])
      setStats(data.stats)
      setTotalPages(data.totalPages || 1)

      // Busca Cupons
      const coupRes = await fetch(`${API_URL}/coupon/admin/coupons`, { headers })
      const coupData = await coupRes.json()
      if (coupRes.ok) {
        setCoupons(Array.isArray(coupData) ? coupData : [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      setErrorMsg(error.message || '⚠️ Erro ao carregar dados. Verifique a conexão!')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (key: string, value: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ key, value })
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      alert('Configuração salva com sucesso!')
      fetchData()
    } catch (error) {
      alert('Falha ao salvar configuração')
    }
  }

  const handleConfirmPayment = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_URL}/admin/confirm-payment/${id}`, {
        method: 'POST',
        headers: { 
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        }
      })
      if (res.ok) fetchData()
    } catch (error) {
      alert('Erro ao confirmar pagamento')
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const couponData = {
        code: newCoupon.code,
        discount_type: newCoupon.type,
        discount_value: newCoupon.value,
        usage_limit: newCoupon.limit
      }
      const res = await fetch(`${API_URL}/coupon/admin/coupons`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify(couponData)
      })
      if (res.ok) {
        setNewCoupon({ code: '', type: 'percentage', value: 0, limit: 10 })
        fetchData()
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Erro ao criar cupom')
      }
    } catch (error) {
      setErrorMsg('Erro ao criar cupom')
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Excluir este cupom?')) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_URL}/coupon/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        }
      })
      if (res.ok) fetchData()
    } catch (error) {
      alert('Erro ao excluir cupom')
    }
  }

  const handleResetStatus = async (id: string) => {
    if (!confirm('Deseja voltar este atleta para PENDENTE?')) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_URL}/admin/reset-status/${id}`, {
        method: 'POST',
        headers: { 
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        }
      })
      if (res.ok) fetchData()
    } catch (error) {
      alert('Erro ao resetar status')
    }
  }

  const handleSimulateDemand = async (count: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_URL}/admin/simulate-demand`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ count })
      })
      if (res.ok) fetchData()
    } catch (error) {
      alert('Erro ao simular demanda')
    }
  }

  const handleResetEvent = async () => {
    if (!confirm('ATENCAO: Isso vai apagar TODAS as inscricoes. Tem certeza?')) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_URL}/admin/reset-event`, {
        method: 'POST',
        headers: { 
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        }
      })
      if (res.ok) fetchData()
    } catch (error) {
      alert('Erro ao resetar evento')
    }
  }

  const handleExportCSV = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: any = { 
        'x-admin-secret': adminSecret,
        'Authorization': session ? `Bearer ${session.access_token}` : ''
      }
      
      // Busca TODOS os registros sem limite de página para o CSV
      const res = await fetch(`${API_URL}/admin/registrations?page=1&limit=1000`, { headers })
      const data = await res.json()
      const allRegs: Registration[] = data.registrations || []

      if (allRegs.length === 0) {
        alert('Nenhuma inscrição para exportar.')
        return
      }

      // 📝 Cabeçalho do CSV
      const csvHeaders = ['Nome', 'Email', 'CPF', 'Telefone', 'Gênero', 'Camiseta', 'Tipo Sanguíneo', 'Medicamentos', 'Emergência', 'Status']
      const csvRows = allRegs.map(r => [
        `"${r.full_name}"`,
        `"${r.email}"`,
        `"${r.cpf}"`,
        `"${r.phone}"`,
        `"${r.gender || '-'}"`,
        `"${r.shirt_size}"`,
        `"${r.blood_type || '-'}"`,
        `"${r.medication || 'Nenhum'}"`,
        `"${r.emergency_phone || '-'}"`,
        `"${r.payment_status.toUpperCase()}"`
      ])

      const csvContent = [csvHeaders, ...csvRows].map(e => e.join(';')).join('\n')
      
      // 💾 Download do Arquivo com BOM (Byte Order Mark) para Excel reconhecer UTF-8
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `inscritos_flona_2026_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      alert('Erro ao exportar CSV')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('admin_secret')
    navigate('/')
  }

  const maskData = (val: string) => showSensitive ? val : '********'

  const filteredRegistrations = registrations.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cpf.includes(searchTerm)
  )

  const handleUpdateFee = async () => {
    setIsUpdatingFee(true)
    await handleSaveSettings('fees', [{id: 'insurance', ...feeSettings}])
    setIsUpdatingFee(false)
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A0F0A] font-sans selection:bg-black selection:text-white">
      {/* HEADER PREMIUM */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white p-2 rounded-xl">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter leading-none">Centro de Comando</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Flora Checkout v2.0</p>
            </div>
          </div>

          <nav className="hidden md:flex bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'registrations', label: 'Atletas', icon: Users },
              { id: 'coupons', label: 'Cupons', icon: Ticket },
              { id: 'settings', label: 'Config', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSensitive(!showSensitive)}
              className="p-3 text-gray-400 hover:text-black transition-colors"
            >
              {showSensitive ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {errorMsg && (
          <div className="mb-8 bg-red-50 text-red-500 p-6 rounded-[32px] border border-red-100 flex items-center gap-4 text-xs font-black uppercase tracking-widest">
            <Clock size={20} /> {errorMsg}
          </div>
        )}

        {activeTab === 'registrations' ? (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Inscritos', val: stats?.total || 0, icon: Users, color: 'bg-blue-500' },
                { label: 'Pagos', val: stats?.paid || 0, icon: CheckCircle2, color: 'bg-emerald-500' },
                { label: 'Pendentes', val: stats?.pending || 0, icon: Clock, color: 'bg-orange-500' },
                { label: 'Receita', val: `R$ ${stats?.revenue || 0}`, icon: CircleDollarSign, color: 'bg-purple-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-6`}>
                    <s.icon size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                  <h3 className="text-3xl font-black tracking-tighter">{s.val}</h3>
                </div>
              ))}
            </div>
            
            {/* LOT STATUS CARDS - 📊 VISÃO REAL TIME POR LOTE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">1º Lote (Ativo)</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black">{stats?.lots.lot1.current} / {stats?.lots.lot1.max}</h3>
                  <div className="text-[10px] font-bold text-gray-300">Limite: 15</div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((stats?.lots.lot1.current || 0) / (stats?.lots.lot1.max || 15)) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">2º Lote</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black">{stats?.lots.lot2.current} / {stats?.lots.lot2.max}</h3>
                  <div className="text-[10px] font-bold text-gray-300">Limite: 15</div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((stats?.lots.lot2.current || 0) / (stats?.lots.lot2.max || 15)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">3º Lote</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black">{stats?.lots.lot3.current} / 20</h3>
                  <div className="text-[10px] font-bold text-gray-300">Final</div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((stats?.lots.lot3.current || 0) / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* LABORATÓRIO DE TESTES */}
            <div className="bg-black text-white p-8 md:p-10 rounded-[40px] mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <RefreshCw size={24} className="text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Laboratório de Testes</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Simule o comportamento dos lotes</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => handleSimulateDemand(10)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">+10 Atletas</button>
                <button onClick={() => handleSimulateDemand(20)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">+20 Atletas</button>
                <button onClick={handleResetEvent} className="px-6 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Zerar Evento</button>
              </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-black" size={32} />
                </div>
              )}

              <div className="p-4 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="BUSCAR NOME, EMAIL OU CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 outline-none focus:ring-2 ring-black/5 text-[10px] font-black uppercase tracking-widest"
                  />
                </div>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-2 px-6 md:px-8 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full md:w-auto"
                >
                  <Download size={16} /> Exportar CSV
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <div className="min-w-[800px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Atleta</th>
                        <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Saúde / Kit</th>
                        <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Documento</th>
                        <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Contato</th>
                        <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredRegistrations.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-6 md:px-8 py-6">
                            <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-tight">{r.full_name}</span>
                              {r.coupon_code && (
                                <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter">🎟️ {r.coupon_code}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">{maskData(r.email)}</span>
                          </div>
                          </td>
                          <td className="px-6 md:px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter">Sangue: {r.blood_type || '-'}</span>
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter">Kit: {r.shirt_size}</span>
                              </div>
                              <span className="text-[9px] text-gray-500 font-bold uppercase truncate max-w-[150px] md:max-w-[200px]">SOS: {maskData(r.emergency_phone || '-')}</span>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-6">
                            <span className="text-[10px] font-black tracking-widest text-gray-500">{maskData(r.cpf)}</span>
                          </td>
                          <td className="px-6 md:px-8 py-6">
                            <span className="text-[10px] font-bold text-gray-500">{maskData(r.phone)}</span>
                          </td>
                          <td className="px-6 md:px-8 py-6 text-center">
                            {r.payment_status === 'paid' ? (
                              <div className="flex items-center justify-center gap-2">
                                <span className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Pago</span>
                                <button onClick={() => handleResetStatus(r.id)} className="p-2 text-gray-300 hover:text-blue-500"><RefreshCw size={14} /></button>
                              </div>
                            ) : (
                              (r.reserved_until && new Date(r.reserved_until) < new Date()) ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">Expirado</span>
                                  <button onClick={() => handleConfirmPayment(r.id)} className="text-[8px] text-gray-400 hover:text-black underline font-bold uppercase">Forçar Confirmação</button>
                                </div>
                              ) : (
                                <button onClick={() => handleConfirmPayment(r.id)} className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Confirmar</button>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAGINAÇÃO */}
              <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Página {page} de {totalPages}</span>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="secondary" className="flex-1 md:flex-none">Anterior</Button>
                  <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex-1 md:flex-none">Próximo</Button>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'coupons' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* NOVO CUPOM */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm h-fit">
              <h2 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Plus size={20} /> Novo Cupom
              </h2>
              <form onSubmit={handleCreateCoupon} className="space-y-6">
                <Input 
                  label="Código" 
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  placeholder="EX: FLONA20"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tipo</label>
                    <select 
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase outline-none focus:ring-2 ring-black/5"
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}
                    >
                      <option value="percentage">% Desc</option>
                      <option value="fixed">R$ Fixo</option>
                    </select>
                  </div>
                  <Input 
                    label="Valor" 
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({...newCoupon, value: Number(e.target.value)})}
                    required
                  />
                </div>
                <Input 
                  label="Limite de Uso" 
                  type="number"
                  value={newCoupon.limit}
                  onChange={(e) => setNewCoupon({...newCoupon, limit: Number(e.target.value)})}
                  required
                />
                <Button type="submit" className="w-full py-6">Gerar Cupom</Button>
              </form>
            </div>

            {/* LISTA DE CUPONS */}
            <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Cupons Ativos</h2>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-[9px] font-black text-gray-400">{coupons.length} Total</span>
              </div>
              <div className="divide-y divide-gray-50">
                {coupons.map((c) => (
                  <div key={c.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="bg-emerald-50 text-emerald-600 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest">
                        {c.code}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Uso: {c.used_count} / {c.usage_limit}</p>
                        <p className="text-xs font-bold mt-0.5">{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `R$ ${c.discount_value} OFF`}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCoupon(c.id)} className="text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl"><CircleDollarSign className="text-emerald-500" /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Taxas Obrigatórias</h2>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <Input 
                  label="Nome da Taxa" 
                  value={feeSettings.name} 
                  onChange={(e) => setFeeSettings({...feeSettings, name: e.target.value})} 
                />
                <Input 
                  label="Valor Unitário (R$)" 
                  type="number" 
                  value={feeSettings.price} 
                  onChange={(e) => setFeeSettings({...feeSettings, price: Number(e.target.value)})} 
                />
              </div>
              <Button onClick={handleUpdateFee} disabled={isUpdatingFee} className="w-full py-6">
                {isUpdatingFee ? 'Salvando...' : 'Salvar Taxas'}
              </Button>
            </div>

            <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="bg-orange-50 p-3 rounded-2xl"><Ticket className="text-orange-500" /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Preços dos Lotes</h2>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { id: 'lot1', label: '1º Lote', price: lotPrices.lot1 },
                  { id: 'lot2', label: '2º Lote', price: lotPrices.lot2 },
                  { id: 'lot3', label: '3º Lote', price: lotPrices.lot3 },
                ].map((l) => (
                  <div key={l.id} className="space-y-2">
                    <Input 
                      label={l.label}
                      type="number" 
                      value={l.price} 
                      onChange={(e) => setLotPrices({...lotPrices, [l.id]: Number(e.target.value)})}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={() => handleSaveSettings('lot_prices', lotPrices)} className="w-full py-6">Salvar Preços</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
