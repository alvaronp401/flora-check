import React from 'react'
import { Coffee, Footprints, MapPinned } from 'lucide-react'

const StretchingIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v7"/>
    <path d="M8 10l4-3 4 3"/>
    <path d="M12 14l-4 7"/>
    <path d="M12 14l4 7"/>
  </svg>
)

const highlights = [
  {
    icon: StretchingIcon,
    title: 'Alongamento guiado',
    text: 'Um comeco leve para acordar o corpo, soltar a respiracao e entrar no ritmo do grupo.',
  },
  {
    icon: Footprints,
    title: 'Corrida ou caminhada',
    text: 'Voce escolhe o ritmo. A proposta e se movimentar junto, sem pressa e sem pressao.',
  },
  {
    icon: Coffee,
    title: 'Cafe com canga',
    text: 'Depois do movimento, a gente estende a canga e transforma o treino em encontro.',
  },
]

export const EixaoHighlights: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#06172E] py-20 md:py-28 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-300/60 to-transparent" />
      <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-sky-400/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-blue-700/20 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-12 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.35em] text-sky-300">
              Uma manha diferente
            </p>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
              Movimento, ar livre e cafe juntos
            </h2>
          </div>
          <p className="max-w-2xl text-base font-medium leading-relaxed text-sky-100/75 md:text-lg">
            O Aulão no Eixão Sul nasce com outra energia: mais urbano, mais leve e mais coletivo. E treino, mas tambem e pausa, conversa e comunidade.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className="group rounded-[2rem] border border-sky-300/15 bg-white/[0.06] p-7 shadow-2xl shadow-blue-950/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/40 hover:bg-white/[0.09]"
              >
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-200 transition-transform duration-300 group-hover:scale-105">
                  <Icon size={24} />
                </div>
                <h3 className="mb-3 text-xl font-black uppercase tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-sky-100/65">
                  {item.text}
                </p>
              </article>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-[2rem] border border-sky-300/15 bg-sky-950/40 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-300 text-[#06172E]">
              <MapPinned size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                Ponto de concentração
              </p>
              <p className="text-lg font-black uppercase tracking-tight text-white">
                112 SUL - 21/06 as 07h
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end text-sm font-bold text-sky-100/70 md:text-right">
            <p>3km até a estação 108</p>
            <p>4km até a estação 106</p>
            <p className="mt-2 text-xs font-medium opacity-80 text-sky-200">
              Leve sua canga. O café depois do treino faz parte da experiência.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
