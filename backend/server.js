const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const cursosRoutes = require('./routes/cursos.routes');
const assentosRoutes = require('./routes/assentos.routes');
const inscricoesRoutes = require('./routes/inscricoes.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/cursos', cursosRoutes);
app.use('/assentos', assentosRoutes);
app.use('/inscricoes', inscricoesRoutes);

app.listen(3000, () => {
  console.log('Backend torando na porta 3000');
  console.log('Swagger disponível em: http://localhost:3000/api-docs');
});
