require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const expirarReservasPendentes = require('./utils/expirarReservas');

const cursosRoutes = require('./routes/cursos.routes');
const assentosRoutes = require('./routes/assentos.routes');
const inscricoesRoutes = require('./routes/inscricoes.routes');
const culinaristasRoutes = require('./routes/culinaristas.routes');
const industriasRoutes = require('./routes/industrias.routes');
const cursosInfantisRoutes = require('./routes/cursosInfantis.routes');
const inscricoesInfantisRoutes = require('./routes/inscricoesInfantis.routes');
const bannersRoutes = require('./routes/banners.routes');
const pagamentosRoutes = require('./routes/pagamentos.routes');
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const app = express();

// atrás de 1 proxy reverso (nginx na VPS) — sem isso o rate limiter usa o IP
// interno do proxy pra todo mundo e o limite estoura com poucos acessos
app.set('trust proxy', 1);

// libera só o domínio do frontend em produção (FRONTEND_URL no .env, aceita
// lista separada por vírgula); sem essa env var, libera geral (dev local)
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/api', apiLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/cursos', cursosRoutes);
app.use('/api/assentos', assentosRoutes);
app.use('/api/inscricoes', inscricoesRoutes);
app.use('/api/culinaristas', culinaristasRoutes);
app.use('/api/industrias', industriasRoutes);
app.use('/api/cursos-infantis', cursosInfantisRoutes);
app.use('/api/inscricoes-infantis', inscricoesInfantisRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.listen(3000, () => {
  console.log('Backend torando na porta 3000 -- teste deploy 31/07 🚀');
});

// libera assentos de inscrições pendentes esquecidas (cliente abandonou o
// pagamento e o MP nunca mandou webhook de confirmação/rejeição)
expirarReservasPendentes(db);
setInterval(() => expirarReservasPendentes(db), 5 * 60 * 1000);