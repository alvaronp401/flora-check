import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MarqueeBanner } from './components/MarqueeBanner'
import { Hero } from './components/Hero'
import { Schedule } from './components/Schedule'
import { Kit } from './components/Kit'
import { FooterCTA } from './components/FooterCTA'
import { EixaoHighlights } from './components/EixaoHighlights'
import { API_URL } from '../../config/api'
import type { EventData, EventStatus } from './types'

const FULL_PAGE_EVENT_SLUGS = new Set([
  'trail-run-flona-2026',
  'alongamento-corrida-eixao-sul',
])

const EVENT_OVERRIDES: Record<string, Partial<EventData>> = {
  'alongamento-corrida-eixao-sul': {
    title: 'Aulão no Eixão Sul',
    description: 'Alongamento + corrida/caminhada em grupo às 8h com Prof. Jonathas Armiliato. Leve sua canga e vamos tomar café juntos depois do movimento.',
    date: '2026-06-21T08:00:00',
    location: 'Eixão Sul',
  },
}

const Home: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState<EventData | null>(null)
  const [eventStatus, setEventStatus] = useState<EventStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      navigate('/')
      return
    }

    const fetchEventData = async () => {
      try {
        // 1. Busca os detalhes do evento por slug
        const eventRes = await fetch(`${API_URL}/events/slug/${slug}`)
        if (!eventRes.ok) {
          throw new Error('Evento não encontrado')
        }
        const rawEventData: EventData = await eventRes.json()
        const eventData = { ...rawEventData, ...EVENT_OVERRIDES[rawEventData.slug] }
        setEvent(eventData)

        // 2. Busca o status das vagas do evento
        const statusRes = await fetch(`${API_URL}/event-status?eventId=${eventData.id}`)
        if (!statusRes.ok) {
          throw new Error('Falha ao buscar status do evento')
        }
        const statusData: EventStatus = await statusRes.json()
        setEventStatus(statusData)
        setLoading(false)
      } catch (err) {
        console.error('Erro ao buscar dados do evento:', err)
        navigate('/') // Redireciona para a agenda em caso de erro
      }
    }

    fetchEventData()
  }, [slug, navigate])

  // Polling de 5 segundos apenas para o status de vagas
  useEffect(() => {
    if (!event?.id) return

    const fetchStatusOnly = () => {
      fetch(`${API_URL}/event-status?eventId=${event.id}`)
        .then(res => res.json())
        .then(data => setEventStatus(data))
        .catch(err => console.error('Erro no polling do status:', err))
    }

    const interval = setInterval(fetchStatusOnly, 5000)
    return () => clearInterval(interval)
  }, [event?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#110A06] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4B996]/20 border-t-[#D4B996] animate-spin" />
        <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase font-sans">Carregando detalhes do evento...</p>
      </div>
    )
  }

  // 🚀 TELA 'EM BREVE NOVIDADES' PARA NOVOS EVENTOS (JUNHO)
  if (!event) {
    return null
  }

  if (!FULL_PAGE_EVENT_SLUGS.has(event.slug)) {
    return (
      <div className="min-h-screen bg-[#110A06] text-white selection:bg-[#D4B996] selection:text-[#110A06] relative overflow-hidden font-sans flex flex-col justify-between">
        {/* Elementos visuais de fundo */}
        <div className="absolute top-[-20%] left-[-10%] w-150 h-150 rounded-full bg-[#D4B996]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 rounded-full bg-[#E5CBA7]/5 blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="border-b border-white/5 backdrop-blur-md bg-[#110A06]/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/favicon.png" alt="Trail & Run Club Icon" className="w-16 h-16 object-contain" />
              <div>
                <span className="text-xl md:text-2xl font-black tracking-widest uppercase block">
                  TRAIL & RUN <span className="text-[#D4B996]">CLUB</span>
                </span>
              </div>
            </div>
            <Link 
              to="/" 
              className="text-[10px] font-black uppercase tracking-widest text-[#D4B996] hover:text-white transition-all border border-[#D4B996]/30 hover:border-white/10 px-4 py-2 rounded-xl bg-[#D4B996]/5 hover:bg-[#D4B996]/10"
            >
              Voltar para Agenda
            </Link>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4B996]/10 border border-[#D4B996]/20 text-[#D4B996] text-xs font-bold uppercase tracking-widest mb-8 animate-pulse">
            Em breve novidades
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-8 uppercase leading-tight drop-shadow-2xl">
            {event.title}
          </h1>

          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            Estamos preparando uma experiência única de conexão com a natureza e superação pessoal. As inscrições e o cronograma completo estarão disponíveis em breve.
          </p>

          <Link to="/">
            <button className="px-8 py-4 bg-[#D4B996] text-[#110A06] text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-[#E5CBA7] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl">
              Ver Outros Eventos
            </button>
          </Link>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 text-center text-xs text-gray-500 bg-[#070402] relative z-10">
          <p>© 2026 Trail & Run Club. Todos os direitos reservados.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de Urgência */}
      <MarqueeBanner eventStatus={eventStatus} />

      {/* Seção Principal (CTA & Logo) */}
      <Hero event={event} eventStatus={eventStatus} />

      {event.slug === 'alongamento-corrida-eixao-sul' && (
        <EixaoHighlights />
      )}

      {/* Programação do Evento */}
      <Schedule eventId={event.id} slug={event.slug} />

      {/* Seção de Kit & Atributos Técnicos */}
      {event.slug === 'trail-run-flona-2026' && (
        <Kit event={event} eventStatus={eventStatus} />
      )}

      {/* Rodapé & Chamada Final */}
      <FooterCTA eventId={event.id} eventStatus={eventStatus} slug={event.slug} />
    </div>
  )
}

export default Home
