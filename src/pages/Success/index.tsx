import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Gzq8Rom45jm9rsFTf81jM5?s=sh&p=i&ilr=1&amv=2'

export default function Success() {
  const [searchParams] = useSearchParams()
  const registrationId = searchParams.get('registrationId')
  
  const [loading, setLoading] = useState(!!registrationId)
  const [regData, setRegData] = useState<any>(null)

  useEffect(() => {
    if (!registrationId) return

    const fetchSuccessData = async () => {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*, events(*)')
          .eq('id', registrationId)
          .single()

        if (error) throw error
        if (data) {
          setRegData(data)
        }
      } catch (err: any) {
        console.error('Erro ao buscar inscrição de sucesso:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSuccessData()
  }, [registrationId])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('pt-BR', { month: 'long' })
    const year = date.getFullYear()
    return `${day} de ${month}, ${year}`
  }

  const eventTitle = regData?.events?.title || 'Trail Run Flona 2026'
  const eventSlug = regData?.events?.slug || 'trail-run-flona-2026'
  const isFlona = eventSlug === 'trail-run-flona-2026'

  const displayDate = regData?.events?.date ? formatDate(regData.events.date) : '06 de Junho, 2026'
  const displayLocation = regData?.events?.location || 'Entrada Principal - FLONA'
  const displayCategory = isFlona ? 'Trail Run Club - 06km' : 'Participação Confirmada'
  const athleteName = regData?.full_name ? `, ${regData.full_name.trim().split(' ')[0]}` : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4B996]/20 border-t-[#D4B996] animate-spin" />
        <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase font-sans">Carregando confirmação...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
        
        {/* Efeito de Confete Visual */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="flex justify-center mb-8">
          <div className="bg-green-50 p-4 rounded-full">
            <CheckCircle2 size={60} className="text-green-500" />
          </div>
        </div>

        <h1 className="text-4xl font-black mb-4 tracking-tight">INSCRIÇÃO CONFIRMADA!</h1>
        <p className="text-gray-500 font-medium mb-10">
          Parabéns{athleteName}! Sua vaga no <span className="font-bold text-[#1A0F0A]">{eventTitle}</span> está garantida. Prepare os tênis para essa grande experiência!
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Calendar className="text-gray-400" size={20} />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Data do Evento</p>
              <p className="font-bold text-sm">{displayDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <MapPin className="text-gray-400" size={20} />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Local de Encontro</p>
              <p className="font-bold text-sm">{displayLocation}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Trophy className="text-gray-400" size={20} />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Sua Categoria</p>
              <p className="font-bold text-sm">{displayCategory}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <a 
            href={WHATSAPP_GROUP_URL} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform"
          >
            Entrar no Grupo Oficial <ArrowRight size={18} />
          </a>
          
          <Link 
            to="/" 
            className="block text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-black transition-colors pt-4"
          >
            Voltar para o Início
          </Link>
        </div>

        <p className="mt-10 text-[9px] text-gray-400 font-medium leading-relaxed">
          Um e-mail de confirmação foi enviado para você. <br />
          Dúvidas? Entre em contato com a organização.
        </p>
      </div>
    </div>
  )
}
