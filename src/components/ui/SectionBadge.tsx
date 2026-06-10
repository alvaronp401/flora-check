// ─────────────────────────────────────────────────────────────────────────────
// 📌 SectionBadge — Componente Reutilizável
//
// POR QUÊ existe? Porque em toda página de evento repetimos o mesmo padrão:
//   <div className="inline-flex items-center gap-2 px-4 ...">
//     <Icon /> Texto do badge
//   </div>
//
// Regra Clean Code: "Don't Repeat Yourself" (DRY).
// Se o estilo do badge mudar, mudamos AQUI e reflete em TODA a aplicação.
//
// COMO USAR:
//   <SectionBadge icon={Leaf}>04 de Junho · Domingo</SectionBadge>
//   <SectionBadge icon={Star} variant="gold">1º Lote · Sorteio</SectionBadge>
// ─────────────────────────────────────────────────────────────────────────────
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface SectionBadgeProps {
  /** Ícone do lucide-react. Passe o componente, não o JSX: icon={Leaf} e não icon={<Leaf />} */
  icon?: LucideIcon
  /** Conteúdo de texto ou JSX dentro do badge */
  children: ReactNode
  /** 'green' = padrão verde | 'gold' = dourado para sorteio/destaque */
  variant?: 'green' | 'gold'
}

export function SectionBadge({ icon: Icon, children, variant = 'green' }: SectionBadgeProps) {
  const styles = {
    green: 'bg-green-900/30 border-green-500/20 text-green-400',
    gold:  'bg-yellow-900/30 border-yellow-500/20 text-yellow-400',
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${styles[variant]}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </div>
  )
}
