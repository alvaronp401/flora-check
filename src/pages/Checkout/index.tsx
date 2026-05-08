import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { validateCPF } from '../../utils/validation'
import { supabase } from '../../lib/supabase'

/**
 * ESQUEMA DE VALIDAÇÃO 🛡️
 */
const checkoutSchema = yup.object({
  fullName: yup.string()
    .required('O nome completo é obrigatório')
    .min(5, 'Digite seu nome completo'),
  cpf: yup.string()
    .required('CPF é obrigatório')
    .test('valid-cpf', 'CPF inválido', (value) => validateCPF(value || '')),
  phone: yup.string()
    .required('Telefone é obrigatório')
    .matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido'),
  birthDate: yup.string()
    .required('Data de nascimento é obrigatória'),
  email: yup.string()
    .email('Digite um e-mail válido')
    .required('O e-mail é obrigatório'),
  gender: yup.string()
    .oneOf(['masculino', 'feminino'], 'Selecione o gênero')
    .required('Selecione o gênero'),
  size: yup.string()
    .oneOf(['PP', 'P', 'M', 'G', 'GG'], 'Selecione o tamanho')
    .required('Selecione o tamanho'),
  lgpdConsent: yup.boolean()
    .oneOf([true], 'Você precisa aceitar os termos')
}).required()

interface ICheckoutForm {
  fullName: string;
  cpf: string;
  phone: string;
  birthDate: string;
  email: string;
  gender: 'masculino' | 'feminino' | '';
  size: 'PP' | 'P' | 'M' | 'G' | 'GG' | '';
  lgpdConsent: boolean;
}

export default function Checkout() {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting, isValid } } = useForm<ICheckoutForm>({
    resolver: yupResolver(checkoutSchema) as any,
    mode: 'onChange'
  })

  const isAccepted = watch('lgpdConsent')
  const selectedGender = watch('gender')
  const selectedSize = watch('size')

  const onSubmit = async (data: ICheckoutForm) => {
    try {
      const { data: registration, error } = await supabase
        .from('registrations')
        .insert([{
          full_name: data.fullName,
          cpf: data.cpf.replace(/\D/g, ''),
          phone: data.phone.replace(/\D/g, ''),
          email: data.email,
          birth_date: data.birthDate,
          gender: data.gender,
          shirt_size: data.size,
          amount: 110.00
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Este CPF já está inscrito! 🏃‍♂️');
        throw error;
      }

      const response = await fetch('http://localhost:3001/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.id,
          email: data.email,
          fullName: data.fullName
        })
      });

      if (!response.ok) throw new Error('Erro ao gerar link de pagamento.');
      const { init_point } = await response.json();
      window.location.href = init_point;
      
    } catch (err: any) {
      alert(err.message || 'Erro ao processar. Tente novamente.');
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-8 px-6">
      <div className="max-w-2xl mx-auto">
        
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-6 font-bold text-sm uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight uppercase">Finalizar Inscrição</h1>
            <p className="text-gray-400 text-sm font-medium mb-4">Ambiente 100% seguro via Mercado Pago.</p>
          </div>

          {/* Resumo do Pedido Compacto */}
          <div className="bg-[#1A0F0A] p-6 rounded-[30px] mb-8 text-white">
            <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-widest text-[#D4B996]">
              <span>Inscrição Trail Run Club</span>
              <span>R$ 110,00</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between items-center">
              <span className="text-xl font-black uppercase italic">Total</span>
              <span className="text-2xl font-black tracking-tighter">R$ 110,00</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <Input label="Nome Completo" {...register('fullName')} error={errors.fullName?.message} placeholder="Como no documento" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="CPF" {...register('cpf')} error={errors.cpf?.message} placeholder="000.000.000-00" />
                <Input label="Telefone / WhatsApp" {...register('phone')} error={errors.phone?.message} placeholder="(61) 99999-9999" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nascimento" {...register('birthDate')} error={errors.birthDate?.message} placeholder="DD/MM/AAAA" maxLength={10} />
                <Input label="E-mail" {...register('email')} error={errors.email?.message} placeholder="seu@email.com" />
              </div>
            </div>

            {/* SELETORES PREMIUM 💎 */}
            <div className="space-y-6 pt-4 border-t border-gray-50">
              {/* Seleção de Gênero */}
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Gênero</span>
                <div className="grid grid-cols-2 gap-3">
                  {['masculino', 'feminino'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setValue('gender', g as any, { shouldValidate: true })}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        selectedGender === g 
                        ? 'bg-[#1A0F0A] text-white border-[#1A0F0A] shadow-lg' 
                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {errors.gender && <span className="text-red-500 text-[10px] font-bold uppercase mt-2 block">{errors.gender.message}</span>}
              </div>

              {/* Seleção de Tamanho */}
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Tamanho da Camiseta</span>
                <div className="flex flex-wrap gap-2">
                  {['PP', 'P', 'M', 'G', 'GG'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setValue('size', s as any, { shouldValidate: true })}
                      className={`w-12 h-12 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center ${
                        selectedSize === s 
                        ? 'bg-[#1A0F0A] text-white border-[#1A0F0A] shadow-md scale-110' 
                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {errors.size && <span className="text-red-500 text-[10px] font-bold uppercase mt-2 block">{errors.size.message}</span>}
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input {...register('lgpdConsent')} type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                <span className="text-[10px] text-gray-500 font-medium group-hover:text-black transition-colors">
                  Aceito os <Link to="/terms" className="underline font-bold">Termos</Link> e <Link to="/privacy" className="underline font-bold">Privacidade</Link>.
                </span>
              </label>
              {errors.lgpdConsent && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase text-center">{errors.lgpdConsent.message}</p>}
            </div>

            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              disabled={!isValid || !isAccepted}
              className={`w-full py-6 text-xl shadow-2xl transition-all duration-500 ${(!isValid || !isAccepted) ? 'opacity-30 grayscale cursor-not-allowed shadow-none' : 'shadow-black/20'}`}
            >
              FINALIZAR E PAGAR
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
