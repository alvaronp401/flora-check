const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Configuração Supabase (Admin)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: { persistSession: false },
    realtime: {
      transport: ws,
    },
  }
);

// 💳 Configuração Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

// 🛡️ Rate Limit Agressivo para Admin
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Bloqueio de segurança.'
});

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições.'
});

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://flora-check.vercel.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}));
app.use(express.json());

// 🚀 Criar Preferência de Pagamento
app.post('/create-preference', standardLimiter, async (req, res) => {
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
      notification_url: 'https://seu-servidor.hostinger.com/webhook',
    };

    const result = await preference.create({ body });
    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    res.status(500).json({ error: 'Erro de processamento.' });
  }
});

// 🔔 Webhook
app.post('/webhook', async (req, res) => {
  const { query } = req;
  const topic = query.topic || query.type;
  try {
    if (topic === 'payment') {
      const paymentId = query.id || query['data.id'];
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });
      if (paymentData.status === 'approved') {
        const registrationId = paymentData.external_reference;
        await supabase
          .from('registrations')
          .update({ payment_status: 'paid', mercado_pago_id: paymentId.toString() })
          .eq('id', registrationId);
      }
    }
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

// 🏰 ROTA ADMIN BLINDADA (SILÊNCIO TOTAL) 🛡️🔐
app.get('/admin/registrations', adminLimiter, async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  const authHeader = req.headers['authorization'];

  try {
    if (!authHeader) throw new Error();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ error: 'Chave inválida.' });
    }

    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stats = {
      total: data.length,
      paid: data.filter(r => r.payment_status === 'paid').length,
      pending: data.filter(r => r.payment_status === 'pending').length,
      revenue: data.filter(r => r.payment_status === 'paid').length * 110.00,
      shirts: {
        PP: data.filter(r => r.shirt_size === 'PP').length,
        P: data.filter(r => r.shirt_size === 'P').length,
        M: data.filter(r => r.shirt_size === 'M').length,
        G: data.filter(r => r.shirt_size === 'G').length,
        GG: data.filter(r => r.shirt_size === 'GG').length,
      }
    };

    res.json({ stats, registrations: data });
  } catch (error) {
    res.status(500).json({ error: 'Erro administrativo.' });
  }
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor voando na porta ${PORT}`);
});
