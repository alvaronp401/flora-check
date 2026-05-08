const { supabase } = require('../config/clients');

// 🏆 FUNÇÃO MESTRE: Executa o fluxo completo após pagamento aprovado
// Usada pelo Webhook (Mercado Pago) E pelo botão de confirmação manual (Admin)
async function finalizeRegistration(registrationId, amount, paymentId = 'manual_admin') {
  // 1. Busca a inscrição no Supabase para garantir que existe e não está paga
  const { data: reg } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single();

  // Guarda de segurança: não processa duas vezes
  if (!reg || reg.payment_status === 'paid') return false;

  // 2. Marca como Pago e estende a reserva indefinidamente
  await supabase
    .from('registrations')
    .update({
      payment_status: 'paid',
      reserved_until: '2099-12-31T23:59:59Z',
      final_price: amount
    })
    .eq('id', registrationId);

  // 3. Incrementa o contador de uso do cupom (se houver)
  if (reg.coupon_code) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', reg.coupon_code)
      .single();

    if (coupon) {
      await supabase
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id);
    }
  }

  // 📧 [ESPAÇO PARA RESEND / NOTA FISCAL]
  // Aqui você plugará o e-mail de boas-vindas e a geração de nota fiscal
  console.log(`🚀 [SISTEMA] Disparando e-mail de boas-vindas para: ${reg.email}`);
  console.log(`🧾 [SISTEMA] Gerando nota fiscal para: ${reg.full_name}`);
  // Exemplo futuro: await resend.emails.send({ to: reg.email, ... })
  // Exemplo futuro: await emitirNota(reg)

  console.log(`✅ [SUCESSO] Inscrição #${registrationId} finalizada via: ${paymentId}`);
  return true;
}

module.exports = { finalizeRegistration };
