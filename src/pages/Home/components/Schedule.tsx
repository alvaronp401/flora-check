import React from 'react'

const schedule = [
  { time: '07:00', event: 'Coffee break & Check-in' },
  { time: '07:20', event: 'Palestra Saúde Mental - Prof. Jairon Pinheiro' },
  { time: '07:40', event: 'Aula de Ginástica - Jonathas Treinador' },
  { time: '08:20', event: 'Trilha 6km (Leve/Iniciantes) - Alessandra Sousa' },
  { time: '09:40', event: 'Sorteio e divulgação de parceiros' },
  { time: '10:00', event: 'Encerramento' },
]

const instructors = [
  { name: 'Jairon Pinheiro', handle: '@profjaironpinheiro' },
  { name: 'Jonathas Treinador', handle: '@jonathastreinador' },
  { name: 'Ale Adventuree', handle: '@Ale_adventuree' }
]

export const Schedule: React.FC = () => {
  return (
    <section className="py-32 px-6 max-w-4xl mx-auto">
      <div className="flex flex-col items-center mb-20">
        <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4">O que vai rolar</span>
        <h2 className="text-4xl md:text-6xl font-black text-center tracking-tight">PROGRAMAÇÃO</h2>
        <div className="w-16 h-2 bg-[#D4B996] mt-8 rounded-full" />
      </div>

      <div className="grid gap-4 md:gap-6 mb-24">
        {schedule.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 md:gap-8 p-4 md:p-8 bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
          >
            <div className="text-sm md:text-xl font-black text-blue-600 bg-blue-50 w-20 md:w-28 py-3 md:py-4 rounded-xl md:rounded-2xl text-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              {item.time}
            </div>
            <div className="text-base md:text-xl font-bold text-gray-700 group-hover:text-black leading-tight">
              {item.event}
            </div>
          </div>
        ))}
      </div>

      {/* Organizadores (Placeholders limpos) */}
      <div className="flex flex-col items-center">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Organizadores</h3>
        <div className="flex justify-center flex-wrap gap-8 md:gap-16">
          {instructors.map((instr, i) => (
            <a 
              key={i} 
              href={`https://instagram.com/${instr.handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 transition-transform hover:-translate-y-2"
            >
              <div className="relative">
                <div className="absolute inset-0 border-2 border-[#D4B996] rounded-full scale-110 opacity-30 group-hover:opacity-100 transition-opacity" />
                
                {/* Círculo Placeholder - Aguardando Foto Real */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-300 shadow-inner group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                  <span className="text-lg font-black uppercase">
                    {instr.name.charAt(0)}
                  </span>
                </div>

              </div>
              <span className="text-[10px] md:text-xs text-slate-500 font-black uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                {instr.handle}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
