const express = require('express');
const cors = require('cors');
const path = require('path');

const cursosRoutes = require('./routes/cursos.routes');
const assentosRoutes = require('./routes/assentos.routes');
const inscricoesRoutes = require('./routes/inscricoes.routes');
const culinaristasRoutes = require('./routes/culinaristas.routes')

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/cursos', cursosRoutes);
app.use('/assentos', assentosRoutes);
app.use('/inscricoes', inscricoesRoutes);
app.use('/culinaristas', culinaristasRoutes);

app.listen(3001, () => {
  console.log('Backend torando na porta 3001');
});