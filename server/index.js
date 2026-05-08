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

// 🎟️ VALIDAR CUPOM
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

// 🚀 CRIAR PREFERÊNCIA (COM LOGS DE ERRO) 🛡️
app.post('/create-preference', async (req, res) => {
  try {
    const { registrationId, email, fullName, couponCode } = req.body;
    let finalPrice = BASE_PRICE;
    let appliedCoupon = null;

    console.log(`🚀 Processando pagamento para: ${email} (Ref: ${registrationId})`);

    if (couponCode) {
      const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).eq('is_active', true).single();
      
      if (coupon && coupon.used_count < coupon.usage_limit) {
        appliedCoupon = coupon.code;
        finalPrice = coupon.discount_type === 'percentage' ? BASE_PRICE - (BASE_PRICE * (coupon.discount_value / 100)) : Math.max(0, BASE_PRICE - coupon.discount_value);
        
        await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('id', coupon.id);
      }
    }

    const { error: updateError } = await supabase.from('registrations').update({ applied_coupon: appliedCoupon, final_price: finalPrice }).eq('id', registrationId);
    if (updateError) {
      console.error('❌ Erro ao atualizar inscrição no Supabase:', updateError);
      throw updateError;
    }

    const preference = new Preference(client);
    const body = {
      items: [{ id: 'kit-trail-run-2024', title: 'Inscrição Trail Run Club', quantity: 1, unit_price: Number(finalPrice.toFixed(2)), currency_id: 'BRL' }],
      payer: { email, name: fullName },
      external_reference: registrationId,
      back_urls: { success: 'https://flora-check.vercel.app/success', failure: 'https://flora-check.vercel.app/checkout', pending: 'https://flora-check.vercel.app/checkout' },
      auto_return: 'approved',
    };
    const result = await preference.create({ body });
    console.log('✅ Preferência criada com sucesso!');
    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) { 
    console.error('❌ ERRO CRÍTICO NO SERVIDOR:', error);
    res.status(500).json({ error: 'Erro interno no processamento do pagamento.' }); 
  }
});

// 🏰 GESTÃO DE CUPONS
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
  try {
    if (!authHeader) throw new Error();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Sessão inválida.' });
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) return res.status(401).json({ error: 'Chave inválida.' });
    const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const stats = { total: data.length, paid: data.filter(r => r.payment_status === 'paid').length, pending: data.filter(r => r.payment_status === 'pending').length, revenue: data.filter(r => r.payment_status === 'paid').reduce((acc, curr) => acc + (Number(curr.final_price) || 110), 0) };
    res.json({ stats, registrations: data });
  } catch (error) { res.status(500).json({ error: 'Erro.' }); }
});

app.listen(PORT, () => console.log(`🚀 Fortaleza na porta ${PORT}`));
