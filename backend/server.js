const express = require('express');
const cors = require('cors');
const cursosRoutes = require('./routes/cursos.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/cursos', cursosRoutes);

app.listen(3000, () => {
    console.log('Backend torando na porta 3000');
});


