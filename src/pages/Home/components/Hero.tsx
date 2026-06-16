import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import eventArt from '../../../assets/artenova.png'
import type { EventData, EventStatus } from '../types'

interface HeroProps {
  event: EventData
  eventStatus: EventStatus | null
}

const eventPresentation = {
  flona: {
    badge: 'Founder Edition Brasilia 2026',
    title: ['TRAIL', 'RUN'],
    accent: 'Club',
    date: '06 de JUNHO',
    location: 'FLONA - BRASILIA',
    description: '',
    bg: 'bg-[#4B2C20]',
    accentClass: 'text-[#D4B996]',
    accentColor: '#D4B996',
    glow: 'bg-[#D4B996]/10',
    pill: 'bg-white/5 border-white/5',
    cta: '',
    ctaText: 'GARANTIR MINHA VAGA',
    showAmpersand: true,
  },
  eixao: {
    badge: 'Aulao no Eixao Sul',
    title: ['AULA', 'EIXAO'],
    accent: 'Sul',
    date: '21 de JUNHO - 08H',
    location: 'EIXAO SUL - BRASILIA',
    description: 'Alongamento, corrida ou caminhada e cafe coletivo no Eixao Sul. Um domingo para se mexer, respirar e ficar perto de gente boa.',
    bg: 'bg-[#06172E]',
    accentClass: 'text-sky-300',
    accentColor: '#7DD3FC',
    glow: 'bg-sky-300/20',
    pill: 'bg-sky-300/10 border-sky-300/15',
    cta: '!bg-sky-300 !text-[#06172E] hover:!bg-white shadow-sky-950/30',
    ctaText: 'QUERO PARTICIPAR',
    showAmpersand: false,
  },
}

export const Hero: React.FC<HeroProps> = ({ event, eventStatus }) => {
  const isFlona = event?.slug === 'trail-run-flona-2026'
  const isEixao = event?.slug === 'alongamento-corrida-eixao-sul'
  const available = eventStatus?.available ?? 0
  const defaultCover = eventArt
  const theme = isEixao ? eventPresentation.eixao : eventPresentation.flona
  const badgeText = isFlona || isEixao
    ? theme.badge
    : `${event?.title || 'Experiencia'} - Edicao 2026`

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
    return `${day} de ${month}`
  }

  const displayDate = isFlona || isEixao
    ? theme.date
    : `${formatDateOnly(event?.date || '')} - HORARIO A DEFINIR`
  const displayLocation = isFlona || isEixao ? theme.location : 'LOCAL A DEFINIR'
  const eventDescription = theme.description || event?.description || 'Explore seus limites em uma jornada unica de superacao, saude e conexao com a natureza.'

  return (
    <header className={`relative overflow-hidden px-6 py-12 md:py-24 ${theme.bg}`}>
      <div className={`pointer-events-none absolute left-[-10%] top-[-10%] h-[400px] w-[400px] rounded-full ${theme.glow} blur-[80px]`} />
      {isEixao && (
        <>
          <div className="pointer-events-none absolute right-[-12%] top-[18%] h-[520px] w-[520px] rounded-full bg-blue-500/15 blur-[120px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#031024] to-transparent" />
        </>
      )}

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="group relative mb-8 inline-block cursor-default px-12 py-6">
            <div className="absolute inset-0 scale-105 -rotate-2 rounded-[100%] border-2 border-white/40 animate-pulse" />
            <div className="absolute inset-0 scale-115 rotate-3 rounded-[100%] border-2 border-white/10" />
            <span className="relative text-[10px] font-black uppercase tracking-[0.4em] text-white drop-shadow-lg md:text-xs">
              {badgeText}
            </span>
          </div>

          <div className="group relative mb-10 inline-block cursor-default select-none">
            <div className="relative flex -skew-x-6 flex-col items-center md:items-start">
              <span className="text-6xl font-black uppercase leading-[0.8] tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] md:text-9xl">
                {theme.title[0]}
              </span>
              <span className="text-6xl font-black uppercase leading-[0.8] tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] md:text-9xl">
                {theme.title[1]}
              </span>
              <span className={`mt-4 font-serif text-4xl italic leading-none drop-shadow-2xl md:mt-6 md:text-7xl ${theme.accentClass}`}>
                {theme.accent}
              </span>

              {theme.showAmpersand && (
                <div className="absolute left-[105%] top-0 flex h-[65%] items-center">
                  <span className={`font-serif text-5xl italic leading-none drop-shadow-2xl md:text-[8rem] ${theme.accentClass}`}>
                    &
                  </span>
                </div>
              )}
            </div>

            <div className="absolute -bottom-10 -left-10 -z-10 h-20 w-40 rotate-2 rounded-full bg-white/10 blur-3xl animate-pulse" />
          </div>

          <p className="mb-6 max-w-md text-base font-medium leading-relaxed text-gray-300 md:text-xl">
            {eventDescription}
          </p>

          <div className="mb-12 flex w-full flex-col items-center gap-4 md:items-start">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 md:text-xs">
                Contagem ao vivo: <span style={{ color: theme.accentColor }}>{available} vagas restantes</span>
              </span>
            </div>

            {available > 0 ? (
              <Link to={`/checkout?eventId=${event?.id}`} className="w-full md:w-auto">
                <Button variant="secondary" pulse showShimmer className={`w-full px-16 py-6 text-xl md:w-auto ${theme.cta}`}>
                  {theme.ctaText}
                </Button>
              </Link>
            ) : (
              <div className="w-full cursor-not-allowed opacity-50 md:w-auto">
                <Button variant="secondary" className="w-full bg-gray-600 px-16 py-6 text-xl grayscale border-gray-500 shadow-none md:w-auto">
                  VAGAS ESGOTADAS
                </Button>
              </div>
            )}

            <div className="flex w-full flex-row flex-nowrap items-center justify-center gap-2 overflow-x-hidden text-[10px] font-bold text-gray-400 md:justify-start md:gap-8 md:text-sm">
              <span className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-3 md:gap-3 md:px-5 ${theme.pill}`}>
                <Calendar size={18} style={{ color: theme.accentColor }} /> {displayDate}
              </span>
              <span className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-3 md:gap-3 md:px-5 ${theme.pill}`}>
                <MapPin size={18} style={{ color: theme.accentColor }} /> {displayLocation}
              </span>
            </div>
          </div>
        </div>

        <div className="group relative -mt-16 md:mt-0">
          <div className="absolute inset-0 scale-75 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className={`relative overflow-hidden rounded-[40px] border-4 transition-transform duration-500 group-hover:scale-[1.02] ${isEixao ? 'border-sky-300/20 shadow-2xl shadow-blue-950/40' : 'border-white/10'}`}>
            <img
              src={event?.image_url || defaultCover}
              alt={event?.title || 'Trail & Run Club Evento'}
              className={`h-auto w-full ${isEixao ? 'saturate-110 contrast-105' : ''}`}
              loading="eager"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultCover
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
