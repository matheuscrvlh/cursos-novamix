const express = require('express');
const cors = require('cors');
const cursosRoutes = require('./routes/cursos.routes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// acesso imagens 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/cursos', cursosRoutes);

app.listen(3001, () => {
    console.log('Backend torando na porta 3001');
});


