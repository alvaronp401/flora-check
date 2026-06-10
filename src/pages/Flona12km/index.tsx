import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Star,
  Mountain,
  Droplets,
  Shield,
  Clock,
  Users,
  AlertCircle,
  MapPin,
  Check,
  Heart,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { supabase } from '../../lib/supabase'
import { API_URL } from '../../config/api'

// Fotos reais do Trail & Run Club
import aleImg     from '../../assets/colaborador3.png'   // Alessandra na trilha
import waImg1     from '../../assets/trilha_flona_1.jpeg'
import waImg2     from '../../assets/trilha_flona_2.jpeg'
import waImg3     from '../../assets/trilha_flona_3.jpeg'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTE DO EVENTO
// Configure VITE_FLONA_12KM_EVENT_ID com o UUID retornado pelo script do Supabase.
// ─────────────────────────────────────────────────────────────────────────────
const FLONA_12KM_EVENT_ID = import.meta.env.VITE_FLONA_12KM_EVENT_ID || ''

// ─────────────────────────────────────────────────────────────────────────────
// DADOS ESTÁTICOS
// ─────────────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Thainara',
    text: 'Quero agradecer a todos os envolvidos na organização e participação. Eu A D O R E I! A dedicação e o empenho de cada um fizeram toda a diferença. Já estou ansiosa pela próxima trilha. 🌿',
  },
  {
    name: 'Katia Maia',
    text: 'Fantástica vivência com todos, nessa maravilhosa trilha. Nossa primeira trilha! Eu e meu esposo amamos!!! Esse grupo é excelente de uma grande organização e carinho. Gratidão por tudo.',
  },
  {
    name: 'Gizele Costa',
    text: 'Vocês foram fantásticos, evento maravilhoso.... precisamos de um outro evento desse com urgência 🥰',
  },
  {
    name: 'Maria Feijoada',
    text: 'Quero agradecer ao Jonathan e aos outros integrantes da organização da trilha. Foi surreal. Amei, que venha a próxima.',
  },
  {
    name: 'Sabryna Vieira',
    text: 'A trilha foi perfeita! Foi minha primeira, minha mãe que me levou! Amei muito, com certeza quero fazer mais. Foi tudo muito organizado, todo mundo muito respeitoso e responsável, obrigada pela manhã maravilhosa ❤️',
  },
  {
    name: 'Erly Carvalho',
    text: 'Perfeito!!! Muito bem organizado... Descontração, alma lavada pela paisagem. Maravilhoso JONATHAS e equipe. Parabéns e obrigada pela oportunidade de ter estado com vocês.',
  },
  {
    name: 'Mônica',
    text: 'Amei a nossa manhã! Só elogios! Estava tudo muito organizado e acolhedor. Adorei meu kit, tudo delicado e preparado com carinho.',
  },
  {
    name: 'Joelma Cunha',
    text: 'Eu amei tudo, nada a reclamar, só agradecer por essa experiência maravilhosa e com pessoas muito legais. Gratidão e até a próxima.',
  },
  {
    name: 'Jennifer Armiliato',
    text: 'Tudo incrível! 🤩 Parabénsss pelo evento time Trail Run Club. Já queremos o próximo.',
  },
  {
    name: 'Morgana Costa',
    text: 'Foi uma manhã maravilhosa! Amei conhecer a Flona! Parabéns pela organização.',
  },
  {
    name: 'Patricia Gomes',
    text: 'Foi maravilhoso! Obrigado por uma manhã maravilhosa 🥰💪❤️',
  },
  {
    name: 'Benvinda Teixeira',
    text: 'Valei muito participar da trilha! Amei 🙏🌹🥰',
  }
]

const GALLERY = [waImg1, waImg2, waImg3]

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA DE VALIDAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
const schema = yup.object({
  fullName:      yup.string().required('Nome completo é obrigatório'),
  cpf:           yup.string().required('CPF é obrigatório').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato: 000.000.000-00'),
  email:         yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  phone:         yup.string().required('WhatsApp é obrigatório').matches(/^\(\d{2}\) \d{5}-\d{4}$/, '(00) 00000-0000'),
  emergencyPhone:yup.string().required('Emergência é obrigatório').matches(/^\(\d{2}\) \d{5}-\d{4}$/, '(00) 00000-0000'),
  bloodType:     yup.string().required('Selecione o tipo sanguíneo'),
  gender:        yup.string().required('Selecione o gênero'),
  shirtSize:     yup.string().required('Selecione o tamanho da camiseta'),
  medication:    yup.string().optional(),
  terms:         yup.boolean().oneOf([true], 'Aceite os termos para continuar'),
}).required()

