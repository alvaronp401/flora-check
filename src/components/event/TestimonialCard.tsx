// ─────────────────────────────────────────────────────────────────────────────
// 📌 TestimonialCard — Card de Depoimento
//
// POR QUÊ? Toda landing de evento vai ter depoimentos.
// Ao componentizar, cada evento só precisa passar os DADOS (nome, texto, stars),
// e o visual é sempre consistente.
//
// PRINCÍPIO: "Separation of concerns" — os dados ficam na page, o visual aqui.
//
// COMO USAR:
//   <TestimonialCard
//     name="Thainara"
//     text="Eu ADOREI!"
//     stars={5}
//     role="Atleta Founder"   // opcional, padrão = "Atleta Founder"
//   />
// ─────────────────────────────────────────────────────────────────────────────
import { Star } from 'lucide-react'

interface TestimonialCardProps {
  name: string
  text: string
  stars?: number
  /** Título abaixo do nome. Ex: 'Atleta Founder', 'Participante' */
  role?: string
}

export function TestimonialCard({ name, text, stars = 5, role = 'Atleta Founder' }: TestimonialCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-green-500/20 transition-all">
      {/* Estrelas */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-green-400 fill-green-400" />
        ))}
      </div>

      {/* Texto do depoimento */}
      <p className="text-gray-300 text-sm leading-relaxed font-medium mb-6 italic">
        "{text}"
      </p>

      {/* Avatar e identificação */}
      <div className="flex items-center gap-3">
        {/* Avatar gerado da primeira letra do nome */}
        <div className="w-10 h-10 rounded-full bg-green-900/40 border border-green-500/20 flex items-center justify-center text-sm font-black text-green-400 uppercase">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-xs font-black text-white uppercase tracking-wide">{name}</p>
          <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">{role}</p>
        </div>
      </div>
    </div>
  )
}
