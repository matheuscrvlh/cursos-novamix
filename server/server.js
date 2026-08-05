require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

// falha cedo (com mensagem clara) em vez de deixar o processo subir e
// quebrar de forma obscura no primeiro login/requisição que precisar dessas
// variáveis — ex: JWT_SECRET ausente já derrubou o processo inteiro no login
// (jwt.sign lançando exceção não capturada), e FRONTEND_URL ausente em
// produção deixava o CORS aberto pra qualquer origem
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não configurado — defina no .env antes de subir o servidor');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.error('FRONTEND_URL não configurado em produção — defina no .env (CORS ficaria aberto pra qualquer origem)');
  process.exit(1);
}

// atrás de 1 proxy reverso (nginx do host, que manda /api direto pro
// container backend em 127.0.0.1:3001 — não passa pelo nginx do frontend)
// — sem isso o rate limiter usa o IP interno do proxy pra todo mundo e o
// limite estoura com poucos acessos
app.set('trust proxy', 1);

// libera só o domínio do frontend em produção (FRONTEND_URL no .env, aceita
// lista separada por vírgula); sem essa env var, libera geral (dev local)
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
// uploads de arquivo vão por multipart/form-data (multer), não por aqui —
// 2mb é folga de sobra pros campos de texto (ex: lista de ingredientes) e
// evita que uma rota pública sem auth (ex: POST /api/inscricoes) aceite
// corpos JSON enormes antes mesmo do rate limiter contar a requisição
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

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