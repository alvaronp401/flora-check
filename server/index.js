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
const BASE_PRICE = 110.00;

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

// 🎟️ VALIDAR CUPOM (FRONTEND)
app.post('/validate-coupon', async (req, res) => {
  const { code } = req.body;
  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) return res.status(404).json({ error: 'Cupom inválido.' });
    if (coupon.used_count >= coupon.usage_limit) return res.status(400).json({ error: 'Limite atingido.' });

    res.json({ code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value });
  } catch (err) { res.status(500).json({ error: 'Erro ao validar.' }); }
});

// 🚀 CRIAR PREFERÊNCIA (COM LIMITE GLOBAL RÍGIDO) 🛡️
app.post('/create-preference', async (req, res) => {
  try {
    const { registrationId, email, fullName, couponCode } = req.body;
    let finalPrice = BASE_PRICE;
    let appliedCoupon = null;

    if (couponCode) {
      // Re-verificar no DB no exato momento da compra
      const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).eq('is_active', true).single();
      
      if (coupon && coupon.used_count < coupon.usage_limit) {
        appliedCoupon = coupon.code;
        finalPrice = coupon.discount_type === 'percentage' ? BASE_PRICE - (BASE_PRICE * (coupon.discount_value / 100)) : Math.max(0, BASE_PRICE - coupon.discount_value);
        
        // INCREMENTO ATÔMICO
        await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('id', coupon.id);
      }
    }

    await supabase.from('registrations').update({ applied_coupon: appliedCoupon, final_price: finalPrice }).eq('id', registrationId);

    const preference = new Preference(client);
    const body = {
      items: [{ id: 'kit-trail-run-2024', title: 'Inscrição Trail Run Club', quantity: 1, unit_price: Number(finalPrice.toFixed(2)), currency_id: 'BRL' }],
      payer: { email, name: fullName },
      external_reference: registrationId,
      back_urls: { success: 'https://flora-check.vercel.app/success', failure: 'https://flora-check.vercel.app/checkout', pending: 'https://flora-check.vercel.app/checkout' },
      auto_return: 'approved',
      notification_url: 'https://seu-servidor.hostinger.com/webhook',
    };
    const result = await preference.create({ body });
    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) { res.status(500).json({ error: 'Erro no pagamento.' }); }
});

// 🏰 GESTÃO DE CUPONS (ADMIN ONLY) 🛡️🔐
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
    
    // Verificar se já existe
    const { data: existing } = await supabase.from('coupons').select('id').eq('code', code.toUpperCase()).single();
    if (existing) return res.status(400).json({ error: 'Código já existe.' });

    const { data, error } = await supabase.from('coupons').insert([{
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      usage_limit,
      used_count: 0,
      is_active: true
    }]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Erro ao criar.' }); }
});

// 🗑️ EXCLUIR CUPOM (NOVO!) 🛡️
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

// 🏰 ROTA ADMIN REGISTRATIONS
app.get('/admin/registrations', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  const authHeader = req.headers['authorization'];
  try {
    if (!authHeader) throw new Error();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Sessão inválida.' });
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ error: 'Chave inválida.' });

    const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    const stats = {
      total: data.length,
      paid: data.filter(r => r.payment_status === 'paid').length,
      pending: data.filter(r => r.payment_status === 'pending').length,
      revenue: data.filter(r => r.payment_status === 'paid').reduce((acc, curr) => acc + (Number(curr.final_price) || 110), 0),
      shirts: { PP: 0, P: 0, M: 0, G: 0, GG: 0 }
    };
    res.json({ stats, registrations: data });
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

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
        await supabase.from('registrations').update({ payment_status: 'paid', mercado_pago_id: paymentId.toString() }).eq('id', registrationId);
      }
    }
    res.sendStatus(200);
  } catch (error) { res.sendStatus(500); }
});

app.listen(PORT, () => console.log(`🚀 Fortaleza na porta ${PORT}`));
