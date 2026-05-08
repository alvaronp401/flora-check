const { Router } = require('express');
const { supabase } = require('../config/clients');
const { adminAuth } = require('../middleware/adminAuth');

const router = Router();

// 📋 GET /admin/coupons — Lista todos os cupons
router.get('/admin/coupons', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar cupons.' });
  }
});

// ➕ POST /admin/coupons — Cria um novo cupom
router.post('/admin/coupons', adminAuth, async (req, res) => {
  const { code, discount_type, discount_value, usage_limit } = req.body;
  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        usage_limit,
        used_count: 0,
        is_active: true
      }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cupom.' });
  }
});

// 🗑️ DELETE /admin/coupons/:id — Remove um cupom
router.delete('/admin/coupons/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir cupom.' });
  }
});

// 🔍 POST /validate-coupon — Valida cupom no Checkout (rota pública)
router.post('/validate-coupon', async (req, res) => {
  const { code } = req.body;
  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) return res.status(404).json({ error: 'Cupom não encontrado.' });
    if (!coupon.is_active) return res.status(400).json({ error: 'Cupom inativo.' });
    if (coupon.used_count >= coupon.usage_limit) return res.status(400).json({ error: 'Cupom esgotado.' });

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao validar cupom.' });
  }
});

module.exports = router;
