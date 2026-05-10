const schedule = [
  { time: '07:00', activity: 'Coffee break e networking' },
  { time: '07:20', activity: 'Palestra sobre saúde mental com Jairon Pinheiro' },
  { time: '07:40', activity: 'Aula de ginástica com Jonathas Treinador' },
  { time: '08:20', activity: 'Trilha leve de 6 km com Alessandra Sousa' },
  { time: '09:40', activity: 'Sorteios e ativações de parceiros' },
  { time: '10:00', activity: 'Encerramento' },
]

export function ScheduleCard() {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-5 mb-8">
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Cronograma do Evento</h2>
        <p className="text-xs text-[#1A0F0A] font-black tracking-tight">Trail Run Club Brasília</p>
      </div>

      <div className="space-y-2.5">
        {schedule.map((item, index) => (
          <div key={index} className="flex items-center gap-3 group">
            <span className="text-[11px] font-black text-[#1A0F0A] tabular-nums w-10 shrink-0">
              {item.time}
            </span>
            <span className="w-1.5 h-px bg-gray-100" />
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-[#1A0F0A] transition-colors">
              {item.activity}
            </h3>
          </div>
        ))}
      </div>

      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mt-2">
        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
          "A expectativa é de que o <span className="text-[#1A0F0A] font-black">Trail Run Club</span> se torne um movimento recorrente em Brasília, reunindo pessoas interessadas em bem-estar, natureza e qualidade de vida."
        </p>
      </div>
    </div>
  )
}
