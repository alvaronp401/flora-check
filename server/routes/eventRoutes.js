const { Router } = require('express');
const { getEventStatus, getConfirmedAthletes } = require('../services/eventService');
const { supabase } = require('../config/clients');

const router = Router();

// ID do evento padrão (Trail Run Flona 2026) criado pela migração
const DEFAULT_EVENT_ID = 'e0123456-789a-bcde-f012-3456789abcde';

// Helper de segurança para resolver o ID do evento com base nos parâmetros (eventId ou slug)
const resolveEventId = async (req) => {
  const { eventId, slug } = req.query;
  
  if (eventId) return eventId;
  
  if (slug) {
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single();
    if (data && !error) return data.id;
  }
  
  return DEFAULT_EVENT_ID;
};

// 📡 GET /events — Retorna todos os eventos ativos com seus respectivos status de vagas
router.get('/events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: true });

    if (error) throw error;

    // Regra Sênior 🧠: Consulta o status de vagas atômico para cada evento ativo
    const dataWithStatus = await Promise.all(
      data.map(async (event) => {
        try {
          const status = await getEventStatus(event.id);
          return {
            ...event,
            available: status.available,
            is_sold_out: status.is_sold_out
          };
        } catch (err) {
          console.error(`Erro ao calcular status para evento ${event.id}:`, err);
          return {
            ...event,
            available: event.capacity,
            is_sold_out: false
          };
        }
      })
    );

    res.json(dataWithStatus);
  } catch (error) {
    console.error('❌ Erro ao listar eventos:', error);
    res.status(500).json({ error: 'Erro ao listar eventos.' });
  }
});

// 📡 GET /events/slug/:slug — Detalhes do evento por Slug
router.get('/events/slug/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    res.json(data);
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do evento:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do evento.' });
  }
});

// 📡 GET /event-status
// Consumido pelo MarqueeBanner, Kit, Hero e Checkout (polling de 5s)
router.get('/event-status', async (req, res) => {
  try {
    const eventId = await resolveEventId(req);
    const status = await getEventStatus(eventId);
    res.json(status);
  } catch (error) {
    console.error('❌ Erro ao consultar status do evento:', error);
    res.status(500).json({ error: 'Erro ao consultar status do evento.' });
  }
});

// 🏃‍♂️ GET /confirmed-athletes
// Consumido pelo ConfirmedAthletesCarousel na página inicial
router.get('/confirmed-athletes', async (req, res) => {
  try {
    const eventId = await resolveEventId(req);
    const athletes = await getConfirmedAthletes(eventId);
    res.json(athletes);
  } catch (error) {
    console.error('❌ Erro ao buscar atletas confirmados:', error);
    res.status(500).json({ error: 'Erro ao buscar atletas confirmados.' });
  }
});

module.exports = router;

