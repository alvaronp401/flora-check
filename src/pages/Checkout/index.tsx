import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { ShieldCheck, CreditCard, Landmark, ArrowLeft, Info } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

/**
 * ESQUEMA DE VALIDAÇÃO 🛡️
 */
const checkoutSchema = yup.object({
  fullName: yup.string()
    .required('O nome completo é obrigatório')
    .min(5, 'Digite seu nome completo'),
  birthDate: yup.string()
    .required('Data de nascimento é obrigatória'),
  email: yup.string()
    .email('Digite um e-mail válido')
    .required('O e-mail é obrigatório'),
  gender: yup.string()
    .oneOf(['masculino', 'feminino'], 'Selecione o gênero')
    .required('Campo obrigatório'),
  size: yup.string()
    .oneOf(['PP', 'P', 'M', 'G', 'GG'], 'Selecione o tamanho')
    .required('Campo obrigatório'),
  lgpdConsent: yup.boolean()
    .oneOf([true], 'Você precisa aceitar os termos de privacidade')
}).required()

interface ICheckoutForm {
  fullName: string;
  birthDate: string;
  email: string;
  gender: 'masculino' | 'feminino' | '';
  size: 'PP' | 'P' | 'M' | 'G' | 'GG' | '';
  lgpdConsent: boolean;
}

export default function Checkout() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ICheckoutForm>({
    resolver: yupResolver(checkoutSchema) as any
  })

  const onSubmit = async (data: ICheckoutForm) => {
    console.log('Finalizando com:', data)
    alert('Redirecionando para o Mercado Pago...')
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-8 font-bold text-sm uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Voltar para o evento
        </Link>

        <div className="grid md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <div className="mb-10">
                <h1 className="text-4xl font-black mb-2 tracking-tight">FINALIZAR INSCRIÇÃO</h1>
                <p className="text-gray-400 font-medium">Garanta seu kit Founder Edition.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="grid gap-6">
                  <Input 
                    label="Nome Completo"
                    {...register('fullName')}
                    error={errors.fullName?.message}
                    placeholder="Como no seu documento"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Data Nascimento"
                      type="date"
                      {...register('birthDate')}
                      error={errors.birthDate?.message}
                    />
                    <Input 
                      label="E-mail"
                      type="email"
                      {...register('email')}
                      error={errors.email?.message}
                      placeholder="onde@voce.recebe.tudo"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Configuração do Kit</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                      <span className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1 block">Gênero</span>
                      <select 
                        {...register('gender')}
                        className={`w-full rounded-xl border-gray-100 shadow-sm p-4 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all ${errors.gender ? 'border-red-500' : 'border-gray-200'}`}
                      >
                        <option value="">Escolha...</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                      </select>
                      {errors.gender && <span className="text-red-500 text-[10px] font-bold uppercase mt-1 block">{errors.gender.message}</span>}
                    </label>

                    <label className="block">
                      <span className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1 block">Tamanho</span>
                      <select 
                        {...register('size')}
                        className={`w-full rounded-xl border-gray-100 shadow-sm p-4 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all ${errors.size ? 'border-red-500' : 'border-gray-200'}`}
                      >
                        <option value="">Escolha...</option>
                        <option value="PP">PP</option>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                      </select>
                      {errors.size && <span className="text-red-500 text-[10px] font-bold uppercase mt-1 block">{errors.size.message}</span>}
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <label className="flex gap-4 cursor-pointer">
                    <input 
                      {...register('lgpdConsent')}
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500 font-medium leading-relaxed">
                      Concordo com os <a href="#" className="text-blue-600 underline">Termos de Uso</a> e autorizo o processamento dos meus dados conforme a <strong>LGPD</strong> para fins de organização do evento.
                    </span>
                  </label>
                  {errors.lgpdConsent && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{errors.lgpdConsent.message}</p>}
                </div>

                <Button 
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full py-6 text-xl shadow-2xl shadow-blue-600/20"
                >
                  PAGAR R$ 110,00
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#4B2C20] text-white p-8 rounded-[40px] shadow-2xl sticky top-8">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-[#D4B996] mb-8">Meu Pedido</h4>
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                <span className="font-bold">Inscrição Trail Run Club</span>
                <span className="font-black">R$ 110,00</span>
              </div>
              <div className="flex justify-between items-center mb-10">
                <span className="text-lg font-black uppercase text-[#D4B996]">Total</span>
                <span className="text-4xl font-black">R$ 110,00</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-black bg-white/5 p-4 rounded-2xl text-green-400">
                  <ShieldCheck size={20} /> AMBIENTE 100% SEGURO
                </div>
                <div className="flex justify-center gap-6 opacity-40">
                   <CreditCard size={24} />
                   <Landmark size={24} />
                </div>
              </div>

              <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="flex gap-3">
                   <Info className="text-[#D4B996] shrink-0" size={18} />
                   <p className="text-[10px] text-gray-400 font-medium leading-tight">
                     Seus dados são protegidos por criptografia de nível bancário. Processado por <strong>Mercado Pago</strong>.
                   </p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
