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
  const eventId = req.query.eventId || 'e0123456-789a-bcde-f012-3456789abcde';

  try {
    // Busca com paginação e contagem total filtrado por eventId
    const { data, error, count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    // 🛡️ Busca estatísticas REAIS do banco inteiro para o evento específico
    const { data: allStats, error: statsErr } = await supabase
      .from('registrations')
      .select('payment_status, final_price, reserved_until')
      .eq('event_id', eventId);

    if (statsErr) throw statsErr;

    // Busca configurações do evento para calcular os lotes e a capacidade
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    const thresholds = event?.lot_thresholds || { lot1: 15, lot2: 30 };
    const capacity = event?.capacity || 50;
    
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
      capacity,
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
    console.error('❌ Erro no admin/registrations:', error);
    res.status(500).json({ error: 'Erro ao listar inscritos.' });
  }
});

// ✅ POST /admin/confirm-payment/:id — Confirma pagamento manualmente (dispara fluxo completo)
router.post('/admin/confirm-payment/:id', adminAuth, async (req, res) => {
  try {
    // 1. Busca a inscrição para saber qual é o event_id
    const { data: reg, error: regError } = await supabase
      .from('registrations')
      .select('event_id')
      .eq('id', req.params.id)
      .single();

    if (regError || !reg) {
      return res.status(404).json({ error: 'Inscrição não encontrada.' });
    }

    // 2. Consulta o preço atual do lote e taxas configuradas para o evento
    const { getEventStatus } = require('../services/eventService');
    const status = await getEventStatus(reg.event_id);
    const lotPrice = status.currentLot.price;
    const fees = status.fees.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const finalPrice = lotPrice + fees;

    const success = await finalizeRegistration(req.params.id, finalPrice, 'admin_button');
    if (success) {
      res.json({ message: `Pagamento confirmado com o valor de R$ ${finalPrice}! Fluxo de e-mail e nota fiscal disparados.` });
    } else {
      res.status(400).json({ error: 'Inscrição já está paga ou não foi encontrada.' });
    }
  } catch (error) {
    console.error('❌ Erro ao confirmar pagamento manual:', error);
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
      email: `teste${i + 1}@trailrunclub.com.br`,
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

// 💣 POST /admin/reset-event — Apaga as inscrições de um evento específico ou todas para testes
router.post('/admin/reset-event', adminAuth, async (req, res) => {
  try {
    const { eventId } = req.body;
    let query = supabase.from('registrations').delete();
    
    if (eventId) {
      query = query.eq('event_id', eventId);
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    const { error } = await query;
    if (error) throw error;
    res.json({ message: 'Evento resetado! As inscrições correspondentes foram apagadas.' });
  } catch (error) {
    console.error('❌ Erro ao resetar evento:', error);
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
      payment_status,
      event_id
    } = req.body;

    const targetEventId = event_id || 'e0123456-789a-bcde-f012-3456789abcde';

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
        event_id: targetEventId,
      // ─────────────────────────────────────────────────────────────────────
      // 🛡️ CORREÇÃO DE BUG SÊNIOR: final_price era hardcoded como 110.00
      // para TODOS os eventos. Agora salvamos null quando status=paid manual
      // e o valor real só entra via /create-preference (dinâmico por lote).
      // Para cadastros manuais paid, o admin já sabe o valor — salvamos null
      // para não poluir o relatório de receita com valores incorretos.
      // ─────────────────────────────────────────────────────────────────────
      final_price: null
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

// ➕ POST /admin/events — Cria um novo evento (Sênior)
router.post('/admin/events', adminAuth, async (req, res) => {
  try {
    const { 
      title, 
      slug, 
      description, 
      date, 
      location, 
      image_url, 
      capacity, 
      lot_prices, 
      lot_thresholds, 
      fees 
    } = req.body;

    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const { data, error } = await supabase
      .from('events')
      .insert([{
        title,
        slug: cleanSlug,
        description,
        date: new Date(date).toISOString(),
        location,
        image_url: image_url || '',
        capacity: Number(capacity) || 50,
        lot_prices: lot_prices || { lot1: 110, lot2: 130, lot3: 150 },
        lot_thresholds: lot_thresholds || { lot1: 15, lot2: 30 },
        fees: fees || [{ id: 'insurance', name: 'Seguro Aventura', price: 10.00 }],
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Evento criado com sucesso!', event: data });
  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro interno ao criar evento.' });
  }
});

// 🔄 PUT /admin/events/:id — Atualiza configurações de um evento (Sênior)
router.put('/admin/events/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      slug, 
      description, 
      date, 
      location, 
      image_url, 
      capacity, 
      lot_prices, 
      lot_thresholds, 
      fees,
      is_active
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date).toISOString();
    if (location !== undefined) updateData.location = location;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (lot_prices !== undefined) updateData.lot_prices = lot_prices;
    if (lot_thresholds !== undefined) updateData.lot_thresholds = lot_thresholds;
    if (fees !== undefined) updateData.fees = fees;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Evento atualizado com sucesso!', event: data });
  } catch (error) {
    console.error('❌ Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar evento.' });
  }
});

module.exports = router;
