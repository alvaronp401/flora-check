const { Router } = require('express');
const { supabase } = require('../config/clients');
const { adminAuth } = require('../middleware/adminAuth');
const { finalizeRegistration } = require('../services/registrationService');

const router = Router();

// 📊 GET /admin/registrations — Lista paginada de inscritos com stats
router.get('/admin/registrations', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  const authHeader = req.headers['authorization'];
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  try {
    // Verifica sessão do usuário autenticado
    if (!authHeader) throw new Error('Token ausente.');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Sessão inválida.' });

    // Verifica chave de admin
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ error: 'Chave inválida.' });
    }

    // Busca com paginação e contagem total
    const { data, error, count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    const stats = {
      total: count,
      paid: data.filter(r => r.payment_status === 'paid').length,
      pending: data.filter(r => r.payment_status === 'pending').length,
      revenue: data
        .filter(r => r.payment_status === 'paid')
        .reduce((acc, curr) => acc + (Number(curr.final_price) || 110), 0)
    };

    res.json({
      stats,
      registrations: data,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar inscritos.' });
  }
});

// ✅ POST /admin/confirm-payment/:id — Confirma pagamento manualmente (dispara fluxo completo)
router.post('/admin/confirm-payment/:id', adminAuth, async (req, res) => {
  try {
    const success = await finalizeRegistration(req.params.id, 110.00, 'admin_button');
    if (success) {
      res.json({ message: 'Pagamento confirmado! Fluxo de e-mail e nota fiscal disparados.' });
    } else {
      res.status(400).json({ error: 'Inscrição já está paga ou não foi encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao confirmar pagamento.' });
  }
});

// 🔄 POST /admin/reset-status/:id — Volta atleta para "pendente" (testes de e-mail/nota)
router.post('/admin/reset-status/:id', adminAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({
        payment_status: 'pending',
        reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Status resetado para pendente! Pronto para novo teste.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resetar status.' });
  }
});

// 🧪 POST /admin/simulate-demand — Cria atletas fantasma para testar lotes
router.post('/admin/simulate-demand', adminAuth, async (req, res) => {
  try {
    const { count } = req.body;
    const dummies = Array.from({ length: count }).map((_, i) => ({
      full_name: `ATLETA TESTE ${i + 1}`,
      email: `teste${i + 1}@flora.com`,
      cpf: '000.000.000-00',
      phone: '(00) 00000-0000',
      gender: 'Masculino',
      shirt_size: 'M',
      payment_status: 'paid',
      reserved_until: '2099-12-31T23:59:59Z'
    }));

    const { error } = await supabase.from('registrations').insert(dummies);
    if (error) throw error;
    res.json({ message: `${count} inscrições simuladas com sucesso!` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao simular demanda.' });
  }
});

// 💣 POST /admin/reset-event — Apaga TODAS as inscrições (apenas para testes)
router.post('/admin/reset-event', adminAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Truque para deletar todas as linhas
    if (error) throw error;
    res.json({ message: 'Evento resetado! Todas as inscrições foram apagadas.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resetar evento.' });
  }
});

module.exports = router;
