const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 🛡️ Segurança: Limite de requisições Global (Prevenção de DoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 💰 Segurança: Limite Restrito para Pagamentos e Cupons (Prevenção de Brute Force)
const sensitiveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // Apenas 5 tentativas por minuto
  message: { error: 'Limite de tentativas atingido. Aguarde 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, sensitiveLimiter };

// 📦 Rotas
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Middlewares Globais
app.use(helmet());
app.use(globalLimiter); // Aplica o limite global em tudo
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://flora-check.vercel.app', 
    'https://trailrunclub.com.br'
  ],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}));
app.use(express.json());

// 📡 Registro de Rotas
app.use(eventRoutes);

// 💰 Rotas de Pagamento (Limiter aplicado apenas nas rotas sensíveis, sem mudar o path)
app.use(paymentRoutes); 

// 🎟️ Rotas de Cupom (Limiter aplicado globalmente no grupo de cupons)
app.use('/coupon', sensitiveLimiter, couponRoutes); 

app.use(adminRoutes);

// 🚀 Inicialização do Servidor
app.listen(PORT, () => console.log(`🚀 Servidor Flora na porta ${PORT}`));
