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

  // 🛡️ ÚLTIMA DEFESA: Verifica se o evento lotou enquanto o cara pagava
  const { getEventStatus } = require('./eventService');
  const status = await getEventStatus();
  
  // Se já tem 50 pagos, bloqueia novos
  if (status.paid >= status.capacity) {
    console.error(`🚨 [OVERBOOKING BOCKED] Tentativa de pagamento para evento lotado: ${registrationId}`);
    return false;
  }

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
      // 🛡️ TRAVA DE SEGURANÇA: Só incrementa se ainda houver espaço no cupom
      // Se já passou do limite (ex: 11/10), ele não trava a inscrição (pois o dinheiro já entrou),
      // mas evita que o contador suba indefinidamente.
      if (coupon.used_count < coupon.usage_limit) {
        await supabase
          .from('coupons')
          .update({ used_count: coupon.used_count + 1 })
          .eq('id', coupon.id);
      } else {
        console.warn(`⚠️ [CUPOM ESGOTADO] Cupom ${reg.coupon_code} atingiu o limite, mas a inscrição foi processada.`);
      }
    }
  }

  // 📧 [RESEND] Dispara e-mail de confirmação (Voucher)
  try {
    const { sendVoucherEmail } = require('./emailService');
    await sendVoucherEmail(reg);
  } catch (emailErr) {
    console.error('⚠️ [AVISO] Falha ao enviar e-mail, mas inscrição foi paga:', emailErr);
  }

  console.log(`✅ [SUCESSO] Inscrição #${registrationId} finalizada via: ${paymentId}`);
  return true;
}

module.exports = { finalizeRegistration };
