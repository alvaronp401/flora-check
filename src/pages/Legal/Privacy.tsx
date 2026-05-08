import React from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-12 font-bold text-sm uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> VOLTAR PARA O EVENTO
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12 leading-none">
          Política de <span className="text-blue-600">Privacidade</span>
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">1. Coleta de Informações</h2>
            <p className="text-slate-600 leading-relaxed">
              Coletamos apenas os dados essenciais para a sua participação no evento: Nome Completo, E-mail, CPF e Número de Telefone. Essas informações são coletadas no momento da sua inscrição através do nosso formulário seguro.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">2. Uso dos Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              Seus dados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
              <li>Processar o pagamento da inscrição junto ao Mercado Pago.</li>
              <li>Enviar informações logísticas e avisos sobre o evento.</li>
              <li>Garantir o seguro individual de prova para cada atleta.</li>
              <li>Gerenciar a lista de inscritos e entrega de kits.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">3. Compartilhamento de Informações</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Não vendemos ou alugamos seus dados pessoais para terceiros.</strong> O compartilhamento ocorre apenas com parceiros operacionais necessários para a execução do evento, como a plataforma de pagamento (Mercado Pago) e a seguradora do evento.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">4. Segurança dos Pagamentos</h2>
            <p className="text-slate-600 leading-relaxed">
              Não armazenamos os dados do seu cartão de crédito em nosso servidor. Toda a transação financeira é processada de forma criptografada pelo Mercado Pago, garantindo os mais altos padrões de segurança do setor.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">5. Seus Direitos (LGPD)</h2>
            <p className="text-slate-600 leading-relaxed">
              Você tem o direito de solicitar o acesso, correção ou exclusão de seus dados pessoais do nosso banco de dados a qualquer momento, desde que isso não impossibilite a sua participação em um evento já contratado.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
