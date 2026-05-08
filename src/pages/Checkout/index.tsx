import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Ticket, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'

interface ICheckoutForm {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  gender: string;
  shirtSize: string;
  terms: boolean;
}

const checkoutSchema = yup.object({
  fullName: yup.string().required('Nome completo é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (000.000.000-00)'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório').matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (00) 00000-0000'),
  gender: yup.string().required('Selecione o gênero'),
  shirtSize: yup.string().required('Selecione o tamanho da camiseta'),
  terms: yup.boolean().oneOf([true], 'Você deve aceitar os termos'),
}).required()

export default function Checkout() {
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [eventStatus, setEventStatus] = useState({ available: 50, occupied: 0 })
  const navigate = useNavigate() // 🚀 Para redirecionar
  const BASE_PRICE = 110.00

  // 📡 Buscar status e Gerenciar Timer Persistente
  useEffect(() => {
    const fetchStatus = () => {
      fetch('http://localhost:3001/event-status')
        .then(res => res.json())
        .then(data => setEventStatus(data))
        .catch(err => console.error('Erro ao buscar status:', err))
    }
    fetchStatus()
    const intervalStatus = setInterval(fetchStatus, 5000)

    // ⏳ Lógica de Persistência do Timer
    const now = Date.now()
    const savedExpiry = localStorage.getItem('checkout_expiry')
    
    let expiryTime: number
    if (savedExpiry && parseInt(savedExpiry) > now) {
      expiryTime = parseInt(savedExpiry)
    } else {
      expiryTime = now + 600 * 1000 // 10 min a partir de agora
      localStorage.setItem('checkout_expiry', expiryTime.toString())
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000))
      setTimeLeft(remaining)
      
      if (remaining <= 0) {
        localStorage.removeItem('checkout_expiry')
        navigate('/') // 🏃‍♂️ Expulsa para a Home
      }
    }

    updateTimer()
    const timerInterval = setInterval(updateTimer, 1000)

    return () => {
      clearInterval(intervalStatus)
      clearInterval(timerInterval)
    }
  }, [navigate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ICheckoutForm>({
    resolver: yupResolver(checkoutSchema) as any,
    mode: 'onChange'
  })

  const maskCPF = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1')
  }

  const maskPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1')
  }

  const handleApplyCoupon = async () => {
    if (!couponInput) return
    setIsValidatingCoupon(true)
    setCouponError('')
    try {
      const response = await fetch('http://localhost:3001/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      
      setAppliedCoupon({ code: result.code, type: result.discount_type, value: result.discount_value })
      setCouponInput('')
    } catch (err: any) {
      setCouponError('Cupom inválido ou expirado.')
      setAppliedCoupon(null)
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const calculateTotal = () => {
    if (!appliedCoupon) return BASE_PRICE
    return appliedCoupon.type === 'percentage' ? BASE_PRICE - (BASE_PRICE * (appliedCoupon.value / 100)) : Math.max(0, BASE_PRICE - appliedCoupon.value)
  }

  const onSubmit = async (data: ICheckoutForm) => {
    if (timeLeft <= 0) {
      setSubmitError('Sua reserva expirou! Por favor, recarregue a página para tentar uma nova vaga.')
      return
    }
    setSubmitError('')
    try {
      // 🕵️ MODO SEGURO: Ocultar erros reais e mostrar mensagens genéricas
      
      // Validação de e-mail (Ocultar falha de chave de API se houver)
      // 🕵️ Validação de e-mail desativada para testes
      /*
      try {
        const emailResponse = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=SUA_CHAVE_AQUI&email=${data.email}`);
        const emailData = await emailResponse.json();
        if (emailData.deliverability === 'UNDELIVERABLE') {
          throw new Error('E-mail parece inválido.');
        }
      } catch (e) {
        console.log('Validação de email ignorada por config de API.');
      }
      */

      const { data: registration, error } = await supabase
        .from('registrations')
        .insert([{
          full_name: data.fullName,
          cpf: data.cpf,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          shirt_size: data.shirtSize,
          payment_status: 'pending',
          coupon_code: appliedCoupon?.code || null, // 🎟️ Salva para o Webhook processar depois
          reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }])
        .select()
        .single()

      if (error) {
        // 🛡️ NUNCA mostramos o erro de RLS para o usuário
        throw new Error('Serviço temporariamente indisponível. Tente novamente em alguns instantes.');
      }

      const response = await fetch('http://localhost:3001/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.id,
          email: data.email,
          fullName: data.fullName,
          couponCode: appliedCoupon?.code
        })
      })

      const preference = await response.json()
      if (preference.init_point) {
        localStorage.removeItem('checkout_expiry') // 🧹 Limpa para não travar compras futuras
        window.location.href = preference.init_point
      } else {
        throw new Error('Erro ao gerar pagamento.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.');
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-20">
      {/* ⏳ Header de Urgência Fixo */}
      <div className="sticky top-0 z-50 bg-[#1A0F0A] text-white py-3 px-6 shadow-2xl overflow-hidden">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${timeLeft < 60 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reserva Garantida</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-gray-500 font-bold uppercase">Tempo Restante</span>
              <span className={`text-sm font-black tabular-nums ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#D4B996]'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-gray-500 font-bold uppercase">Vagas Restantes</span>
              <span className="text-sm font-black text-white">
                {eventStatus.available} <span className="text-[10px] text-gray-500">/ 50</span>
              </span>
            </div>
          </div>
        </div>
        {/* Barra de Progresso do Tempo */}
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-[#D4B996] transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / 600) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1A0F0A] transition-colors mb-12 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Voltar para Home</span>
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#1A0F0A] mb-4 tracking-tighter uppercase">Finalize sua Inscrição</h1>
          <p className="text-gray-500 font-medium">Garanta seu kit para o maior evento da Flona 2024.</p>
          
          <div className="mt-8 bg-gray-50/50 border border-gray-100 p-6 rounded-3xl">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-black uppercase tracking-widest text-green-700">Pagamento 100% Seguro</span>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Seus dados estão protegidos por criptografia de ponta a ponta. A transação é processada com total segurança e garantia pelo <span className="text-gray-800 font-bold">Mercado Pago</span>.
              </p>
            </div>
          </div>


        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Dados Pessoais</h2>
            <Input label="Nome Completo" placeholder="Como no seu documento" {...register('fullName')} error={errors.fullName?.message} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="CPF" placeholder="000.000.000-00" {...register('cpf')} onChange={(e) => setValue('cpf', maskCPF(e.target.value))} error={errors.cpf?.message} />
              <Input label="Celular" placeholder="(00) 00000-0000" {...register('phone')} onChange={(e) => setValue('phone', maskPhone(e.target.value))} error={errors.phone?.message} />
            </div>
            <Input label="E-mail" type="email" placeholder="seu@email.com" {...register('email')} error={errors.email?.message} />
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Gênero</h2>
              <div className="grid grid-cols-2 gap-4">
                {['Masculino', 'Feminino'].map((g) => (
                  <label key={g} className={`cursor-pointer group relative flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${watch('gender') === g ? 'border-[#1A0F0A] bg-[#1A0F0A]/5' : 'border-gray-50 hover:border-gray-200'}`}>
                    <input type="radio" value={g} {...register('gender')} className="hidden" />
                    <span className={`text-xs font-black uppercase tracking-widest ${watch('gender') === g ? 'text-[#1A0F0A]' : 'text-gray-400'}`}>{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Tamanho da Camiseta</h2>
              <div className="grid grid-cols-5 gap-3">
                {['PP', 'P', 'M', 'G', 'GG'].map((s) => (
                  <label key={s} className={`cursor-pointer flex items-center justify-center h-12 rounded-xl border-2 transition-all ${watch('shirtSize') === s ? 'border-[#1A0F0A] bg-[#1A0F0A]/5' : 'border-gray-50 hover:border-gray-200'}`}>
                    <input type="radio" value={s} {...register('shirtSize')} className="hidden" />
                    <span className={`text-xs font-black uppercase tracking-widest ${watch('shirtSize') === s ? 'text-[#1A0F0A]' : 'text-gray-400'}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Possui um Cupom?</h2>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="text" placeholder="DIGITE SEU CÓDIGO" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-black transition-all text-xs font-black uppercase tracking-widest" />
              </div>
              <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={!couponInput || isValidatingCoupon} className="px-8">
                {isValidatingCoupon ? '...' : 'Aplicar'}
              </Button>
            </div>
            {couponError && <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl animate-in slide-in-from-top-2"><AlertCircle size={14} /><span className="text-[10px] font-black uppercase tracking-widest">{couponError}</span></div>}
            {appliedCoupon && <div className="mt-4 flex items-center justify-between bg-green-50 p-4 rounded-2xl border border-green-100 animate-in zoom-in duration-300"><div className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={20} /><div><p className="text-[10px] font-black uppercase tracking-widest text-green-700">Cupom Aplicado!</p><p className="text-xs font-bold text-green-600">{appliedCoupon.code} (-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `R$ ${appliedCoupon.value}`})</p></div></div><button type="button" onClick={() => setAppliedCoupon(null)} className="text-green-700 hover:scale-110 transition-transform"><X size={18} /></button></div>}
          </div>

          <div className="bg-[#1A0F0A] p-10 rounded-[40px] text-white shadow-2xl space-y-6">
            <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              <span>Inscrição Trail Run</span>
              <span className={appliedCoupon ? 'line-through opacity-50' : ''}>R$ 110,00</span>
            </div>
            {appliedCoupon && <div className="flex justify-between items-center text-green-400 font-bold uppercase tracking-widest text-[10px]"><span>Desconto ({appliedCoupon.code})</span><span>- R$ {(BASE_PRICE - calculateTotal()).toFixed(2)}</span></div>}
            <div className="h-px bg-white/10" />
            <div className="flex justify-between items-end">
              <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total a Pagar</p><p className="text-4xl font-black tracking-tighter">R$ {calculateTotal().toFixed(2)}</p></div>
            </div>
            <div className="space-y-4 pt-4">
              <label className="flex gap-4 cursor-pointer group">
                <input type="checkbox" {...register('terms')} className="mt-1" />
                <span className="text-[10px] text-gray-400 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">
                  Li e aceito os <Link to="/terms" className="text-white underline">Termos de Uso</Link> e a <Link to="/privacy" className="text-white underline">Política de Privacidade</Link> do evento e autorizo o uso dos meus dados.
                </span>
              </label>
              {errors.terms && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{errors.terms.message}</p>}
              {submitError && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl text-red-400 animate-in shake-in duration-300">
                  <ShieldAlert size={20} />
                  <p className="text-[10px] font-black uppercase tracking-widest">{submitError}</p>
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full h-16 text-lg bg-[#D4B996] text-[#1A0F0A] hover:bg-[#E5CBA7] shadow-xl">
                {isSubmitting ? 'Processando...' : 'Ir para o Pagamento'}
              </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
