import React from 'react'
import { Link } from 'react-router-dom'
import johnImg from '../../../assets/colaborador1.png'
import aleImg from '../../../assets/colaborador3.png'
import { PartnersCarousel } from './PartnersCarousel'
import { ConfirmedAthletesCarousel } from './ConfirmedAthletesCarousel'

const eventSchedules: Record<string, { time: string; event: string }[]> = {
  'trail-run-flona-2026': [
    { time: '07:00', event: 'Coffee break & Check-in' },
    { time: '07:20', event: 'Palestra Saude Mental - Prof. Jairon Pinheiro' },
    { time: '07:40', event: 'Aula de Ginastica - Jonathas Armiliato' },
    { time: '08:20', event: 'Trilha 6km (Leve/Iniciantes) - Alessandra Sousa' },
    { time: '09:40', event: 'Sorteio e divulgacao de parceiros' },
    { time: '10:00', event: 'Encerramento' },
  ],
  'toneis-13-06': [
    { time: 'A definir', event: 'Check-in e briefing dos atletas' },
    { time: 'A definir', event: 'Aquecimento coletivo nos Toneis' },
    { time: 'A definir', event: 'Inicio da corrida de trilha / Check-out' },
    { time: 'A definir', event: 'Encerramento da atividade nos Toneis' },
  ],
  'treino-jonathas-aguas-claras': [
    { time: 'A definir', event: 'Recepcao e alongamento inicial' },
    { time: 'A definir', event: 'Treino tecnico de subida/descida com Jonathas' },
    { time: 'A definir', event: 'Encerramento e feedback do treinador' },
  ],
  'alongamento-corrida-eixao-sul': [
    { time: '07:00', event: 'Concentração na 112 SUL' },
    { time: '07:30', event: 'Início: Alongamento e Corrida/Caminhada' },
    { time: '09:30', event: 'Sorteios de parceiros e Café coletivo' },
    { time: '10:00', event: 'Encerramento e fotos' },
  ],
  'poco-azul-28-06': [
    { time: 'A definir', event: 'Encontro na entrada do Poco Azul & Check-in' },
    { time: 'A definir', event: 'Briefing e alongamento pre-trilha' },
    { time: 'A definir', event: 'Inicio do percurso de Trilha / Corrida de Aventura' },
    { time: 'A definir', event: 'Retorno, banho de poco (opcional) e confraternizacao' },
    { time: 'A definir', event: 'Encerramento oficial' },
  ],
}

const instructors = [
  {
    name: 'Jonathas Armiliato',
    handle: '@jonathastreinador',
    image: johnImg,
  },
  {
    name: 'Ale Adventuree',
    handle: '@Ale_adventuree',
    image: aleImg,
  },
]

interface ScheduleProps {
  eventId: string
  slug: string
}

export const Schedule: React.FC<ScheduleProps> = ({ eventId, slug }) => {
  const isEixao = slug === 'alongamento-corrida-eixao-sul'
  const currentSchedule = eventSchedules[slug] || eventSchedules['trail-run-flona-2026']
  const currentInstructors = isEixao ? instructors.slice(0, 1) : instructors
  const accentClassName = isEixao ? 'text-sky-600' : 'text-blue-600'
  const instructorTitleClassName = isEixao ? 'text-sky-700' : 'text-[#D4B996]'

  return (
    <section className={`${isEixao ? 'bg-sky-50' : 'bg-slate-50'} py-24 md:py-32`}>
      <ConfirmedAthletesCarousel eventId={eventId} accentClassName={isEixao ? 'text-sky-700' : 'text-[#D4B996]'} />

      <div className="mx-auto mt-16 max-w-4xl px-6">
        <h2 className="mb-16 text-center text-3xl font-black uppercase tracking-tighter md:text-5xl">
          Programacao <span className={accentClassName}>Oficial</span>
        </h2>

        <div className="mb-24 space-y-4">
          {currentSchedule.map((item, i) => (
            <div
              key={i}
              className={`flex flex-col gap-2 rounded-3xl border bg-white p-6 transition-all md:flex-row md:items-center md:gap-8 ${isEixao ? 'border-sky-100 shadow-sm shadow-sky-900/5 hover:border-sky-200' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <span className={`min-w-[80px] text-xl font-black ${accentClassName}`}>
                {item.time}
              </span>
              <span className="text-lg font-bold uppercase tracking-tight text-slate-800 md:text-xl">
                {item.event}
              </span>
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col items-center">
          <h3 className={`mb-20 flex w-full flex-col items-center pl-[0.4em] text-center text-xl font-black uppercase leading-none tracking-[0.4em] md:text-3xl ${instructorTitleClassName}`}>
            <span>Conheca os</span>
            <span>instrutores</span>
          </h3>

          <div className="flex w-full justify-center gap-12 md:gap-32">
            {currentInstructors.map((instr) => (
              <a
                key={instr.handle}
                href={`https://instagram.com/${instr.handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-32 flex-col items-center md:w-40"
              >
                <div className={`relative mb-6 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-xl ring-4 transition-transform duration-500 group-hover:scale-105 md:h-32 md:w-32 ${isEixao ? 'ring-sky-100' : 'ring-blue-50'}`}>
                  {instr.image ? (
                    <img
                      src={instr.image}
                      alt={instr.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-3xl font-black text-slate-300">
                      {instr.name[0]}
                    </div>
                  )}
                  <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 ${isEixao ? 'bg-sky-500/10' : 'bg-blue-600/10'}`} />
                </div>
                <span className="mb-2 text-center text-sm font-black uppercase leading-tight tracking-widest text-slate-900">
                  {instr.name}
                </span>
                <span className={`text-center text-[10px] font-bold uppercase tracking-widest opacity-60 transition-opacity group-hover:opacity-100 ${accentClassName}`}>
                  {instr.handle}
                </span>
              </a>
            ))}
          </div>

          {/* Comentado pois os parceiros foram movidos para o FooterCTA
          <PartnersCarousel />
          */}

          <div className="mt-8 flex w-full flex-col items-center border-t border-slate-100 pb-4 pt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Leia os <Link to="/terms" className={`${accentClassName} underline`}>termos de uso</Link> e <Link to="/privacy" className={`${accentClassName} underline`}>privacidade</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
