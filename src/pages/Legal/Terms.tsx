import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-12 font-bold text-sm uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> VOLTAR PARA O EVENTO
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12 leading-none">
          Termos de <span className="text-blue-600">Uso</span>
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-slate-600 leading-relaxed">
              Ao realizar sua inscrição no <strong>Trail & Run Club - Founder Edition Brasília</strong>, o participante declara estar ciente e concordar integralmente com as regras e condições estabelecidas neste regulamento.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">2. Responsabilidade sobre a Saúde</h2>
            <p className="text-slate-600 leading-relaxed">
              O participante declara gozar de plena saúde física e mental para a realização de atividades de trilha e corrida de aventura. É de inteira responsabilidade do atleta a realização de exames médicos prévios ao evento. A organização não se responsabiliza por incidentes decorrentes de condições pré-existentes não informadas.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">3. Preservação Ambiental (FLONA)</h2>
            <p className="text-slate-600 leading-relaxed">
              O evento ocorre em uma Unidade de Conservação (Floresta Nacional de Brasília). É estritamente proibido o descarte de qualquer material (garrafas, embalagens de gel, papéis) fora das lixeiras indicadas na área de concentração. O descumprimento acarretará em desclassificação imediata e possíveis sanções dos órgãos ambientais.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">4. Direito de Imagem</h2>
            <p className="text-slate-600 leading-relaxed">
              O participante autoriza, de forma gratuita e definitiva, o uso de sua imagem e voz captadas durante o evento pela organização e seus parceiros, para fins de divulgação em redes sociais, sites e materiais publicitários.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">5. Política de Cancelamento</h2>
            <p className="text-slate-600 leading-relaxed">
              Conforme o Código de Defesa do Consumidor, o reembolso integral da inscrição poderá ser solicitado em até 7 (sete) dias corridos após a compra. Após esse prazo, não haverá devolução de valores em virtude dos custos de logística já empenhados (kit, seguro, reserva de espaço).
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
