const { Router } = require('express');
const { getEventStatus } = require('../services/eventService');

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

module.exports = router;
