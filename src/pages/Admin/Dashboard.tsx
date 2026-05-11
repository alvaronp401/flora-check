import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Search, 
  Download, 
  RefreshCw, 
  Ticket, 
  Plus, 
  Trash2, 
  Percent, 
  CircleDollarSign,
  AlertCircle,
  Settings,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Registration {
  id: string
  full_name: string
  email: string
  cpf: string
  phone: string
  shirt_size: string
  payment_status: string
  created_at: string
  emergency_phone?: string
  blood_type?: string
  medication?: string
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
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'registrations' | 'coupons' | 'settings'>('registrations')
  const [stats, setStats] = useState<Stats | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showSensitive, setShowSensitive] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Form de Cupom
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: 0, limit: 10 })
  
  // Configurações de Taxas
  const [feeSettings, setFeeSettings] = useState({ name: 'Seguro Aventura', price: 5.00 })
  const [isUpdatingFee, setIsUpdatingFee] = useState(false)
  
  const navigate = useNavigate()
  const adminSecret = localStorage.getItem('admin_secret')

  useEffect(() => {
    if (!adminSecret) {
      navigate('/organizacao')
      return
    }
    fetchData()
  }, [page, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const headers = { 'x-admin-secret': adminSecret || '' }
      
      // Busca unificada de inscritos e stats
      const res = await fetch(`${API_URL}/admin/registrations?page=${page}&limit=10`, { headers })
      const data = await res.json()
      
      setRegistrations(data.registrations)
      setStats(data.stats)
      setTotalPages(data.totalPages)

      // Cupons (Rota com prefixo /coupon)
      const coupRes = await fetch(`${API_URL}/coupon/admin/coupons`, { headers })
      const coupData = await coupRes.json()
      setCoupons(Array.isArray(coupData) ? coupData : [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async (id: string) => {
    const res = await fetch(`${API_URL}/admin/confirm-payment/${id}`, {
      method: 'POST',
      headers: { 'x-admin-secret': adminSecret || '' }
    })
    if (res.ok) fetchData()
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    // 🛡️ MAPEAMENTO SÊNIOR: Frontend -> Backend DTO
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
        'x-admin-secret': adminSecret || '' 
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
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Excluir este cupom?')) return
    const res = await fetch(`${API_URL}/coupon/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-secret': adminSecret || '' }
    })
    if (res.ok) fetchData()
  }

  const handleResetStatus = async (id: string) => {
    if (!confirm('Deseja voltar este atleta para PENDENTE?')) return
    const res = await fetch(`${API_URL}/admin/reset-status/${id}`, {
      method: 'POST',
      headers: { 'x-admin-secret': adminSecret || '' }
    })
    if (res.ok) fetchData()
  }

  const handleSimulateDemand = async (count: number) => {
    const res = await fetch(`${API_URL}/admin/simulate-demand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret || '' },
      body: JSON.stringify({ count })
    })
    if (res.ok) fetchData()
  }

  const handleResetEvent = async () => {
    if (!confirm('ATENCAO: Isso vai apagar TODAS as inscricoes. Tem certeza?')) return
    const res = await fetch(`${API_URL}/admin/reset-event`, {
      method: 'POST',
      headers: { 'x-admin-secret': adminSecret || '' }
    })
    if (res.ok) fetchData()
  }

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingFee(true)
    setErrorMsg('')
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret || '' 
        },
        body: JSON.stringify({
          key: 'insurance_fee',
          value: feeSettings
        })
      })

      if (res.ok) {
        alert('Configurações salvas com sucesso!')
        fetchData()
      } else {
        throw new Error('Falha ao salvar')
      }
    } catch (error: any) {
      setErrorMsg('Erro ao salvar configuração.')
    } finally {
      setIsUpdatingFee(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('admin_secret')
    navigate('/organizacao')
  }

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      // 🕵️‍♂️ Busca Sênior: Pega TODOS os registros pagos, ignorando a paginação do dashboard
      const { data: allPaid, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('payment_status', 'paid')
        .order('full_name', { ascending: true });

      if (error) throw error;
      if (!allPaid || allPaid.length === 0) {
        alert('Nenhum registro pago encontrado para exportar.');
        return;
      }

      const headers = [
        'Nome Completo',
        'CPF',
        'Email',
        'Telefone',
        'Emergencia',
        'Tipo Sanguineo',
        'Medicamento',
        'Tamanho Camiseta',
        'Status',
        'Data Inscricao'
      ];

      const csvContent = [
        headers.join(','),
        ...allPaid.map(r => [
          `"${r.full_name}"`,
          `"${r.cpf}"`,
          `"${r.email}"`,
          `"${r.phone}"`,
          `"${r.emergency_phone || ''}"`,
          `"${r.blood_type || ''}"`,
          `"${r.medication || ''}"`,
          `"${r.shirt_size}"`,
          `"${r.payment_status}"`,
          `"${new Date(r.created_at).toLocaleDateString('pt-BR')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `LISTA_KITS_FLORA_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      alert('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const maskData = (val: string) => {
    if (showSensitive) return val
    return val.replace(/./g, '*')
  }

  const filteredRegistrations = (registrations || []).filter(r => 
    r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cpf?.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex flex-col">
      <header className="bg-[#1A0F0A] text-white shadow-xl sticky top-0 z-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="bg-[#D4B996] p-2 md:p-3 rounded-2xl shrink-0">
                <Users className="text-[#1A0F0A]" size={24} />
              </div>
              <h1 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none">
                Centro de Comando <span className="block md:inline text-[#D4B996]">Flona</span>
              </h1>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              <button onClick={() => setShowSensitive(!showSensitive)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                {showSensitive ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="hidden md:inline">Ver Dados</span>
              </button>
              <button onClick={handleLogout} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                <LogOut size={16} />
                <span className="hidden md:inline">Logoff Seguro</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
        <div className="flex bg-gray-100 p-1.5 rounded-[20px] w-full md:w-fit">
          <button onClick={() => setActiveTab('registrations')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'registrations' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>
            <Users size={16} /> Atletas
          </button>
          <button onClick={() => setActiveTab('coupons')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'coupons' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>
            <Ticket size={16} /> Cupons
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>
            <Settings size={16} /> Configuracoes
          </button>
        </div>

        {activeTab === 'registrations' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Atletas', val: stats?.total || 0, icon: Users, color: 'bg-blue-50 text-blue-500' },
                { label: 'Pagos', val: stats?.paid || 0, icon: CheckCircle, color: 'bg-green-50 text-green-500' },
                { label: 'Pendentes', val: stats?.pending || 0, icon: Clock, color: 'bg-orange-50 text-orange-500' },
                { label: 'Receita', val: `R$ ${stats?.revenue.toFixed(2) || 0}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  <div className={`${s.color} p-3 md:p-4 rounded-2xl md:rounded-3xl`}>
                    <s.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-lg md:text-2xl font-black tracking-tighter leading-tight">{s.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1A0F0A] p-6 rounded-[32px] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#D4B996] p-2 rounded-xl">
                  <RefreshCw className="text-[#1A0F0A]" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#D4B996] uppercase tracking-widest mb-0.5">Laboratorio de Testes</p>
                  <p className="text-xs text-gray-400 font-medium">Simule o comportamento dos lotes e pagamentos</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <input 
                    type="number" 
                    id="customSim"
                    placeholder="QTD" 
                    className="w-16 bg-transparent text-white text-xs font-black px-3 py-3 outline-none"
                  />
                  <button 
                    onClick={() => {
                      const val = (document.getElementById('customSim') as HTMLInputElement).value;
                      if (val) handleSimulateDemand(parseInt(val));
                    }}
                    className="bg-[#D4B996] text-[#1A0F0A] p-3 hover:bg-white transition-all"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                <button onClick={() => handleSimulateDemand(10)} className="flex-1 md:flex-none border border-white/10 text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all">
                  +10
                </button>
                <button onClick={() => handleSimulateDemand(20)} className="flex-1 md:flex-none border border-white/10 text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all">
                  +20
                </button>
                <button onClick={handleResetEvent} className="flex-1 md:flex-none border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all">
                  Zerar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input type="text" placeholder="Buscar atleta..." className="w-full bg-gray-50 border border-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-black transition-all text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button 
                  onClick={handleExportCSV}
                  disabled={registrations.length === 0}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  <Download size={16} /> Exportar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                      <th className="px-8 py-6">Atleta</th>
                      <th className="px-8 py-6">Documentos</th>
                      <th className="px-8 py-6 text-center">Camiseta</th>
                      <th className="px-8 py-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRegistrations.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-[#1A0F0A] uppercase">{r.full_name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{r.email}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-gray-500 tracking-wider font-mono">{maskData(r.cpf)}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black">{r.shirt_size}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          {r.payment_status === 'paid' ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                Pago
                              </span>
                              <button 
                                onClick={() => handleResetStatus(r.id)}
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                title="Voltar para Pendente"
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleConfirmPayment(r.id)}
                              className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto"
                            >
                              <Clock size={12} /> Confirmar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Pagina {page} de {totalPages}
                </p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Proximo
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'coupons' ? (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm sticky top-32">
                <div className="flex items-center gap-3 mb-8 text-[#1A0F0A]">
                  <div className="bg-black text-white p-1 rounded-lg">
                    <Plus size={24} />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tighter">Novo Cupom</h2>
                </div>
                <form onSubmit={handleCreateCoupon} className="space-y-6">
                  {errorMsg && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <AlertCircle size={14} /> {errorMsg}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Codigo</label>
                    <input type="text" placeholder="EX: FLONA20" className="w-full bg-gray-50 border border-gray-50 rounded-2xl p-4 outline-none focus:border-black transition-all text-xs font-black uppercase tracking-widest" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo</label>
                      <select className="w-full bg-gray-50 border border-gray-50 rounded-2xl p-4 outline-none focus:border-black transition-all text-[10px] font-black uppercase" value={newCoupon.type} onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}>
                        <option value="percentage">% Desc</option>
                        <option value="fixed">R$ Fixo</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Valor</label>
                      <input type="number" className="w-full bg-gray-50 border border-gray-50 rounded-2xl p-4 outline-none focus:border-black transition-all text-xs font-black" value={newCoupon.value} onChange={(e) => setNewCoupon({...newCoupon, value: Number(e.target.value)})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Limite de Uso</label>
                    <input type="number" className="w-full bg-gray-50 border border-gray-50 rounded-2xl p-4 outline-none focus:border-black transition-all text-xs font-black" value={newCoupon.limit} onChange={(e) => setNewCoupon({...newCoupon, limit: Number(e.target.value)})} required />
                  </div>
                  <Button type="submit" className="w-full py-6 rounded-2xl bg-[#1A0F0A] text-white">Gerar Cupom</Button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Cupons Ativos</h2>
                  <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[9px] font-black uppercase">{coupons.length} Total</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {coupons.map((c) => (
                    <div key={c.id} className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="bg-gray-100 p-4 rounded-3xl text-black shrink-0">
                          {c.discount_type === 'percentage' ? <Percent size={20} /> : <CircleDollarSign size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tighter">{c.code}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `R$ ${c.discount_value} OFF`}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 w-full md:w-auto">
                        <div className="flex-1 md:flex-none text-left md:text-right">
                          <p className="text-[9px] font-black uppercase text-gray-300 mb-1">Uso Global</p>
                          <div className="flex items-center gap-3">
                            <div className="w-24 md:w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-black transition-all" style={{ width: `${Math.min(100, (c.used_count / c.usage_limit) * 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-black whitespace-nowrap">{c.used_count}/{c.usage_limit}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteCoupon(c.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2 shrink-0">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {coupons.length === 0 && (
                    <div className="p-20 text-center text-gray-300 font-black uppercase tracking-widest text-[10px]">Nenhum cupom gerado.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4 text-[#1A0F0A]">
                <div className="bg-emerald-50 p-3 rounded-2xl">
                  <CircleDollarSign className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Taxas Obrigatorias</h2>
                  <p className="text-xs text-gray-400 font-medium">Configure as taxas cobradas automaticamente no checkout</p>
                </div>
              </div>

              <form onSubmit={handleUpdateFee} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome da Taxa</label>
                    <input 
                      type="text" 
                      value={feeSettings.name}
                      onChange={(e) => setFeeSettings({...feeSettings, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-black transition-all text-xs font-black uppercase tracking-widest"
                      placeholder="Ex: Seguro Aventura"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Valor Unitario (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={feeSettings.price}
                      onChange={(e) => setFeeSettings({...feeSettings, price: Number(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-black transition-all text-xs font-black"
                      placeholder="5.00"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <AlertCircle className="text-blue-500 shrink-0" size={20} />
                  <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase">
                    Esta taxa sera somada ao valor do lote no momento do pagamento. 
                    Certifique-se de que o nome seja claro para o atleta (ex: Seguro Aventura).
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUpdatingFee}
                  className="w-full h-16 bg-[#1A0F0A] text-white hover:bg-gray-800 shadow-xl"
                >
                  {isUpdatingFee ? 'Salvando...' : 'Salvar Alteracoes'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
