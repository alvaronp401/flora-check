const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Configuração Supabase (Admin)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 💳 Configuração Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições, tente novamente mais tarde.'
});

app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: ['http://localhost:5173', 'https://flora-check.vercel.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 🚀 Criar Preferência de Pagamento
app.post('/create-preference', async (req, res) => {
  try {
    const { registrationId, email, fullName } = req.body;
    const preference = new Preference(client);

    const body = {
      items: [{
        id: 'kit-trail-run-2024',
        title: 'Inscrição Trail Run Club',
        quantity: 1,
        unit_price: 110.00,
        currency_id: 'BRL',
      }],
      payer: { email, name: fullName },
      external_reference: registrationId,
      back_urls: {
        success: 'https://flora-check.vercel.app/success',
        failure: 'https://flora-check.vercel.app/checkout',
        pending: 'https://flora-check.vercel.app/checkout'
      },
      auto_return: 'approved',
      notification_url: 'https://seu-servidor.hostinger.com/webhook', // O MP vai bater aqui! 🔔
    };

    const result = await preference.create({ body });
    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Erro MP:', error);
    res.status(500).json({ error: 'Erro ao gerar pagamento.' });
  }
});

// 🔔 Webhook: O Coração da Automação 🦾
app.post('/webhook', async (req, res) => {
  const { query } = req;
  const topic = query.topic || query.type;

  try {
    if (topic === 'payment') {
      const paymentId = query.id || query['data.id'];
      
      // 1. Consultar o pagamento oficial no MP 🛡️
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === 'approved') {
        const registrationId = paymentData.external_reference;

        // 2. Atualizar o Supabase 💎
        const { error } = await supabase
          .from('registrations')
          .update({ payment_status: 'paid', mercado_pago_id: paymentId.toString() })
          .eq('id', registrationId);

        if (error) throw error;
        console.log(`✅ Inscrição ${registrationId} confirmada via Webhook!`);
      }
    }
    
    res.sendStatus(200); // Responder OK para o MP não tentar de novo
  } catch (error) {
    console.error('Erro Webhook:', error);
    res.sendStatus(500);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor operando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor voando na porta ${PORT}`);
});