type IForm = yup.InferType<typeof schema>

// ─────────────────────────────────────────────────────────────────────────────
// MÁSCARAS
// ─────────────────────────────────────────────────────────────────────────────
const maskCPF = (v: string) =>
  v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})/,'$1-$2').replace(/(-\d{2})\d+?$/,'$1')

const maskPhone = (v: string) =>
  v.replace(/\D/g,'').replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').replace(/(-\d{4})\d+?$/,'$1')

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const Flona12km: React.FC = () => {
  const navigate = useNavigate()

  const [timeLeft,       setTimeLeft]       = useState(600)
  const [submitError,    setSubmitError]    = useState('')
  const [showForm,       setShowForm]       = useState(false)
  const [galleryIndex,   setGalleryIndex]   = useState(0)
  const [isLoadingStatus,setIsLoadingStatus]= useState(true)
  const [eventStatus, setEventStatus] = useState<{
    available: number; occupied: number
    currentLot: { name: string; price: number }
    is_sold_out: boolean; capacity: number
  } | null>(null)

  // ── Busca status de vagas ──
  useEffect(() => {
    const isReal = Boolean(FLONA_12KM_EVENT_ID)
    if (!isReal) {
      setEventStatus({ available: 20, occupied: 0, currentLot: { name: 'PRIMEIRO', price: 30 }, is_sold_out: false, capacity: 20 })
      setIsLoadingStatus(false)
      return
    }
    fetch(`${API_URL}/event-status?eventId=${FLONA_12KM_EVENT_ID}`)
      .then(r => r.json()).then(d => { setEventStatus(d); setIsLoadingStatus(false) })
      .catch(() => { setEventStatus({ available: 20, occupied: 0, currentLot: { name: 'PRIMEIRO', price: 30 }, is_sold_out: false, capacity: 20 }); setIsLoadingStatus(false) })
  }, [])

  // ── Auto-avanço da galeria ──
  useEffect(() => {
    const t = setInterval(() => setGalleryIndex(i => (i + 1) % GALLERY.length), 4000)
    return () => clearInterval(t)
  }, [])

  // ── Timer de urgência (só quando formulário aberto) ──
  useEffect(() => {
    if (!showForm) return
    const now = Date.now()
    const saved = localStorage.getItem('flona12km_expiry')
    let expiry = saved && parseInt(saved) > now ? parseInt(saved) : now + 600_000
    if (!saved || parseInt(saved) <= now) localStorage.setItem('flona12km_expiry', String(expiry))

    const iv = setInterval(() => {
      const rem = Math.max(0, Math.floor((expiry - Date.now()) / 1000))
      setTimeLeft(rem)
      if (rem <= 0) { localStorage.removeItem('flona12km_expiry'); navigate('/') }
    }, 1000)
    return () => clearInterval(iv)
  }, [showForm, navigate])

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<IForm>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
  })

  const onSubmit = async (data: IForm) => {
    setSubmitError('')
    if (!eventStatus || eventStatus.available <= 0) { setSubmitError('Todas as vagas foram preenchidas.'); return }
    if (!FLONA_12KM_EVENT_ID) { setSubmitError('O evento está sendo configurado. Tente em instantes.'); return }
    try {
      const { data: reg, error: dbErr } = await supabase.from('registrations').insert([{
        full_name: data.fullName, cpf: data.cpf, email: data.email,
        phone: data.phone, emergency_phone: data.emergencyPhone,
        blood_type: data.bloodType, gender: data.gender, shirt_size: data.shirtSize,
        medication: data.medication || '', payment_status: 'pending', event_id: FLONA_12KM_EVENT_ID,
        reserved_until: new Date(Date.now() + 15 * 60_000).toISOString(),
      }]).select().single()
      if (dbErr) throw new Error('Não conseguimos reservar sua vaga. Tente novamente.')

      const mpRes = await fetch(`${API_URL}/create-preference`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: reg.id, email: data.email, fullName: data.fullName }),
      })
      if (!mpRes.ok) { const e = await mpRes.json(); throw new Error(e.error || 'Erro no pagamento.') }
      const pref = await mpRes.json()
      if (pref.init_point) { localStorage.removeItem('flona12km_expiry'); window.location.assign(pref.init_point) }
      else throw new Error('Link de pagamento não gerado.')
    } catch (e: any) { setSubmitError(e.message || 'Erro inesperado.') }
  }

  const openForm = () => {
    setShowForm(true)
    setTimeout(() => document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const price = eventStatus?.currentLot?.price ?? 30

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B1A0B] text-white font-sans overflow-x-hidden">

      {/* Fundo sutil */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-150 h-150 rounded-full bg-green-950/60 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-100 h-100 rounded-full bg-emerald-950/40 blur-[100px]" />
      </div>

      {/* ══ TIMER DE URGÊNCIA ══ */}
      {showForm && (
        <div className="fixed top-0 left-0 right-0 z-60 bg-[#0B1A0B]/95 backdrop-blur border-b border-white/8">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full ${timeLeft < 60 ? 'bg-red-400 animate-ping' : 'bg-green-400 animate-pulse'}`} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Reserva ativa</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">Tempo</p>
                <p className={`text-base font-black tabular-nums leading-none ${timeLeft < 60 ? 'text-red-400' : 'text-green-400'}`}>{fmt(timeLeft)}</p>
              </div>
              <div className="w-px h-7 bg-white/10" />
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">Vagas restantes</p>
                <p className="text-base font-black leading-none">{eventStatus?.available ?? 20} <span className="text-xs text-white/30">/ {eventStatus?.capacity ?? 20}</span></p>
              </div>
            </div>
          </div>
          {/* barra de progresso */}
          <div className="h-0.5 bg-white/5">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(timeLeft / 600) * 100}%` }} />
          </div>
        </div>
      )}

      {/* ══ HEADER ══ */}
      <header className="relative z-50 border-b border-white/6 bg-[#0B1A0B]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between" style={{ height: '72px' }}>
          <Link to="/" className="flex items-center gap-3 group text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <img src="/favicon.png" alt="Trail & Run Club" className="w-8 h-8 object-contain" />
            <span className="text-xs font-black tracking-widest uppercase">
              Trail & Run <span className="text-green-400">Club</span>
            </span>
          </Link>
          <button
            onClick={openForm}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-green-900/30"
          >
            Garantir Vaga — R$ {price}
          </button>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-16">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Coluna esquerda — texto */}
          <div>
            {/* Chip de data */}
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/6 border border-white/10 text-[11px] font-semibold text-white/60 uppercase tracking-widest">
              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                <line x1="8"  y1="2" x2="8"  y2="6" strokeWidth="2"/>
                <line x1="3"  y1="10" x2="21" y2="10" strokeWidth="2"/>
              </svg>
              Domingo, 04 de Junho · 07h30
            </div>

            <h1 className="text-[3.5rem] md:text-[5rem] font-black leading-[0.9] tracking-tight uppercase mb-5">
              Trilha<br />
              <span className="text-green-400">12km</span><br />
              <span className="text-[1.8rem] md:text-[2.5rem] text-white/30 font-bold tracking-wide">FLONA · Brasília</span>
            </h1>

            <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Floresta Nacional de Brasília. 12km ida e volta, nível fácil a médio, todo o percurso plano.
              Paradas no <strong className="text-green-400 font-semibold">Córrego Geladeira</strong> e no <strong className="text-green-400 font-semibold">Pinheiral</strong>.
            </p>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-3 mb-9">
              {[
                { label: 'Distância',       value: '12 km' },
                { label: 'Nível',           value: 'Fácil — Médio' },
                { label: 'Vagas',           value: '20 atletas' },
                { label: '1º Lote',         value: `R$ ${price}` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/35 font-semibold mb-0.5">{label}</p>
                  <p className="text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Chip sorteio */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-semibold mb-6">
              1º lote concorre a 1 esmaltação completa — sorteio ao vivo
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={openForm}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-green-900/30"
              >
                Quero participar — R$ {price}
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex flex-col gap-1.5 text-[11px] text-white/35 font-medium">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-500" /> 
                  <span><strong className="text-yellow-400">Atletas Founders:</strong> uso obrigatório da camisa e botton</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-500" /> 
                  <span>Condutora: Alessandra</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita — galeria com foto real */}
          <div className="relative">
            {/* Imagem principal */}
            <div className="relative rounded-3xl overflow-hidden h-120 border border-white/8 group/gallery">
              {GALLERY.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Trail & Run Club na FLONA"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === galleryIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              {/* Overlay suave no rodapé */}
              <div className="absolute inset-0 bg-linear-to-t from-[#0B1A0B] via-transparent to-transparent pointer-events-none" />

              {/* Setinhas de navegação (visíveis por padrão no mobile, aparecem no hover no desktop) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryIndex(i => (i - 1 + GALLERY.length) % GALLERY.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer opacity-80 md:opacity-0 md:group-hover/gallery:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryIndex(i => (i + 1) % GALLERY.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer opacity-80 md:opacity-0 md:group-hover/gallery:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>



              {/* Indicadores da galeria */}
              <div className="absolute top-4 right-4 flex gap-1.5">
                {GALLERY.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === galleryIndex ? 'bg-white w-4' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>

            {/* Destaque da condutora */}
            <div className="mt-3 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center gap-3">
                <img src={aleImg} alt="Alessandra" className="w-10 h-10 rounded-full object-cover border border-green-500/40" />
                <div>
                  <p className="text-xs font-black text-white">Alessandra Sousa</p>
                  <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Condutora da Trilha</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                </div>
                <a href="https://instagram.com/alessandrasousa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 hover:underline transition-colors group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3 text-sky-400/80 group-hover:text-sky-300 transition-colors"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Ver Instagram</span>
                </a>
              </div>
            </div>

            {/* Card de localização */}
            <div className="mt-3 flex items-start gap-3 px-4 py-3 rounded-2xl border border-white/8 bg-white/4">
              <MapPin className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-0.5">Ponto de concentração</p>
                <p className="text-sm font-black text-white leading-snug">Mesas de madeira atrás do Quiosque dos Mapas</p>
                <p className="text-xs text-white/45 mt-1">Concentração às 07h30</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BANNER DA ALESSANDRA ══ */}
      <section className="relative z-10 bg-linear-to-r from-[#0B1A0B] via-green-950/30 to-[#0B1A0B] border-y border-white/6 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="relative rounded-2xl overflow-hidden h-90">
              <img src={aleImg} alt="Alessandra conduzindo a trilha" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0B1A0B]/70" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-3">Quem vai te conduzir</p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 leading-tight">
                Alessandra Sousa<br />
                <span className="text-white/40 text-xl font-bold">Condutora de Trilhas</span>
              </h2>
              <p className="text-white/55 leading-relaxed mb-6 text-sm md:text-base">
                Mais do que uma caminhada, nós vivemos uma experiência coletiva na natureza. Alessandra Sousa conduz nosso grupo garantindo que o ritmo seja confortável para todos, começamos juntos e terminamos juntos. Aqui você encontra amizade, superação e uma vibe indescritível que só quem trilha em grupo entende.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Vibe Única', sub: 'Energia lá no alto, risadas e contato real.' },
                  { label: 'Ritmo Coletivo', sub: 'Ninguém fica para trás. Subimos juntos.' },
                  { label: 'Novas Amizades', sub: 'Conecte-se com pessoas incríveis e ativas.' },
                  { label: 'Comunidade Ativa', sub: 'Mais que um evento, um clube para pertencer.' },
                ].map(({ label, sub }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <p className="text-xs font-black text-white uppercase tracking-wider">{label}</p>
                    <p className="text-[10px] text-white/45 leading-normal">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Prova Social da Comunidade */}
              <div className="pt-6 border-t border-white/6 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 text-green-400">
                  <Heart className="w-6 h-6 text-green-400 fill-green-400/20" />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">Faça parte do grupo!</p>
                  <p className="text-[11px] text-white/45 mt-0.5">Mais de 80 atletas ativos compartilhando treinos, trilhas e momentos em Brasília.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROGRAMAÇÃO ══ */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-2">Programação</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Como vai ser o <span className="text-green-400">seu domingo</span>
            </h2>
          </div>

          {/* Timeline vertical */}
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/8" />

            <div className="space-y-2">
              {[
                { time: '07h30', title: 'Concentração',       desc: 'Mesas de madeira atrás do Quiosque dos Mapas. Check-in e boas-vindas.' },
                { time: '07h45', title: 'Aquecimento',        desc: 'Dinâmicas de aquecimento com a condutora Alessandra antes da partida.' },
                { time: '08h00', title: 'Início da trilha',   desc: '12km ida e volta, nível fácil a médio, percurso plano pela floresta.' },
                { time: 'Parada 1', title: 'Córrego Geladeira', desc: 'Ponto de banho, descanso e lanche no meio do caminho.' },
                { time: 'Parada 2', title: 'Pinheiral',       desc: 'Segunda parada, vista do pinheiral antes do retorno.' },
                { time: 'Retorno', title: 'Encerramento',     desc: 'Confraternização, fotos e sorteio da esmaltação entre os Founders.' },
              ].map((item, i) => (
                <div key={i} className="relative flex gap-6 pl-14 pb-6">
                  {/* Ponto na linha */}
                  <div className="absolute left-3 top-1 w-4 h-4 rounded-full bg-green-400 border-2 border-green-500/50" />
                  <div className="flex-1 bg-white/4 border border-white/8 rounded-2xl px-5 py-4 hover:border-green-500/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-white mb-0.5">{item.title}</p>
                        <p className="text-sm text-white/45 leading-relaxed">{item.desc}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-400 whitespace-nowrap bg-green-400/10 px-2.5 py-1 rounded-lg shrink-0">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SORTEIO — 1º LOTE ══ */}
      <section className="relative z-10 border-t border-white/6 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl border border-yellow-400/15 bg-yellow-400/5 px-8 py-10 md:flex items-center gap-10">
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-400 mb-2">Benefício exclusivo — 1º lote</p>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3">
                Concorra a 1 esmaltação completa
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Todo atleta que confirmar inscrição no <strong className="text-yellow-400">1º lote</strong> entra automaticamente
                no sorteio. O ganhador é anunciado ao vivo no dia do evento, entre amigos, na floresta.
              </p>
            </div>
            <div className="shrink-0 mt-6 md:mt-0">
              <div className="flex gap-5">
                {['Inscreva', 'Pague', 'Concorra'].map((s, i) => (
                  <div key={s} className="text-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-400/15 border border-yellow-400/20 text-yellow-400 text-[10px] font-black flex items-center justify-center mx-auto mb-1.5">
                      {i + 1}
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-white/35 font-bold">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ DEPOIMENTOS ══ */}
      <section className="relative z-10 border-t border-white/6 py-20">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-2">O que dizem</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            Quem foi, <span className="text-green-400">voltou diferente</span>
          </h2>
        </div>

        {/* Estilos locais para o carrossel infinito (Marquee) */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            animation: marquee-left 50s linear infinite;
          }
          .animate-marquee-right {
            animation: marquee-right 50s linear infinite;
          }
          .animate-marquee-left:hover,
          .animate-marquee-right:hover {
            animation-play-state: paused;
          }
        `}} />

        {/* Container principal do Carrossel com máscara de fade nas bordas */}
        <div className="relative w-full overflow-hidden py-4 flex flex-col gap-6">
          {/* Degradê de fade-out nas laterais */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-[#0B1A0B] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-[#0B1A0B] to-transparent z-20 pointer-events-none" />

          {/* Fileira 1: Roda para a esquerda */}
          <div className="flex overflow-hidden w-full select-none gap-4">
            <div className="flex gap-4 w-max animate-marquee-left">
              {/* Renderiza as primeiras 6 opiniões */}
              {TESTIMONIALS.slice(0, 6).map((t, i) => (
                <div key={`r1-${i}`} className="w-87.5 h-[276px] shrink-0 flex flex-col bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all hover:bg-white/6 duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed mb-5 flex-1 overflow-hidden">"{t.text}"</p>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-900/60 border border-green-500/20 flex items-center justify-center text-xs font-black text-green-400 uppercase">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[9px] text-green-400 uppercase tracking-widest font-semibold">Atleta Founder</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Duplicação exata para efeito infinito contínuo */}
              {TESTIMONIALS.slice(0, 6).map((t, i) => (
                <div key={`r1-dup-${i}`} className="w-87.5 h-[276px] shrink-0 flex flex-col bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all hover:bg-white/6 duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed mb-5 flex-1 overflow-hidden">"{t.text}"</p>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-900/60 border border-green-500/20 flex items-center justify-center text-xs font-black text-green-400 uppercase">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[9px] text-green-400 uppercase tracking-widest font-semibold">Atleta Founder</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fileira 2: Roda para a direita */}
          <div className="flex overflow-hidden w-full select-none gap-4">
            <div className="flex gap-4 w-max animate-marquee-right">
              {/* Renderiza as últimas 6 opiniões */}
              {TESTIMONIALS.slice(6, 12).map((t, i) => (
                <div key={`r2-${i}`} className="w-87.5 h-[276px] shrink-0 flex flex-col bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all hover:bg-white/6 duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed mb-5 flex-1 overflow-hidden">"{t.text}"</p>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-900/60 border border-green-500/20 flex items-center justify-center text-xs font-black text-green-400 uppercase">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[9px] text-green-400 uppercase tracking-widest font-semibold">Atleta Founder</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Duplicação exata para efeito infinito contínuo */}
              {TESTIMONIALS.slice(6, 12).map((t, i) => (
                <div key={`r2-dup-${i}`} className="w-87.5 h-[276px] shrink-0 flex flex-col bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all hover:bg-white/6 duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed mb-5 flex-1 overflow-hidden">"{t.text}"</p>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-900/60 border border-green-500/20 flex items-center justify-center text-xs font-black text-green-400 uppercase">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[9px] text-green-400 uppercase tracking-widest font-semibold">Atleta Founder</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ O QUE ESTÁ INCLUSO ══ */}
      <section className="relative z-10 border-t border-white/6 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-2">Incluso na inscrição</p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Tudo o que você recebe</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: Shield,   title: 'Condução guiada',  sub: 'Com Alessandra Sousa' },
              { icon: Users,    title: 'Participação no grupo da comunidade e sorteios',        sub: 'Via whatsapp' },
              { icon: Mountain, title: 'Trilha 12km',            sub: 'Nível fácil a médio' },
              { icon: Droplets, title: 'Córrego Geladeira',      sub: 'Parada para banho' },
              { icon: Clock,    title: 'Pinheiral',              sub: 'Segunda parada' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-2xl border border-white/8 bg-white/4 hover:border-green-500/20 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-green-900/40 border border-green-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="text-[10px] text-white/40">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FORMULÁRIO DE INSCRIÇÃO ══ */}
      <section id="inscricao" className="relative z-10 border-t border-white/6 py-20 scroll-mt-20">
        <div className="max-w-lg mx-auto px-6">

          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-2">Apenas 20 vagas</p>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
              Garanta sua vaga
            </h2>
            <p className="text-white/40 text-sm">Pagamento seguro via Mercado Pago. Pix, cartão ou boleto.</p>
          </div>

          {/* Card de preço */}
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 px-6 py-5 mb-7 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400">1º Lote — inscrição + sorteio</p>
              <p className="text-4xl font-black text-white mt-1">R$ {price}<span className="text-lg text-white/30">,00</span></p>
            </div>
            <div className="text-right text-[11px] text-white/35 font-medium leading-relaxed">
              04 Jun · Domingo<br />07h30 · FLONA Brasília
            </div>
          </div>

          {/* Vagas esgotadas */}
          {eventStatus?.is_sold_out && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-6 text-center mb-7">
              <p className="text-base font-black text-red-400 uppercase tracking-wider mb-1">Vagas esgotadas</p>
              <p className="text-sm text-white/40">Fique atento ao próximo evento.</p>
            </div>
          )}

          {(!eventStatus || !eventStatus.is_sold_out) && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Nome */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Nome Completo</label>
                <input {...register('fullName')} placeholder="Como no documento"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/40 transition-colors" />
                {errors.fullName && <p className="mt-1 text-[10px] text-red-400 font-bold uppercase">{errors.fullName.message}</p>}
              </div>

              {/* CPF + Gênero */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5">CPF</label>
                  <input {...register('cpf')} placeholder="000.000.000-00" onChange={e => setValue('cpf', maskCPF(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/40 transition-colors" />
                  {errors.cpf && <p className="mt-1 text-[10px] text-red-400 font-bold uppercase">{errors.cpf.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Gênero</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['M', 'F'].map((g, idx) => (
                      <button key={g} type="button" onClick={() => setValue('gender', idx === 0 ? 'Masculino' : 'Feminino')}
                        className={`h-12.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          watch('gender') === (idx === 0 ? 'Masculino' : 'Feminino')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-white/10 bg-white/5 text-white/30 hover:border-white/20'
                        }`}>
                        {g === 'M' ? 'Masc' : 'Fem'}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="mt-1 text-[10px] text-red-400 font-bold uppercase">{errors.gender.message}</p>}
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5">E-mail</label>
                <input {...register('email')} type="email" placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/40 transition-colors" />
                {errors.email && <p className="mt-1 text-[10px] text-red-400 font-bold uppercase">{errors.email.message}</p>}
              </div>

              {/* WhatsApp + Emergência */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'WhatsApp',    field: 'phone',          placeholder: '(00) 00000-0000' },
                  { label: 'Emergência',  field: 'emergencyPhone', placeholder: '(00) 00000-0000' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5">{label}</label>
                    <input {...register(field as any)} placeholder={placeholder}
                      onChange={e => setValue(field as any, maskPhone(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/40 transition-colors" />
                    {(errors as any)[field] && <p className="mt-1 text-[10px] text-red-400 font-bold uppercase">{(errors as any)[field]?.message}</p>}
                  </div>
                ))}
              </div>

              {/* Tipo Sanguíneo */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Tipo Sanguíneo</label>
                <div className="grid grid-cols-4 gap-2">
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => (
                    <button key={t} type="button" onClick={() => setValue('bloodType', t)}
                      className={`h-10 rounded-xl border text-[10px] font-black uppercase transition-all ${
                        watch('bloodType') === t ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-white/10 bg-white/5 text-white/30 hover:border-white/20'
                      }`}>{t}</button>
                  ))}
                </div>
                {errors.bloodType && <p className="mt-1 text-[10px] text-red-400 font-bold uppercase">{errors.bloodType.message}</p>}
              </div>

              {/* Camiseta */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Tamanho da Camiseta</label>
                <div className="grid grid-cols-5 gap-2">
                  {['PP','P','M','G','GG'].map(size => (
                    <button key={size} type="button" onClick={() => setValue('shirtSize', size)}
                      className={`h-10 rounded-xl border text-[10px] font-black uppercase transition-all ${
                        watch('shirtSize') === size ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-white/10 bg-white/5 text-white/30 hover:border-white/20'
                      }`}>{size}</button>
                  ))}
                </div>
                {errors.shirtSize && <p className="mt-1 text-[10px] text-red-400 font-bold uppercase">{errors.shirtSize.message}</p>}
              </div>

              {/* Alergias / Medicamentos */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Alergias ou Medicamentos de Uso Contínuo (Opcional)</label>
                <input {...register('medication')} placeholder="Ex: Alergia a picada de abelha, uso de insulina, nenhum..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/40 transition-colors" />
                {errors.medication && <p className="mt-1 text-[10px] text-red-400 font-bold uppercase">{errors.medication.message}</p>}
              </div>

              {/* Termos */}
              <label className="flex gap-3 cursor-pointer">
                <input type="checkbox" {...register('terms')} className="mt-0.5 accent-green-500" />
                <span className="text-[11px] text-white/35 leading-relaxed">
                  Li e aceito os{' '}<Link to="/terms" className="text-green-400 underline">Termos de Uso</Link>{' '}
                  e a{' '}<Link to="/privacy" className="text-green-400 underline">Política de Privacidade</Link>.
                </span>
              </label>
              {errors.terms && <p className="text-[10px] text-red-400 font-bold uppercase">{errors.terms.message}</p>}

              {/* Erro de submit */}
              {submitError && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400 font-bold">{submitError}</p>
                </div>
              )}

              {/* Segurança */}
              <div className="rounded-xl border border-white/6 bg-white/3 px-4 py-3 flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-[11px] text-white/35 leading-relaxed">
                  Pagamento 100% seguro via <strong className="text-white/60">Mercado Pago</strong>. Dados protegidos por criptografia.
                </p>
              </div>

              {/* Botão principal */}
              <button type="submit" disabled={isSubmitting || isLoadingStatus}
                className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/30 flex items-center justify-center gap-2">
                {isSubmitting
                  ? <><div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />Processando...</>
                  : <>Ir para o pagamento — R$ {price}<ChevronRight className="w-4 h-4" /></>
                }
              </button>

              {/* Selos de confiança */}
              <div className="flex items-center justify-center gap-5 pt-1">
                {[
                  { icon: Shield,       label: 'Pagamento Seguro' },
                  { icon: Check,        label: 'Dados Protegidos' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/25">
                    <Icon className="w-3 h-3" /> {label}
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="relative z-10 border-t border-white/6 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/25">
          <p>© 2026 Trail & Run Club. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link to="/terms"   className="hover:text-white/60 transition-colors">Termos</Link>
            <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Flona12km
