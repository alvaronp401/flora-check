import React from 'react'
import { Link } from 'react-router-dom'
import johnImg from '../../../assets/colaborador1.png'
import aleImg from '../../../assets/colaborador3.png'
import { PartnersCarousel } from './PartnersCarousel'
import { ConfirmedAthletesCarousel } from './ConfirmedAthletesCarousel'

const eventSchedules: Record<string, { time: string; event: string }[]> = {
  'trail-run-flona-2026': [
    { time: '07:00', event: 'Coffee break & Check-in' },
    { time: '07:20', event: 'Palestra Saúde Mental - Prof. Jairon Pinheiro' },
    { time: '07:40', event: 'Aula de Ginástica - Jonathas Treinador' },
    { time: '08:20', event: 'Trilha 6km (Leve/Iniciantes) - Alessandra Sousa' },
    { time: '09:40', event: 'Sorteio e divulgação de parceiros' },
    { time: '10:00', event: 'Encerramento' },
  ],
  'toneis-13-06': [
    { time: 'A definir', event: 'Check-in e briefing dos atletas' },
    { time: 'A definir', event: 'Aquecimento coletivo nos Tonéis' },
    { time: 'A definir', event: 'Início da corrida de trilha / Check-out' },
    { time: 'A definir', event: 'Encerramento da atividade nos Tonéis' }
  ],
  'treino-jonathas-aguas-claras': [
    { time: 'A definir', event: 'Recepção e alongamento inicial' },
    { time: 'A definir', event: 'Treino técnico de subida/descida com Jonathas' },
    { time: 'A definir', event: 'Encerramento e feedback do treinador' }
  ],
  'alongamento-corrida-eixao-sul': [
    { time: 'A definir', event: 'Ponto de encontro no Eixão Sul' },
    { time: 'A definir', event: 'Alongamento com Jonathas Treinador' },
    { time: 'A definir', event: 'Corrida/Caminhada de 5km' },
    { time: 'A definir', event: 'Café da manhã coletivo & Socialização com seu Pet' },
    { time: 'A definir', event: 'Encerramento da atividade' }
  ],
  'poco-azul-28-06': [
    { time: 'A definir', event: 'Encontro na entrada do Poço Azul & Check-in' },
    { time: 'A definir', event: 'Briefing e alongamento pré-trilha' },
    { time: 'A definir', event: 'Início do percurso de Trilha / Corrida de Aventura' },
    { time: 'A definir', event: 'Retorno, banho de poço (opcional) e confraternização' },
    { time: 'A definir', event: 'Encerramento oficial' }
  ]
};

const instructors = [
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
]

interface ScheduleProps {
  eventId: string
  slug: string
}

export const Schedule: React.FC<ScheduleProps> = ({ eventId, slug }) => {
  const currentSchedule = eventSchedules[slug] || eventSchedules['trail-run-flona-2026']

  return (
    <section className="bg-slate-50 py-24 md:py-32">
      {/* 🏃‍♂️ Injeção do Carrossel de Atletas Confirmados (Horizontal) antes da cronologia e do título */}
      <ConfirmedAthletesCarousel eventId={eventId} />

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl md:text-5xl font-black uppercase mb-16 tracking-tighter text-center">
          Programação <span className="text-blue-600">Oficial</span>
        </h2>
        
        <div className="space-y-4 mb-24">
          {currentSchedule.map((item, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 bg-white p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all">
              <span className="text-xl font-black text-blue-600 min-w-[80px]">
                {item.time}
              </span>
              <span className="text-lg md:text-xl font-bold text-slate-800 uppercase tracking-tight">
                {item.event}
              </span>
            </div>
          ))}
        </div>

        {/* Condutores */}
        <div className="flex flex-col items-center w-full">
          <h3 className="flex flex-col items-center text-xl md:text-3xl font-black uppercase tracking-[0.4em] text-[#D4B996] leading-none mb-20 text-center w-full pl-[0.4em]">
            <span>Conheça os</span>
            <span>instrutores</span>
          </h3>
          <div className="flex justify-center gap-12 md:gap-32 w-full">
            {instructors.map((instr, i) => (
              <a 
                key={i}
                href={`https://instagram.com/${instr.handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center group w-32 md:w-40"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl mb-6 overflow-hidden relative group-hover:scale-105 transition-transform duration-500 ring-4 ring-blue-50">
                  {instr.image ? (
                    <img 
                      src={instr.image} 
                      alt={instr.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-300">
                      {instr.name[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2 text-center leading-tight">
                  {instr.name}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity text-center">
                  {instr.handle}
                </span>
              </a>
            ))}
          </div>
          <PartnersCarousel />
          <div className="mt-8 flex flex-col items-center border-t border-slate-100 pt-8 pb-4 w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Leia os <Link to="/terms" className="text-blue-600 underline">termos de uso</Link> e <Link to="/privacy" className="text-blue-600 underline">privacidade</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
