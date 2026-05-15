const { Router } = require('express');
const { getEventStatus, getConfirmedAthletes } = require('../services/eventService');

const router = Router();

// 📡 GET /event-status
// Consumido pelo MarqueeBanner, Kit, Hero e Checkout (polling de 5s)
router.get('/event-status', async (req, res) => {
  try {
    const status = await getEventStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar status do evento.' });
  }
});

// 🏃‍♂️ GET /confirmed-athletes
// Consumido pelo ConfirmedAthletesCarousel na página inicial
router.get('/confirmed-athletes', async (req, res) => {
  try {
    const athletes = await getConfirmedAthletes();
    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atletas confirmados.' });
  }
});

module.exports = router;
