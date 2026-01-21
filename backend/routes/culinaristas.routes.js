const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const upload = require('../config/uploadCulinaristas');

const router = express.Router();

const culinaristasPath = path.join(__dirname, '../data/culinaristas.json');

const safeRead = () => {
  if (!fs.existsSync(culinaristasPath)) {
    fs.writeFileSync(culinaristasPath, JSON.stringify([]));
  }

  const content = fs.readFileSync(culinaristasPath, 'utf8');
  return content.trim() ? JSON.parse(content) : [];
};

const safeWrite = (data) => {
  fs.writeFileSync(culinaristasPath, JSON.stringify(data, null, 2));
};

router.get('/', (req, res) => {
  res.json(safeRead());
});

router.post('/', upload.single('foto'), (req, res) => {
  try {
    const { nomeCulinarista, cpf, lojas, cursos, instagram, industria, telefone } = req.body;

    if (!nomeCulinarista || !cpf) {
      return res.status(400).json({ message: 'Nome e CPF são obrigatórios' });
    }

    const culinaristas = safeRead();

    const novoCulinarista = {
      id: uuidv4(),
      nomeCulinarista,
      cpf,
      industria,
      telefone,
      instagram, 
      lojas: lojas ? JSON.parse(lojas) : [],
      cursos: cursos ? JSON.parse(cursos) : [],
      foto: req.file ? `/uploads/culinaristas/${req.file.filename}` : null,
      dataCadastro: new Date().toISOString()
    };

    culinaristas.push(novoCulinarista);
    safeWrite(culinaristas);

    res.status(201).json(novoCulinarista);
  } catch (err) {
    console.error('ERRO AO CRIAR CULINARISTA:', err);
    res.status(500).json({ message: 'Erro ao criar culinarista' });
  }
});

router.put('/:id', upload.single('foto'), (req, res) => {
  const culinaristas = safeRead();
  const index = culinaristas.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Culinarista não encontrado' });
  }

  if (req.file && culinaristas[index].foto) {
    const fotoPath = path.join(__dirname, '..', culinaristas[index].foto);
    if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
  }

  culinaristas[index] = {
    ...culinaristas[index],
    nomeCulinarista: req.body.nomeCulinarista ?? culinaristas[index].nomeCulinarista,
    cpf: req.body.cpf ?? culinaristas[index].cpf,
    lojas: req.body.lojas ? JSON.parse(req.body.lojas) : culinaristas[index].lojas,
    cursos: req.body.cursos ? JSON.parse(req.body.cursos) : culinaristas[index].cursos,
    foto: req.file
      ? `/uploads/culinaristas/${req.file.filename}`
      : culinaristas[index].foto
  };

  safeWrite(culinaristas);
  res.json(culinaristas[index]);
});

router.delete('/:id', (req, res) => {
  const culinaristas = safeRead();
  const index = culinaristas.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Culinarista não encontrado' });
  }

  const culinarista = culinaristas[index];

  if (culinarista.foto) {
    const fotoPath = path.join(__dirname, '..', culinarista.foto);
    if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
  }

  culinaristas.splice(index, 1);
  safeWrite(culinaristas);

  res.status(204).send();
});

module.exports = router;
