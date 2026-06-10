// ─────────────────────────────────────────────────────────────────────────────
// 📌 HighlightCard — Card de Métrica/Destaque Reutilizável
//
// POR QUÊ? Em toda landing de evento temos uma grade 2x2 de "highlights":
//   Distância | Nível | Vagas | Valor
//
// Ao componentizar, garantimos que:
//   1. O mesmo visual aparece em TODOS os eventos
//   2. Se quisermos mudar o design, mudamos em 1 lugar
//
// COMO USAR:
//   <HighlightCard icon={Mountain} label="Distância" value="12 km" />
// ─────────────────────────────────────────────────────────────────────────────
import type { LucideIcon } from 'lucide-react'

interface HighlightCardProps {
  /** Ícone do lucide-react */
  icon: LucideIcon
  /** Rótulo pequeno acima do valor. Ex: "Distância", "Nível" */
  label: string
  /** Valor em destaque. Ex: "12 km", "R$ 30,00" */
  value: string
}

export function HighlightCard({ icon: Icon, label, value }: HighlightCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
      {/* Ícone encapsulado — mesmo tamanho e cor sempre */}
      <div className="w-8 h-8 rounded-xl bg-green-900/40 border border-green-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-green-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
        <p className="text-sm font-black text-white">{value}</p>
      </div>
    </div>
  )
}
