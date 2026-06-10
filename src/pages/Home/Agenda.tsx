import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, ChevronRight, Award, Leaf } from 'lucide-react'
import { API_URL } from '../../config/api'
import flonaCover from '../../assets/runner.png' // Capa original da atleta correndo na floresta (recuperada do Git)
import johnImg from '../../assets/colaborador1.png'
import aleImg from '../../assets/colaborador3.png'

// ─────────────────────────────────────────────────────────────────────────────
// 📌 CONCEITO SÊNIOR: "Static Data for Non-API Cards"
// Eventos ainda sem cadastro na API podem ser representados localmente.
// Vantagem: não pesa o servidor, não depende de resposta assíncrona.
// Quando o evento for cadastrado na API, basta REMOVER este objeto.
// ─────────────────────────────────────────────────────────────────────────────
const FLONA_12KM_STATIC = {
  id: 'static-flona-12km',         // ID fictício — não vai ao banco
  slug: 'flona-12km-04-06',        // slug único — usado nas rotas
  title: 'Flona 12 km',            // Título exibido no card
  description: 'Trilha 12km ida e volta na Floresta Nacional de Brasília. Nível fácil a médio. Toda plana, com parada no Córrego Geladeira e no Pinheiral.',
  date: '2026-06-04T07:30:00',     // 04/06 — Concentração 07:30
  location: 'Floresta Nacional de Brasília',
  image_url: '',                    // sem imagem da API — usamos o flonaCover
  capacity: 20,                     // 20 participantes (Atletas Founders)
  is_active: true,
  is_sold_out: false,
  price: 30.00,
  isStatic: true,                  // flag para distinguir de eventos da API
}

// Tipo estendido com o campo isStatic opcional
type EventCard = {
  id: string
  slug: string
  title: string
  description: string
  date: string
  location: string
  image_url: string
  capacity: number
  is_active: boolean
  is_sold_out?: boolean
  price?: number
  isStatic?: boolean
}

// Helper para obter descrições simplificadas e objetivas de treinos de junho (Clean UI / Senior Mode)
const getSimplifiedDescription = (slug: string, defaultDesc: string) => {
  const simplified: Record<string, string> = {
    'toneis-13-06': 'Treino prático com check-in e check-out programados na natureza.',
    'treino-jonathas-aguas-claras': 'Treino técnico orientado com foco em subidas, descidas e postura.',
    'alongamento-corrida-eixao-sul': 'Alongamento dinâmico seguido de corrida leve de 5km no Eixão Sul.',
    'poco-azul-28-06': 'Treino técnico de trail running com subidas no cenário do Poço Azul.'
  }
  return simplified[slug] || defaultDesc
}

// ─────────────────────────────────────────────────────────────────────────────
// 📌 CONCEITO: Removemos a 'interface Event' daqui porque já definimos o tipo
// 'EventCard' acima com os mesmos campos + o campo isStatic.
// DRY principle: Don't Repeat Yourself — um único tipo para reger todos.
// ─────────────────────────────────────────────────────────────────────────────

