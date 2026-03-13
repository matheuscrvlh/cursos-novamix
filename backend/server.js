const express = require('express');
const cors = require('cors');
const path = require('path');

const cursosRoutes = require('./routes/cursos.routes');
const assentosRoutes = require('./routes/assentos.routes');
const inscricoesRoutes = require('./routes/inscricoes.routes');
const culinaristasRoutes = require('./routes/culinaristas.routes');
const industriasRoutes = require('./routes/industrias.routes');
const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/cursos', cursosRoutes);
app.use('/api/assentos', assentosRoutes);
app.use('/api/inscricoes', inscricoesRoutes);
app.use('/api/culinaristas', culinaristasRoutes);
app.use('/api/industrias', industriasRoutes);

app.listen(3001, () => {
  console.log('Backend torando na porta 3001');
});