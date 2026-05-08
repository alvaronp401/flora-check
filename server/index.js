const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// 📦 Rotas
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Middlewares Globais
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://flora-check.vercel.app'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}));
app.use(express.json());

// 📡 Registro de Rotas
app.use(eventRoutes);
app.use(paymentRoutes);
app.use(couponRoutes);
app.use(adminRoutes);

// 🚀 Inicialização do Servidor
app.listen(PORT, () => console.log(`🚀 Servidor Flora na porta ${PORT}`));
