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
  EyeOff,
  X,
  Calendar
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

/**
 * Remove acentos e diacríticos de uma string para evitar problemas de codificação
 * em leitores de CSV legados.
 * Exemplo: "João" -> "Joao", "Mônica" -> "Monica", "Débora" -> "Debora"
 */
const removeAccents = (str: string): string => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normaliza o nome do atleta para comparar se é a mesma pessoa
 * ignorando acentos, espaços extras e maiúsculas/minúsculas.
 */
const normalizeName = (name: string): string => {
  if (!name) return ''
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').trim()
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'registrations' | 'coupons' | 'settings' | 'events'>('registrations')
  const [stats, setStats] = useState<Stats | null>(null)
  const [lotPrices, setLotPrices] = useState({ lot1: 110, lot2: 130, lot3: 150 })
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showSensitive, setShowSensitive] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [adminSecret, setAdminSecret] = useState(localStorage.getItem('admin_secret') || '')
  
  // Múltiplos Eventos
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState('e0123456-789a-bcde-f012-3456789abcde')

  // Estados para Gerenciamento de Eventos (Sênior)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false)
  const [eventError, setEventError] = useState('')
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    slug: '',
    description: '',
    date: '',
    location: '',
    image_url: '',
    capacity: 50,
    lot1_price: 110,
    lot2_price: 130,
    lot3_price: 150,
    lot1_threshold: 15,
    lot2_threshold: 30,
    fee_name: 'Seguro Aventura',
    fee_price: 10
  })

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
  
  // ➕ Estados do Modal de Cadastro Manual (Sênior)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)
  const [manualError, setManualError] = useState('')
  const [newAthlete, setNewAthlete] = useState({
    full_name: '',
    cpf: '',
    email: '',
    phone: '',
    emergency_phone: '',
    blood_type: 'A+',
    medication: '',
    gender: 'Masculino',
    shirt_size: 'M',
    payment_status: 'paid' as 'paid' | 'pending'
  })

  useEffect(() => {
    if (adminSecret) {
      // Busca a lista de eventos
      const fetchEvents = async () => {
        try {
          const res = await fetch(`${API_URL}/events`)
          if (res.ok) {
            const data = await res.json()
            setEvents(data || [])
          }
        } catch (err) {
          console.error('Erro ao buscar eventos para o painel:', err)
        }
      }
      fetchEvents()
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
  }, [adminSecret, page, selectedEventId])

  const fetchData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: any = { 
        'x-admin-secret': adminSecret,
        'Authorization': session ? `Bearer ${session.access_token}` : ''
      }
      
      const res = await fetch(`${API_URL}/admin/registrations?page=${page}&limit=100&eventId=${selectedEventId}`, { headers })
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

  const handleCreateAthlete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingManual(true)
    setManualError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_URL}/admin/registrations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ ...newAthlete, event_id: selectedEventId })
      })
      const data = await res.json()
      if (res.ok) {
        setIsAddModalOpen(false)
        setNewAthlete({
          full_name: '',
          cpf: '',
          email: '',
          phone: '',
          emergency_phone: '',
          blood_type: 'A+',
          medication: '',
          gender: 'Masculino',
          shirt_size: 'M',
          payment_status: 'paid'
        })
        fetchData()
      } else {
        setManualError(data.error || 'Erro ao cadastrar atleta')
      }
    } catch (error: any) {
      setManualError(error.message || 'Erro ao conectar ao servidor')
    } finally {
      setIsSubmittingManual(false)
    }
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingEvent(true)
    setEventError('')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const url = editingEvent 
        ? `${API_URL}/admin/events/${editingEvent.id}` 
        : `${API_URL}/admin/events`
      const method = editingEvent ? 'PUT' : 'POST'

      const payload = {
        title: eventForm.title,
        slug: eventForm.slug || eventForm.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
        description: eventForm.description,
        date: eventForm.date,
        location: eventForm.location,
        image_url: eventForm.image_url,
        capacity: Number(eventForm.capacity),
        lot_prices: {
          lot1: Number(eventForm.lot1_price),
          lot2: Number(eventForm.lot2_price),
          lot3: Number(eventForm.lot3_price)
        },
        lot_thresholds: {
          lot1: Number(eventForm.lot1_threshold),
          lot2: Number(eventForm.lot2_threshold)
        },
        fees: [{
          id: 'insurance',
          name: eventForm.fee_name,
          price: Number(eventForm.fee_price)
        }]
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok) {
        setIsEventModalOpen(false)
        setEditingEvent(null)
        setEventForm({
          title: '',
          slug: '',
          description: '',
          date: '',
          location: '',
          image_url: '',
          capacity: 50,
          lot1_price: 110,
          lot2_price: 130,
          lot3_price: 150,
          lot1_threshold: 15,
          lot2_threshold: 30,
          fee_name: 'Seguro Aventura',
          fee_price: 10
        })
        
        // Recarrega a lista de eventos
        const evRes = await fetch(`${API_URL}/events`)
        if (evRes.ok) {
          const evData = await evRes.json()
          setEvents(evData || [])
        }
      } else {
        setEventError(data.error || 'Erro ao salvar evento')
      }
    } catch (err: any) {
      setEventError(err.message || 'Erro ao conectar ao servidor')
    } finally {
      setIsSubmittingEvent(false)
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
    if (!confirm('ATENCAO: Isso vai apagar TODAS as inscricoes do evento selecionado. Tem certeza?')) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_URL}/admin/reset-event`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ eventId: selectedEventId })
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
      
      // Busca TODOS os registros sem limite de página para o CSV filtrando por eventId
      const res = await fetch(`${API_URL}/admin/registrations?page=1&limit=1000&eventId=${selectedEventId}`, { headers })
      const data = await res.json()
      const allRegs: Registration[] = data.registrations || []

      if (allRegs.length === 0) {
        alert('Nenhuma inscrição para exportar.')
        return
      }

      // 🛡️ Lógica de Deduplicação para o CSV: Uma linha por CPF + Nome (Priorizando o PAGO)
      const dataToExport = allRegs.reduce((acc: Registration[], current: Registration) => {
        const existing = acc.find(item => 
          item.cpf === current.cpf && 
          normalizeName(item.full_name) === normalizeName(current.full_name)
        );
        if (!existing) {
          acc.push(current);
        } else if (current.payment_status === 'paid' && existing.payment_status !== 'paid') {
          const index = acc.indexOf(existing);
          acc[index] = current;
        }
        return acc;
      }, []).filter((reg: Registration) => {
        const matchesSearch = 
          reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.cpf.includes(searchTerm)
        
        const matchesStatus = 
          filterStatus === 'all' || 
          reg.payment_status === filterStatus
          
        return matchesSearch && matchesStatus
      })

      const csvHeaders = ['Nome', 'Email', 'CPF', 'Telefone', 'Gênero', 'Camiseta', 'Tipo Sanguíneo', 'Medicamentos', 'Emergência', 'Status']
      const csvRows = dataToExport.map((r: Registration) => [
        `"${removeAccents(r.full_name)}"`,
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

      const csvContent = 'sep=;\n' + [csvHeaders, ...csvRows].map(e => e.join(';')).join('\n')
      
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

  const handleUpdateFee = async () => {
    setIsUpdatingFee(true)
    const feeSettings = { price: Number((document.getElementById('fee-price') as HTMLInputElement)?.value || 10) }
    await handleSaveSettings('fees', [{id: 'insurance', name: 'Seguro Aventura', ...feeSettings}])
    setIsUpdatingFee(false)
  }

  const filteredRegistrations = registrations
    .reduce((acc, current) => {
      // 🛡️ Lógica de Deduplicação: Se o CPF e Nome já existem na lista...
      const existing = acc.find(item => 
        item.cpf === current.cpf && 
        normalizeName(item.full_name) === normalizeName(current.full_name)
      );
      if (!existing) {
        acc.push(current);
      } else if (current.payment_status === 'paid' && existing.payment_status !== 'paid') {
        // Se a nova inscrição for PAGA, ela substitui a PENDENTE antiga
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
      return acc;
    }, [] as Registration[])
    .filter(reg => {
      const matchesSearch = 
        reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.cpf.includes(searchTerm)
      
      const matchesStatus = 
        filterStatus === 'all' || 
        reg.payment_status === filterStatus
        
      return matchesSearch && matchesStatus
    })

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
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Trail & Run Club Checkout v2.0</p>
            </div>
          </div>

          {/* Seletor de Eventos Sênior 🌟 */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-1.5 rounded-2xl">
            <span className="text-[9px] font-black uppercase text-gray-400 px-3 tracking-widest">Evento:</span>
            <select 
              value={selectedEventId} 
              onChange={(e) => {
                setSelectedEventId(e.target.value)
                setPage(1)
              }}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-none pr-4 cursor-pointer"
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>

          <nav className="hidden md:flex bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'registrations', label: 'Atletas', icon: Users },
              { id: 'events', label: 'Eventos', icon: Calendar },
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

            {/* FILTROS E BUSCA */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button 
                  onClick={() => setFilterStatus('all')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'all' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                >Todos</button>
                <button 
                  onClick={() => setFilterStatus('paid')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'paid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500'}`}
                >Pagos</button>
                <button 
                  onClick={() => setFilterStatus('pending')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'pending' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500'}`}
                >Pendentes</button>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="BUSCAR ATLETA (NOME, CPF OU EMAIL)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
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
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-4 bg-black hover:bg-black/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto shadow-sm"
                  >
                    <Plus size={16} /> Adicionar Atleta
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto"
                  >
                    <Download size={16} /> Exportar CSV
                  </button>
                </div>
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
        ) : activeTab === 'events' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Gerenciar Eventos</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Crie e configure seus eventos esportivos</p>
              </div>
              <button 
                onClick={() => {
                  setEditingEvent(null)
                  setEventForm({
                    title: '',
                    slug: '',
                    description: '',
                    date: '',
                    location: '',
                    image_url: '',
                    capacity: 50,
                    lot1_price: 110,
                    lot2_price: 130,
                    lot3_price: 150,
                    lot1_threshold: 15,
                    lot2_threshold: 30,
                    fee_name: 'Seguro Aventura',
                    fee_price: 10
                  })
                  setIsEventModalOpen(true)
                }}
                className="flex items-center gap-2 px-6 py-4 bg-black hover:bg-black/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                <Plus size={16} /> Criar Evento
              </button>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Título / Slug</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Data e Local</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Capacidade</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Lotes</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {events.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-tight">{e.title}</span>
                          <span className="text-[10px] text-gray-400 font-medium">/{e.slug}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-800">{new Date(e.date).toLocaleDateString('pt-BR')}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{e.location}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black">{e.capacity} atletas</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[8px] font-black">1º: R$ {e.lot_prices?.lot1}</span>
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black">2º: R$ {e.lot_prices?.lot2}</span>
                          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[8px] font-black">3º: R$ {e.lot_prices?.lot3}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button 
                          onClick={() => {
                            setEditingEvent(e)
                            setEventForm({
                              title: e.title,
                              slug: e.slug,
                              description: e.description || '',
                              date: e.date ? new Date(e.date).toISOString().slice(0, 16) : '',
                              location: e.location || '',
                              image_url: e.image_url || '',
                              capacity: e.capacity || 50,
                              lot1_price: e.lot_prices?.lot1 || 110,
                              lot2_price: e.lot_prices?.lot2 || 130,
                              lot3_price: e.lot_prices?.lot3 || 150,
                              lot1_threshold: e.lot_thresholds?.lot1 || 15,
                              lot2_threshold: e.lot_thresholds?.lot2 || 30,
                              fee_name: e.fees?.[0]?.name || 'Seguro Aventura',
                              fee_price: e.fees?.[0]?.price || 10
                            })
                            setIsEventModalOpen(true)
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

      {/* MODAL DE CADASTRO MANUAL (SÊNIOR UX) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[40px] border border-gray-100 shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Novo Cadastro Manual</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Insira os dados do atleta abaixo</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-3 text-gray-400 hover:text-black rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {manualError && (
              <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 text-xs font-black uppercase tracking-widest">
                {manualError}
              </div>
            )}

            <form onSubmit={handleCreateAthlete} className="space-y-6">
              <div className="space-y-4">
                <Input 
                  label="Nome Completo" 
                  placeholder="Como no documento" 
                  value={newAthlete.full_name} 
                  onChange={(e) => setNewAthlete({...newAthlete, full_name: e.target.value})} 
                  required 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="CPF" 
                    placeholder="000.000.000-00" 
                    value={newAthlete.cpf} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
                      setNewAthlete({...newAthlete, cpf: val});
                    }} 
                    required 
                  />
                  <Input 
                    label="Celular" 
                    placeholder="(00) 00000-0000" 
                    value={newAthlete.phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
                      setNewAthlete({...newAthlete, phone: val});
                    }} 
                    required 
                  />
                </div>

                <Input 
                  label="E-mail" 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  value={newAthlete.email} 
                  onChange={(e) => setNewAthlete({...newAthlete, email: e.target.value})} 
                  required 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Número de Emergência" 
                    placeholder="(00) 00000-0000" 
                    value={newAthlete.emergency_phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
                      setNewAthlete({...newAthlete, emergency_phone: val});
                    }} 
                    required 
                  />
                  <Input 
                    label="Medicamento Controlado" 
                    placeholder="Se sim, qual?" 
                    value={newAthlete.medication} 
                    onChange={(e) => setNewAthlete({...newAthlete, medication: e.target.value})} 
                  />
                </div>

                {/* Tipo Sanguíneo */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tipo Sanguíneo</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewAthlete({...newAthlete, blood_type: t})}
                        className={`flex items-center justify-center h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${newAthlete.blood_type === t ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gênero e Camiseta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Gênero</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Masculino', 'Feminino'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setNewAthlete({...newAthlete, gender: g})}
                          className={`flex items-center justify-center h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${newAthlete.gender === g ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tamanho da Camiseta</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {['PP', 'P', 'M', 'G', 'GG'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewAthlete({...newAthlete, shirt_size: s})}
                          className={`flex items-center justify-center h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${newAthlete.shirt_size === s ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status de Pagamento */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status da Inscrição</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAthlete({...newAthlete, payment_status: 'paid'})}
                      className={`flex items-center justify-center h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${newAthlete.payment_status === 'paid' ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                    >
                      Confirmada (Paga)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAthlete({...newAthlete, payment_status: 'pending'})}
                      className={`flex items-center justify-center h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${newAthlete.payment_status === 'pending' ? 'border-orange-500 bg-orange-500 text-white shadow-sm' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                    >
                      Pendente (Reserva 15m)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="flex-1 py-4"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingManual} 
                  className="flex-1 py-4 bg-black text-white hover:bg-black/90"
                >
                  {isSubmittingManual ? 'Cadastrando...' : 'Confirmar Cadastro'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL DE GERENCIAMENTO DE EVENTO (SÊNIOR UX) */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[40px] border border-gray-100 shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configure as regras de negócio do evento</p>
              </div>
              <button 
                onClick={() => setIsEventModalOpen(false)}
                className="p-3 text-gray-400 hover:text-black rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {eventError && (
              <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 text-xs font-black uppercase tracking-widest">
                {eventError}
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Título do Evento" 
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Ex: Trail Run Flona 2026"
                  required 
                />
                <Input 
                  label="Slug da URL" 
                  value={eventForm.slug}
                  onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })}
                  placeholder="Ex: trail-run-flona-2026"
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Descrição</label>
                <textarea 
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Descrição do evento que aparece no card e na Landing Page..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-medium outline-none focus:ring-2 ring-black/5 min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 font-bold">Data e Hora</label>
                  <input 
                    type="datetime-local" 
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 ring-black/5"
                    required
                  />
                </div>
                <Input 
                  label="Localização" 
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Ex: FLONA - Brasília"
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="URL da Imagem Banner" 
                  value={eventForm.image_url}
                  onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                  placeholder="Ex: https://dominio.com/banner.png"
                />
                <Input 
                  label="Capacidade Total" 
                  type="number"
                  value={eventForm.capacity}
                  onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                  placeholder="Ex: 50"
                  required 
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Configurações de Lotes</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input 
                    label="Preço Lote 1" 
                    type="number"
                    value={eventForm.lot1_price}
                    onChange={(e) => setEventForm({ ...eventForm, lot1_price: Number(e.target.value) })}
                    required 
                  />
                  <Input 
                    label="Preço Lote 2" 
                    type="number"
                    value={eventForm.lot2_price}
                    onChange={(e) => setEventForm({ ...eventForm, lot2_price: Number(e.target.value) })}
                    required 
                  />
                  <Input 
                    label="Preço Lote 3" 
                    type="number"
                    value={eventForm.lot3_price}
                    onChange={(e) => setEventForm({ ...eventForm, lot3_price: Number(e.target.value) })}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <Input 
                    label="Virada do Lote 1 (Limite de vagas)" 
                    type="number"
                    value={eventForm.lot1_threshold}
                    onChange={(e) => setEventForm({ ...eventForm, lot1_threshold: Number(e.target.value) })}
                    required 
                  />
                  <Input 
                    label="Virada do Lote 2 (Limite de vagas)" 
                    type="number"
                    value={eventForm.lot2_threshold}
                    onChange={(e) => setEventForm({ ...eventForm, lot2_threshold: Number(e.target.value) })}
                    required 
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Taxas Obrigatórias</h3>
                <div className="grid grid-cols-2 gap-6">
                  <Input 
                    label="Nome da Taxa" 
                    value={eventForm.fee_name}
                    onChange={(e) => setEventForm({ ...eventForm, fee_name: e.target.value })}
                    placeholder="Ex: Seguro Aventura"
                    required 
                  />
                  <Input 
                    label="Preço da Taxa (R$)" 
                    type="number"
                    value={eventForm.fee_price}
                    onChange={(e) => setEventForm({ ...eventForm, fee_price: Number(e.target.value) })}
                    required 
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsEventModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingEvent}
                  className="bg-black text-white hover:bg-black/90 px-6 py-3"
                >
                  {isSubmittingEvent ? 'Salvando...' : 'Salvar Evento'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
