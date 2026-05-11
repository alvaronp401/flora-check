const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { globalLimiter, sensitiveLimiter } = require('./middleware/rateLimit');

// 📦 Rotas
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { validateEmail } = require('./services/emailValidationService');
const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Middlewares Globais
app.use(helmet());
app.use(globalLimiter); // Aplica o limite global em tudo
const allowedOrigins = [
  'http://localhost:5173',
  'https://trailrunclub.com.br',
  'https://www.trailrunclub.com.br',
  'https://flora-check.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (como mobile apps ou curl) ou se estiver na lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Domínio não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  credentials: true
}));
app.use(express.json());

// 📡 Registro de Rotas
app.use(eventRoutes);

// 💰 Rotas de Pagamento (Limiter aplicado apenas nas rotas sensíveis, sem mudar o path)
// 📧 Rota de Validação de E-mail (Abstract API)
app.post('/validate-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });
  
  const result = await validateEmail(email);
  res.json(result);
});

app.use('/', paymentRoutes); 

// 🎟️ Rotas de Cupom (Limiter aplicado globalmente no grupo de cupons)
app.use('/coupon', sensitiveLimiter, couponRoutes); 

app.use(adminRoutes);

// 🚀 Inicialização do Servidor
app.listen(PORT, () => console.log(`🚀 Servidor Flora na porta ${PORT}`));
