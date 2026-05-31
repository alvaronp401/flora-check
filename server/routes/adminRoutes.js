const { Router } = require('express');
const { supabase } = require('../config/clients');
const { adminAuth } = require('../middleware/adminAuth');
const { finalizeRegistration } = require('../services/registrationService');

const router = Router();

// 📊 GET /admin/registrations — Lista paginada de inscritos com stats
router.get('/admin/registrations', adminAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  try {
    // Busca com paginação e contagem total
    const { data, error, count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    // 🛡️ Busca estatísticas REAIS do banco inteiro (não apenas da página atual)
    const { data: allStats, error: statsErr } = await supabase
      .from('registrations')
      .select('payment_status, final_price');

    if (statsErr) throw statsErr;

    // Busca configurações para calcular os lotes
    const { data: settings } = await supabase.from('event_settings').select('*');
    const thresholds = settings?.find(s => s.key === 'lot_thresholds')?.value || { lot1: 15, lot2: 30 };
    
    const paid = allStats.filter(r => r.payment_status === 'paid').length;
    const pending = allStats.filter(r => r.payment_status === 'pending').length;
    const occupied = allStats.filter(r => 
      r.payment_status === 'paid' || 
      (r.payment_status === 'pending' && r.reserved_until && new Date(r.reserved_until) > new Date())
    ).length;

    const stats = {
      total: count,
      paid,
      pending,
      revenue: allStats
        .filter(r => r.payment_status === 'paid')
        .reduce((acc, curr) => acc + (Number(curr.final_price) || 110), 0),
      lots: {
        lot1: { current: Math.min(occupied, thresholds.lot1), max: thresholds.lot1 },
        lot2: { current: Math.max(0, Math.min(occupied - thresholds.lot1, thresholds.lot2 - thresholds.lot1)), max: thresholds.lot2 - thresholds.lot1 },
        lot3: { current: Math.max(0, occupied - thresholds.lot2) }
      }
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
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
    res.json({ message: 'Evento resetado! Todas as inscrições foram apagadas.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resetar evento.' });
  }
});

// ⚙️ POST /admin/settings — Salva configurações globais (ex: taxa de seguro)
router.post('/admin/settings', adminAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    const { error } = await supabase
      .from('event_settings')
      .upsert({ 
        key, 
        value, 
        updated_at: new Date().toISOString() 
      });
    
    if (error) throw error;
    res.json({ message: 'Configuração salva com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configuração.' });
  }
});

// ➕ POST /admin/registrations — Cadastra um atleta manualmente pelo painel admin (Sênior)
router.post('/admin/registrations', adminAuth, async (req, res) => {
  try {
    const { 
      full_name, 
      cpf, 
      email, 
      phone, 
      emergency_phone, 
      blood_type, 
      medication, 
      gender, 
      shirt_size, 
      payment_status 
    } = req.body;

    // Regra Sênior 🧠: Se o atleta for cadastrado como 'paid' (pago),
    // estendemos a reserva dele até 2099 para nunca expirar.
    // Se for 'pending' (pendente), damos a janela padrão de 15 minutos para pagamento.
    const reserved_until = payment_status === 'paid' 
      ? '2099-12-31T23:59:59Z' 
      : new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        full_name,
        cpf,
        email,
        phone,
        emergency_phone,
        blood_type,
        medication: medication || '',
        gender,
        shirt_size,
        payment_status,
        reserved_until,
        final_price: payment_status === 'paid' ? 110.00 : null
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Atleta cadastrado com sucesso!', athlete: data });
  } catch (error) {
    console.error('❌ Erro no cadastro manual de atleta:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar atleta manualmente.' });
  }
});

module.exports = router;
