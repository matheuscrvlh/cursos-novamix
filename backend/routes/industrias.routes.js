const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadIndustria = require('../config/uploadIndustria');

const router = express.Router();

const industriasPath = path.join(__dirname, '../data/industrias.json');

const safeRead = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
    const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim()) return [];
    return JSON.parse(content);
};

const safeWrite = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get('/', (req, res) => {
  res.json(safeRead(industriasPath));
});

router.get('/:id', (req, res) => {
    const industrias = safeRead(industriasPath);
    const industria = industrias.find(i => i.id === req.params.id);
    if (!industria) {
        return res.status(404).json({ message: 'Indústria não encontrada' });
    }
    res.json(industria);
});

router.post('/', uploadIndustria.single('image'), (req, res) => {
  try {
    const {
      razaoSocial,
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      instagram,
      site
    } = req.body;
    
    if (!razaoSocial || !nome){
      return res.status(400).json({ message: 'Razão Social e Nome são obrigatórios' });
    }

    const industrias = safeRead();

   const novaIndustria = {
      id: uuidv4(),
      razaoSocial,
      nome,
      cnpj: cnpj || '',
      telefone: telefone || '',
      email: email || '',
      endereco: endereco || '',
      instagram: instagram || '',
      site: site || '',
      imagem: req.file
        ? `/uploads/industrias/${req.file.filename}`
        : null,
      dataCadastro: new Date().toISOString()
    };

    industrias.push(novaIndustria);
    safeWrite(induastrias);
    res.status(201).json(novaIndustria);
  } catch (error) {
    console.error('Erro ao criar indústria:', error);
    res.status(500).json({ message: 'Erro ao criar indústria' });
  }
});

router.put('/:id', upload.single('imagem'), (req, res) => {
  try {
    const industrias = safeRead();
    const index = industrias.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        message: 'Indústria não encontrada'
      });
    }

    // apagar imagem antiga
    if (req.file && industrias[index].imagem) {
      const oldPath = path.join(__dirname, '..', industrias[index].imagem);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    industrias[index] = {
      ...industrias[index],
      razaoSocial: req.body.razaoSocial ?? industrias[index].razaoSocial,
      nome: req.body.nome ?? industrias[index].nome,
      cnpj: req.body.cnpj ?? industrias[index].cnpj,
      telefone: req.body.telefone ?? industrias[index].telefone,
      email: req.body.email ?? industrias[index].email,
      endereco: req.body.endereco ?? industrias[index].endereco,
      instagram: req.body.instagram ?? industrias[index].instagram,
      site: req.body.site ?? industrias[index].site,
      imagem: req.file
        ? `/uploads/industrias/${req.file.filename}`
        : industrias[index].imagem
    };

    safeWrite(industrias);

    res.json(industrias[index]);

  } catch (err) {
    console.error('ERRO AO ATUALIZAR INDÚSTRIA:', err);
    res.status(500).json({ message: 'Erro ao atualizar indústria' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const industrias = safeRead();
    const index = industrias.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        message: 'Indústria não encontrada'
      });
    }

    const industria = industrias[index];

    if (industria.imagem) {
      const imgPath = path.join(__dirname, '..', industria.imagem);

      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    industrias.splice(index, 1);
    safeWrite(industrias);

    res.status(204).send();

  } catch (err) {
    console.error('ERRO AO EXCLUIR INDÚSTRIA:', err);
    res.status(500).json({ message: 'Erro ao excluir indústria' });
  }
});

module.exports = router;