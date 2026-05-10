import React, { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Terms: React.FC = () => {
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
          Termo de Ciência e <span className="text-blue-600">Responsabilidade</span>
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">1. Orientação e Conduta</h2>
            <p className="text-slate-600 leading-relaxed">
              Assumo o compromisso de seguir atentamente todas as orientações fornecidas pelo(s) condutor(es) e pela equipe de organização durante todo o período do evento.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">2. Livre Participação</h2>
            <p className="text-slate-600 leading-relaxed">
              Declaro que minha participação no evento ocorre por minha livre e espontânea vontade, na qualidade de participante, assumindo total responsabilidade por meus atos.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">3. Ciência de Riscos em Meio Rural</h2>
            <p className="text-slate-600 leading-relaxed">
              Tenho plena ciência de que toda atividade relacionada a trilhas em meio rural pode oferecer riscos inerentes (como quedas, animais peçonhentos e variações climáticas). Reconheço que, independentemente da boa orientação e acompanhamento da organização, acidentes podem ocorrer.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">4. Assunção de Responsabilidade</h2>
            <p className="text-slate-600 leading-relaxed">
              Reconheço e assumo livremente todos os riscos, conhecidos ou não, e assumo total responsabilidade civil e criminal por minha participação e integridade física.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">5. Aptidão Física e Idade</h2>
            <p className="text-slate-600 leading-relaxed">
              Atesto estar apto fisicamente para participar deste evento e que sou maior de idade. Menores de idade deverão estar obrigatoriamente acompanhados de seus responsáveis legais, que assumem todas as responsabilidades descritas neste termo.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">6. Limite de Atuação da Organização</h2>
            <p className="text-slate-600 leading-relaxed">
              Reconheço que as atividades dos organizadores restringem-se a contribuir para que a trilha se realize com sucesso, o qual depende e é de responsabilidade exclusiva de seus participantes e de sua conduta individual.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">7. Taxa de Inscrição e Seguro</h2>
            <p className="text-slate-600 leading-relaxed">
              Tenho ciência de que minha participação está condicionada ao pagamento da taxa de <strong>R$ 5,00</strong>, destinada ao custeio operacional e à contratação de seguro aventura individual.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">8. Autorização de Uso de Imagem</h2>
            <p className="text-slate-600 leading-relaxed">
              AUTORIZO o uso de minha imagem (fotos e vídeos) captadas no evento para utilização no Instagram <strong>@calangosecaliandras</strong> e demais canais de comunicação do grupo. Esta autorização é concedida a título gratuito e abrangência nacional.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">9. Desistência e Reembolso</h2>
            <p className="text-slate-600 leading-relaxed">
              Tenho ciência de que, em caso de desistência, o valor investido será devolvido ou mantido como crédito apenas se a vaga for preenchida por outro participante até 24h antes do evento.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-800 mb-4">10. Declaração de Aceite</h2>
            <p className="text-slate-600 leading-relaxed font-bold">
              DECLARO QUE MINHA PARTICIPAÇÃO É VOLUNTÁRIA, QUE ENTENDO E ACEITO TODOS OS RISCOS E TERMOS DESCRITOS, E QUE MEU PAGAMENTO CONFIGURA A MANIFESTAÇÃO DE ACEITE INTEGRAL A ESTE TERMO.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
