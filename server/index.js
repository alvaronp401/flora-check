const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de Rate Limit (Proteção contra Brute Force / DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições vindas deste IP, tente novamente mais tarde.'
});

// Configurações de Segurança (Modo Sênior)
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: ['http://localhost:5173', 'https://flora-check.vercel.app'], // Domínios permitidos
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rota de Teste (Health Check)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor Trail Run Club operando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor voando na porta ${PORT}`);
});
