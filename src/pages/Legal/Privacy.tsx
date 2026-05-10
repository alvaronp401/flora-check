import React, { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Privacy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-12 font-bold text-sm uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> VOLTAR PARA O EVENTO
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12 leading-none">
          Privacidade e <span className="text-blue-600">Proteção de Dados</span>
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">1. Compromisso LGPD</h2>
            <p className="text-slate-600 leading-relaxed">
              Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018), assumimos o compromisso de proteger a sua privacidade e garantir que seus dados pessoais sejam tratados com total transparência e segurança.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">2. Dados Coletados e Finalidade</h2>
            <p className="text-slate-600 leading-relaxed">
              Coletamos apenas os dados estritamente necessários para a viabilização de sua participação no evento:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li><strong>Identificação (Nome e CPF):</strong> Para emissão de apólice de Seguro Aventura e identificação oficial.</li>
              <li><strong>Contato (E-mail e Telefone):</strong> Para envio de comunicados logísticos, avisos de segurança e confirmação de pagamento.</li>
              <li><strong>Saúde (Tipo Sanguíneo e Medicamentos):</strong> Para protocolos de primeiro atendimento em caso de emergência.</li>
              <li><strong>Emergência:</strong> Telefone de terceiro para contato em caso de incidentes.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">3. Compartilhamento Limitado</h2>
            <p className="text-slate-600 leading-relaxed">
              Seus dados pessoais <strong>nunca serão vendidos ou compartilhados</strong> para fins de marketing de terceiros. O compartilhamento ocorre exclusivamente com:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>A seguradora parceira, para fins de ativação da cobertura durante o evento.</li>
              <li>A plataforma de pagamentos, para processamento seguro da transação financeira.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">4. Segurança da Informação</h2>
            <p className="text-slate-600 leading-relaxed">
              Utilizamos tecnologias modernas de criptografia e bancos de dados seguros para impedir acessos não autorizados, garantindo a integridade de suas informações desde o momento do preenchimento do formulário até o término do evento.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">5. Seus Direitos</h2>
            <p className="text-slate-600 leading-relaxed">
              Como titular dos dados, você tem o direito de solicitar a correção ou exclusão de suas informações a qualquer momento através de nossos canais de contato oficiais, ressalvadas as obrigações legais de guarda de documentos após a prestação do serviço.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
