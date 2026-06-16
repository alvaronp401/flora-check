import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import atleta1 from '../../../assets/atleta1.png'
import atleta2 from '../../../assets/atleta2.png'
import atleta3 from '../../../assets/atleta3.png'
import type { EventStatus } from '../types'

interface FooterCTAProps {
  eventId: string
  eventStatus: EventStatus | null
  slug?: string
}

export const FooterCTA: React.FC<FooterCTAProps> = ({ eventId, eventStatus, slug }) => {
  const isEixao = slug === 'alongamento-corrida-eixao-sul' || eventStatus?.slug === 'alongamento-corrida-eixao-sul'
  const available = eventStatus?.available ?? 0
  const accentClassName = isEixao ? 'text-sky-300' : 'text-[#D4B996]'
  const footerClassName = isEixao ? 'bg-[#031024]' : 'bg-[#1A0F0A]'
  const ctaClassName = isEixao ? '!bg-sky-300 !text-[#06172E] hover:!bg-white' : ''

  return (
    <footer className={`relative overflow-hidden border-t border-white/5 py-24 ${footerClassName}`}>
      <div className="absolute left-1/4 top-0 -z-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className={`absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full blur-[120px] ${isEixao ? 'bg-sky-300/10' : 'bg-[#D4B996]/10'}`} />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="mb-10 inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-sm">
          <div className="flex -space-x-3">
            {[atleta1, atleta2, atleta3].map((atleta, i) => (
              <img
                key={i}
                src={atleta}
                className={`h-8 w-8 rounded-full border-2 object-cover ${isEixao ? 'border-[#031024]' : 'border-[#1A0F0A]'}`}
                alt="Participante"
                loading="lazy"
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            + de 20 participantes confirmados
          </p>
        </div>

        <h2 className="mb-8 text-4xl font-black uppercase leading-none tracking-tighter text-white md:text-7xl">
          {isEixao ? 'DOMINGO COM MOVIMENTO' : 'A PROXIMA SUPERACAO'} <br />
          {isEixao ? 'E CAFE ' : 'E A '}<span className={accentClassName}>{isEixao ? 'JUNTO' : 'SUA'}</span>
        </h2>

        <p className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-gray-400 md:text-xl">
          {isEixao
            ? 'Garanta sua vaga no Aulao do Eixao Sul e venha viver uma manha leve, ativa e coletiva.'
            : eventStatus?.slug === 'trail-run-flona-2026'
              ? 'As vagas sao limitadas. Garanta seu kit exclusivo e faca parte da Founder Edition no coracao da FLONA.'
              : `As vagas sao limitadas. Garanta sua participacao no ${eventStatus?.title || 'evento'} e faca parte dessa experiencia unica.`}
        </p>

        <div className="flex flex-col items-center gap-6">
          {available > 0 ? (
            <Link to={`/checkout?eventId=${eventId}`} className="inline-block w-full md:w-auto">
              <Button variant="secondary" pulse showShimmer className={`w-full px-16 py-6 text-xl shadow-2xl md:w-auto ${ctaClassName}`}>
                {isEixao ? 'QUERO IR PARA O AULAO' : 'QUERO ME INSCREVER AGORA'}
              </Button>
            </Link>
          ) : (
            <div className="w-full cursor-not-allowed opacity-50 md:w-auto">
              <Button variant="secondary" className="w-full bg-gray-600 px-16 py-6 text-xl grayscale border-gray-500 shadow-none md:w-auto">
                INSCRICOES ENCERRADAS
              </Button>
            </div>
          )}
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] animate-pulse ${accentClassName}`}>
            {available > 0 ? `Apenas ${available} vagas restantes` : 'Lote final esgotado'}
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-20 flex max-w-6xl flex-col items-center gap-8 border-t border-white/10 px-6 pt-10">
        <p className="text-center text-[9px] font-bold uppercase leading-loose tracking-widest text-gray-500 md:text-[10px]">
          2026 Trail & Run Club - CNPJ: 63.031.213/0001-09 <br /> Todos os direitos reservados
        </p>

        <div className="flex flex-col items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 md:flex-row md:gap-12">
          <div className="flex gap-8">
            <Link to="/terms" className="transition-colors hover:text-white">Termos de Uso</Link>
            <Link to="/privacy" className="transition-colors hover:text-white">Privacidade</Link>
          </div>
          <a
            href="https://instagram.com/eualvaronoronha"
            target="_blank"
            rel="noopener noreferrer"
            className={`border-t border-white/10 pt-6 text-center transition-colors md:border-l md:border-t-0 md:pl-12 md:pt-0 md:text-left ${isEixao ? 'hover:text-sky-300' : 'hover:text-[#D4B996]'}`}
          >
            Desenvolvido por: <span className={`font-black ${accentClassName}`}>@eualvaronoronha</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
