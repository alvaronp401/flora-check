const { Router } = require('express');
const { Preference } = require('mercadopago');
const { body, validationResult } = require('express-validator');
const { supabase, mpClient } = require('../config/clients');
const { getEventStatus } = require('../services/eventService');
const { finalizeRegistration } = require('../services/registrationService');
const { sensitiveLimiter } = require('../middleware/rateLimit');

const router = Router();

// POST /registrations
// Cria uma inscricao pendente pelo backend para evitar falhas de RLS/anon key no browser.
router.post('/registrations',
  sensitiveLimiter,
  [
    body('eventId').isUUID().withMessage('Evento invalido.'),
    body('fullName').isLength({ min: 3 }).withMessage('Nome muito curto.'),
    body('cpf').isLength({ min: 11 }).withMessage('CPF invalido.'),
    body('email').isEmail().withMessage('E-mail invalido.'),
    body('phone').isLength({ min: 10 }).withMessage('Telefone invalido.'),
    body('emergencyPhone').isLength({ min: 10 }).withMessage('Telefone de emergencia invalido.'),
    body('bloodType').notEmpty().withMessage('Tipo sanguineo obrigatorio.'),
    body('gender').notEmpty().withMessage('Genero obrigatorio.'),
    body('shirtSize').notEmpty().withMessage('Tamanho da camiseta obrigatorio.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        eventId,
        fullName,
        cpf,
        email,
        phone,
        emergencyPhone,
        bloodType,
        gender,
        shirtSize,
        medication
      } = req.body;

      const status = await getEventStatus(eventId);
      if (status.is_sold_out) {
        return res.status(400).json({ error: 'Desculpe, as vagas acabaram de esgotar!' });
      }

      const reservedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('registrations')
        .insert([{
          full_name: fullName,
          cpf,
          email,
          phone,
          emergency_phone: emergencyPhone,
          blood_type: bloodType,
          medication: medication || '',
          gender,
          shirt_size: shirtSize,
          payment_status: 'pending',
          event_id: eventId,
          reserved_until: reservedUntil
        }])
        .select('id')
        .single();

      if (error) throw error;

      res.json({ registrationId: data.id, expires_at: reservedUntil });
    } catch (error) {
      console.error('ERRO AO RESERVAR INSCRICAO:', error);
      res.status(500).json({ error: 'Nao conseguimos reservar sua vaga. Tente novamente.' });
    }
  }
);

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

      // 1. Busca a inscrição para saber a qual evento ela pertence
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .select('event_id')
        .eq('id', registrationId)
        .single();

      if (regError || !registration) {
        return res.status(404).json({ error: 'Inscrição não encontrada.' });
      }

      const eventId = registration.event_id;

      // 🛡️ Verificação atômica de vaga no momento do clique para o evento específico
      const status = await getEventStatus(eventId, registrationId);
      if (status.is_sold_out) {
        return res.status(400).json({ error: 'Desculpe, as vagas acabaram de esgotar!' });
      }

      // 💰 Preço começa no valor do lote atual
      let finalPrice = status.currentLot.price;

      // 🛡️ Soma as taxas obrigatórias (ex: Seguro Aventura)
      if (status.fees && Array.isArray(status.fees)) {
        const feesTotal = status.fees.reduce((acc, fee) => acc + fee.price, 0);
        finalPrice += feesTotal;
      }

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

      // 🛡️ DOUBLE-CHECK ATÔMICO (A Garantia de 100%)
      // Contamos novamente o estoque APÓS a nossa reserva entrar.
      const finalCheck = await getEventStatus(eventId);
      if (finalCheck.occupied > finalCheck.capacity) {
        // Opa! Nós fomos o "51º" a entrar. Vamos desfazer a reserva.
        await supabase
          .from('registrations')
          .update({ reserved_until: null, final_price: null })
          .eq('id', registrationId);
          
        return res.status(400).json({ error: 'Desculpe, as vagas acabaram de esgotar exatamente agora!' });
      }

      // 🏦 Cria preferência no Mercado Pago
      const preference = new Preference(mpClient);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

      const preferenceBody = {
        items: [{
          id: `kit-event-${eventId}`,
          title: `Inscrição - ${status.title || 'Trail & Run Club'}`,
          quantity: 1,
          unit_price: Number(finalPrice.toFixed(2)),
          currency_id: 'BRL'
        }],
      payer: { email, name: fullName },
      external_reference: registrationId,
      payment_methods: {
        installments: 12,
        default_payment_method_id: null
      },
      expires: true,
      date_of_expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      back_urls: {
        success: `${frontendUrl}/success?registrationId=${registrationId}`,
        failure: `${frontendUrl}/checkout`,
        pending: `${frontendUrl}/checkout`
      },
      auto_return: 'approved',
      notification_url: `${backendUrl}/webhook`
    };

    const result = await preference.create({ body: preferenceBody });
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