export const Agenda: React.FC = () => {
  // ─────────────────────────────────────────────────────────────────────────
  // 📌 CONCEITO: useState<EventCard[]> — tipamos o estado com nosso tipo.
  // Isso diz ao TypeScript: "esse array só pode conter objetos EventCard".
  // ─────────────────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar a agenda.')
        return res.json()
      })
      .then((data: EventCard[]) => {
        // ─────────────────────────────────────────────────────────────────
        // 📌 CONCEITO: sort() com comparadores customizados
        // sort recebe uma função (a, b) => number:
        //   retorna -1  → 'a' vem ANTES de 'b'
        //   retorna  1  → 'b' vem ANTES de 'a'
        //   retorna  0  → ordem não muda
        // ─────────────────────────────────────────────────────────────────
        const sorted = [...data].sort((a, b) => {
          // Founder Edition sempre em primeiro lugar
          if (a.slug === 'trail-run-flona-2026') return -1
          if (b.slug === 'trail-run-flona-2026') return 1
          return 0
        })

        // ─────────────────────────────────────────────────────────────────
        // 📌 CONCEITO: splice() — injeta um elemento em posição específica
        // splice(1, 0, X) significa: "na posição 1, delete 0 elementos,
        // e insira X". Resultado: X fica como segundo item do array.
        // ─────────────────────────────────────────────────────────────────
        const withStatic = [...sorted]
        withStatic.splice(1, 0, FLONA_12KM_STATIC)

        setEvents(withStatic)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erro na agenda:', err)
        setError('Não foi possível carregar os eventos. Tente novamente mais tarde.')
        setLoading(false)
      })
  }, [])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('pt-BR', options)
  }

  return (
    <div className="min-h-screen bg-[#110A06] text-white selection:bg-[#D4B996] selection:text-[#110A06] relative overflow-hidden font-sans">
      {/* Elementos visuais de fundo para sensação premium */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#D4B996]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#E5CBA7]/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-md bg-[#110A06]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/favicon.png" alt="Trail & Run Club Icon" className="w-16 h-16 object-contain" />
            <div>
              <span className="text-xl md:text-2xl font-black tracking-widest uppercase leading-none block">
                TRAIL & RUN <span className="text-[#D4B996]">CLUB</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero da Agenda */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4B996]/10 border border-[#D4B996]/20 text-[#D4B996] text-xs font-bold uppercase tracking-widest mb-6">
          <Award className="w-3.5 h-3.5" /> Agenda de Experiências 2026
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
          Supere seus limites nos cenários mais <span className="text-[#F8E8D0] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">deslumbrantes</span>.
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Escolha o seu próximo desafio. Trilhas, corridas e aventuras organizadas com infraestrutura e segurança.
        </p>
      </section>

      {/* Lista de Eventos */}
      <main className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#D4B996]/20 border-t-[#D4B996] animate-spin" />
            <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Buscando aventuras...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-red-400">⚠️</span>
            </div>
            <p className="text-gray-300 font-bold mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-[#D4B996] text-[#110A06] font-bold rounded-2xl hover:bg-[#E5CBA7] transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Nenhum evento ativo cadastrado na agenda no momento.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              // ─────────────────────────────────────────────────────────────
              // 📌 CONCEITO: "isLargeCard" — separamos a lógica de QUAL card
              // recebe imagem grande. No futuro, adicionar mais slugs aqui.
              // ─────────────────────────────────────────────────────────────
              const isLargeCard = event.slug === 'trail-run-flona-2026' || event.slug === 'flona-12km-04-06'

              // ─────────────────────────────────────────────────────────────
              // 📌 CONCEITO: "Computed title"
              // O nome no banco é 'Trail Run Flona 2026', mas queremos exibir
              // 'Trail & Run Club Founder Edition'. Fazemos essa substituição
              // aqui no front-end — sem alterar o banco de dados.
              // ─────────────────────────────────────────────────────────────
              const displayTitle = event.slug === 'trail-run-flona-2026'
                ? 'Trail & Run Club Founder Edition'
                : event.title

              // ─────────────────────────────────────────────────────────────
              // 📌 CONCEITO: Rota dinâmica vs rota específica
              // Card estático (isStatic) tem checkout próprio em '/flona-12km'.
              // Evento da API usa a rota genérica '/evento/:slug'.
              // ─────────────────────────────────────────────────────────────
              const cardLink = event.isStatic
                ? '/flona-12km'
                : `/evento/${event.slug}`

              return (
                <div
                  key={event.id}
                  className="group relative backdrop-blur-md bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col justify-between hover:border-[#D4B996]/30 hover:bg-white/[0.07] transition-all duration-500 hover:translate-y-[-4px] shadow-2xl"
                >
                  <div>
                    {/* ── Foto de capa: apenas nos cards grandes ── */}
                    {isLargeCard && (
                      <div className="h-56 overflow-hidden relative">
                        <img
                          src={event.image_url || flonaCover}
                          alt={displayTitle}
                          // ⚠️ ATENÇÃO: removemos 'group-hover:scale-105' aqui.
                          // Isso eliminava o zoom indesejado ao passar o mouse.
                          // Mantemos apenas a transição de opacidade (sutil e elegante).
                          className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-95"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = flonaCover
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#110A06] via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                          {event.is_sold_out ? (
                            <span className="px-3 py-1 bg-red-950/80 backdrop-blur-md border border-red-500/30 rounded-full text-[10px] font-bold tracking-widest uppercase text-red-400">
                              Vagas Esgotadas
                            </span>
                          ) : event.isStatic ? (
                            // Badge especial para evento estático (Flona 12km)
                            <span className="px-3 py-1 bg-[#1a4d2e]/90 backdrop-blur-md border border-green-500/30 rounded-full text-[10px] font-bold tracking-widest uppercase text-green-400 flex items-center gap-1">
                              <Leaf className="w-3 h-3" /> Vagas Abertas · R$ 30
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-[#110A06]/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#D4B996]">
                              Inscrições Abertas
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Conteúdo do Card */}
                    <div className="p-8">
                      {/* Badge de status para treinos pequenos (sem imagem) */}
                      {!isLargeCard && (
                        <span className="inline-block px-3 py-1 bg-[#D4B996]/10 border border-[#D4B996]/20 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#D4B996] mb-4">
                          Inscrições em breve
                        </span>
                      )}
                      <h3 className="text-2xl font-black mb-3 group-hover:text-[#D4B996] transition-all tracking-tight leading-tight">
                        {displayTitle}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
                        {getSimplifiedDescription(event.slug, event.description)}
                      </p>

                      {/* Metadados */}
                      <div className="space-y-3.5 border-t border-white/5 pt-6">
                        <div className="flex items-center gap-3 text-gray-400 text-xs">
                          <Calendar className="w-4 h-4 text-[#D4B996] flex-shrink-0" />
                          <span className="font-semibold">
                            {isLargeCard
                              ? formatDate(event.date)
                              : `${new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} - Horário a definir`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-xs">
                          <MapPin className="w-4 h-4 text-[#D4B996] flex-shrink-0" />
                          <span className="font-semibold line-clamp-1">
                            {isLargeCard ? event.location : 'Local a definir'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-xs">
                          <Users className="w-4 h-4 text-[#D4B996] flex-shrink-0" />
                          <span className="font-semibold">
                            Capacidade: {isLargeCard ? `${event.capacity} atletas` : 'A definir'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="p-8 pt-0">
                    <Link
                      to={cardLink}
                      className="w-full h-14 rounded-2xl bg-[#D4B996]/10 text-[#D4B996] hover:bg-[#D4B996] hover:text-[#110A06] font-bold flex items-center justify-center gap-2 transition-all duration-300 group/btn border border-[#D4B996]/20 hover:border-transparent text-sm tracking-wider uppercase"
                    >
                      {event.isStatic ? 'Garantir Vaga' : 'Ver Detalhes'}
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}

          </div>
        )}
      </main>

      {/* Seção de Instrutores (Adaptada para Tema Escuro Premium) */}
      <section className="border-t border-white/5 bg-[#0D0704]/40 py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col items-center w-full">
            <h3 className="flex flex-col items-center text-xl md:text-3xl font-black uppercase tracking-[0.4em] text-[#D4B996] leading-none mb-16 text-center w-full pl-[0.4em]">
              <span>Conheça os</span>
              <span>instrutores</span>
            </h3>
            <div className="flex justify-center gap-12 md:gap-32 w-full">
              {[
                { 
                  name: 'Jonathas Treinador', 
                  handle: '@jonathastreinador',
                  image: johnImg
                },
                { 
                  name: 'Ale Adventuree', 
                  handle: '@Ale_adventuree',
                  image: aleImg
                }
              ].map((instr, i) => (
                <a 
                  key={i}
                  href={`https://instagram.com/${instr.handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group w-32 md:w-40"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/10 shadow-xl mb-6 overflow-hidden relative group-hover:scale-105 transition-transform duration-500 ring-4 ring-white/5">
                    {instr.image ? (
                      <img 
                        src={instr.image} 
                        alt={instr.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-3xl font-black text-white/20">
                        {instr.name[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#D4B996]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-white mb-2 text-center leading-tight group-hover:text-[#D4B996] transition-colors">
                    {instr.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#D4B996] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity text-center">
                    {instr.handle}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer premium com links legais e desenvolvido por */}
      <footer className="border-t border-white/5 py-12 text-center text-xs text-gray-500 bg-[#070402] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p>© 2026 Trail & Run Club. Todos os direitos reservados.</p>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex gap-8">
              <Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            </div>
            <a 
              href="https://instagram.com/eualvaronoronha" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#D4B996] transition-colors border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12 text-center md:text-left"
            >
              Desenvolvido por: <span className="font-black text-[#D4B996]">@eualvaronoronha</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
