const { Router } = require('express');
const { Preference } = require('mercadopago');
const { body, validationResult } = require('express-validator');
const { supabase, mpClient } = require('../config/clients');
const { getEventStatus } = require('../services/eventService');
const { finalizeRegistration } = require('../services/registrationService');
const { sensitiveLimiter } = require('../index');

const router = Router();

// 🚀 POST /create-preference
// Valida estoque, aplica cupom, reserva vaga e gera link de pagamento
router.post('/create-preference', 
  sensitiveLimiter,
  [
    body('registrationId').isUUID().withMessage('ID de inscrição inválido.'),
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('fullName').isLength({ min: 3 }).withMessage('Nome muito curto.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { registrationId, email, fullName, couponCode } = req.body;

    // 🛡️ Verificação atômica de vaga no momento do clique
    const status = await getEventStatus();
    if (status.is_sold_out) {
      return res.status(400).json({ error: 'Desculpe, as vagas acabaram de esgotar!' });
    }

    // 💰 Preço começa no valor do lote atual (não mais um valor fixo)
    let finalPrice = status.currentLot.price;

    // 🎟️ Aplica desconto de cupom se válido
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (coupon && coupon.is_active && coupon.used_count < coupon.usage_limit) {
        if (coupon.discount_type === 'percentage') {
          finalPrice -= (finalPrice * coupon.discount_value) / 100;
        } else {
          finalPrice -= coupon.discount_value;
        }
      }
    }

    // 🕒 Reserva a vaga por 15 minutos
    const reservedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        coupon_code: couponCode || null,
        final_price: finalPrice,
        reserved_until: reservedUntil
      })
      .eq('id', registrationId);

    if (updateError) throw updateError;

    // 🏦 Cria preferência no Mercado Pago
    const preference = new Preference(mpClient);
    const body = {
      items: [{
        id: 'kit-trail-run-2024',
        title: 'Inscrição Trail Run Club',
        quantity: 1,
        unit_price: Number(finalPrice.toFixed(2)),
        currency_id: 'BRL'
      }],
      payer: { email, name: fullName },
      external_reference: registrationId,
      back_urls: {
        success: 'https://flora-check.vercel.app/success',
        failure: 'https://flora-check.vercel.app/checkout',
        pending: 'https://flora-check.vercel.app/checkout'
      },
      auto_return: 'approved',
      notification_url: 'https://flora-trail-run-api.onrender.com/webhook'
    };

    const result = await preference.create({ body });
    res.json({ id: result.id, init_point: result.init_point, expires_at: reservedUntil });
  } catch (error) {
    console.error('❌ ERRO NO PAGAMENTO:', error);
    res.status(500).json({ error: 'Erro interno ao gerar pagamento.' });
  }
});

// 🛰️ POST /webhook
// Listener do Mercado Pago — confirma pagamento e dispara finalizeRegistration
router.post('/webhook', async (req, res) => {
  const { query, body } = req;
  const topic = query.topic || (body.data && 'payment');

  try {
    if (topic === 'payment') {
      const paymentId = query.id || body.data.id;

      // Verifica o pagamento diretamente na API do Mercado Pago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const payment = await paymentRes.json();

      if (payment.status === 'approved') {
        await finalizeRegistration(payment.external_reference, payment.transaction_amount, paymentId);
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ [WEBHOOK ERROR]:', error);
    res.status(500).send('Webhook Error');
  }
});

module.exports = router;
