const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_PRICE = 110.00;
const MAX_CAPACITY = 50; // 🚀 LIMITE DEFINIDO PELO MESTRE

// 🛡️ Configuração Supabase (Admin)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: { persistSession: false },
    realtime: { transport: ws },
  }
);

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://flora-check.vercel.app'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}));
app.use(express.json());

// 📊 FUNÇÃO DE CÁLCULO DE VAGAS (LÓGICA SÊNIOR)
async function getEventStatus() {
  const now = new Date().toISOString();
  
  // Contar vagas ocupadas (Pagas OU Reservadas ativas)
  const { data, error } = await supabase
    .from('registrations')
    .select('payment_status, reserved_until');

  if (error) throw error;

  const occupied = data.filter(r => 
    r.payment_status === 'paid' || 
    (r.payment_status === 'pending' && r.reserved_until && new Date(r.reserved_until) > new Date())
  ).length;

  return {
    capacity: MAX_CAPACITY,
    occupied,
    available: Math.max(0, MAX_CAPACITY - occupied),
    is_sold_out: occupied >= MAX_CAPACITY
  };
}

// 📡 ROTA DE STATUS DO EVENTO (PARA HOME E CHECKOUT)
app.get('/event-status', async (req, res) => {
  try {
    const status = await getEventStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar status.' });
  }
});

// 🚀 CRIAR PREFERÊNCIA COM VALIDAÇÃO DE ESTOQUE ATÔMICA
app.post('/create-preference', async (req, res) => {
  try {
    const { registrationId, email, fullName, couponCode } = req.body;
    
    // 🛡️ VERIFICAÇÃO DE VAGA NO MOMENTO DO CLIQUE
    const status = await getEventStatus();
    if (status.is_sold_out) {
      return res.status(400).json({ error: 'Desculpe, as vagas acabaram de esgotar!' });
    }

    let finalPrice = BASE_PRICE;
    if (couponCode) {
      const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).single();
      if (coupon && coupon.is_active && coupon.used_count < coupon.usage_limit) {
        if (coupon.discount_type === 'percentage') finalPrice -= (finalPrice * coupon.discount_value) / 100;
        else finalPrice -= coupon.discount_value;
      }
    }

    // 🕒 RESERVAR A VAGA POR 15 MINUTOS NO MOMENTO DA GERAÇÃO DO LINK
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

    const preference = new Preference(client);
    const body = {
      items: [{ id: 'kit-trail-run-2024', title: 'Inscrição Trail Run Club', quantity: 1, unit_price: Number(finalPrice.toFixed(2)), currency_id: 'BRL' }],
      payer: { email, name: fullName },
      external_reference: registrationId,
      back_urls: { 
        success: 'https://flora-check.vercel.app/success', 
        failure: 'https://flora-check.vercel.app/checkout', 
        pending: 'https://flora-check.vercel.app/checkout' 
      },
      auto_return: 'approved',
      notification_url: "https://flora-trail-run-api.onrender.com/webhook", // 🛰️ Altere para sua URL real de produção
    };
    
    const result = await preference.create({ body });
    res.json({ id: result.id, init_point: result.init_point, expires_at: reservedUntil });
  } catch (error) { 
    console.error('❌ ERRO NO PAGAMENTO:', error);
    res.status(500).json({ error: 'Erro interno.' }); 
  }
});

// [RESTO DAS ROTAS ADMIN MANTIDAS...]
app.get('/admin/coupons', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  try {
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ error: 'Acesso negado.' });
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Erro ao listar cupons.' }); }
});

app.post('/admin/coupons', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  const { code, discount_type, discount_value, usage_limit } = req.body;
  try {
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ error: 'Acesso negado.' });
    const { data, error } = await supabase.from('coupons').insert([{ code: code.toUpperCase(), discount_type, discount_value, usage_limit, used_count: 0, is_active: true }]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Erro ao criar.' }); }
});

app.delete('/admin/coupons/:id', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  const { id } = req.params;
  try {
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ error: 'Acesso negado.' });
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    res.sendStatus(200);
  } catch (error) { res.status(500).json({ error: 'Erro ao excluir.' }); }
});

app.get('/admin/registrations', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  const authHeader = req.headers['authorization'];
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  try {
    if (!authHeader) throw new Error();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Sessão inválida.' });
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ error: 'Chave inválida.' });

    // 📊 Busca com Range e Contagem Total
    const { data, error, count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    const stats = { 
      total: count, 
      paid: data.filter(r => r.payment_status === 'paid').length, // Nota: stats reais viriam de uma query separada em prod
      pending: data.filter(r => r.payment_status === 'pending').length, 
      revenue: data.filter(r => r.payment_status === 'paid').reduce((acc, curr) => acc + (Number(curr.final_price) || 110), 0) 
    };

    res.json({ stats, registrations: data, totalPages: Math.ceil(count / limit), currentPage: page });
  } catch (error) { res.status(500).json({ error: 'Erro ao listar inscritos.' }); }
});

// 🛰️ WEBHOOK: O VIGIA DE PAGAMENTOS (MODO SENIOR)
app.post('/webhook', async (req, res) => {
  const { query, body } = req;
  const topic = query.topic || (body.data && 'payment'); // MP manda de formas variadas

  try {
    if (topic === 'payment') {
      const paymentId = query.id || body.data.id;
      
      // 🕵️‍♂️ Busca detalhes reais no Mercado Pago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const payment = await paymentRes.json();

      if (payment.status === 'approved') {
        const registrationId = payment.external_reference;

        // 1. Busca a inscrição no Supabase
        const { data: reg } = await supabase.from('registrations').select('*').eq('id', registrationId).single();
        
        if (reg && reg.payment_status !== 'paid') {
          // 2. Marca como Pago e garante a vaga (reserva estendida)
          await supabase.from('registrations')
            .update({ 
              payment_status: 'paid', 
              reserved_until: '2099-12-31T23:59:59Z', 
              final_price: payment.transaction_amount 
            })
            .eq('id', registrationId);

          // 3. Se usou cupom, agora sim incrementamos o uso! 🎟️💸
          if (reg.coupon_code) {
            const { data: coupon } = await supabase.from('coupons').select('*').eq('code', reg.coupon_code).single();
            if (coupon) {
              await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('id', coupon.id);
            }
          }
          console.log(`✅ [WEBHOOK] Pagamento Aprovado: Reg #${registrationId} | Valor: R$ ${payment.transaction_amount}`);
        }
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ [WEBHOOK ERROR]:', error);
    res.status(500).send('Webhook Error');
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor com Webhook e Limite de 50 Vagas na porta ${PORT}`));
