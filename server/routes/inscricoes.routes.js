const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../db');

const router = express.Router();

// POST nova inscrição
router.post('/', (req, res) => {
  const { cursoId, nome, cpf, celular, email, assento } = req.body;
  const formaPagamento = req.body.formaPagamento || 'mercadopago';

  if (!cursoId || !nome || !cpf || !celular || !email || assento === undefined) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  const assentoId = Number(assento);

  // verificar se assento existe e está livre
  db.get(
    `SELECT * FROM assentos WHERE cursoId = ? AND id = ?`,
    [cursoId, assentoId],
    (err, cadeira) => {
      if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
      if (!cadeira) return res.status(404).json({ message: 'Assento não encontrado' });
      if (cadeira.status !== 'livre') return res.status(400).json({ message: 'Assento indisponível' });

      // reservar assento
      db.run(
        `UPDATE assentos SET status = 'reservado' WHERE cursoId = ? AND id = ?`,
        [cursoId, assentoId],
        err => { if (err) console.error('Erro ao reservar assento:', err); }
      );

      const id = uuidv4();
      const dataInscricao = new Date().toISOString();

      db.run(`
        INSERT INTO inscricoes
          (id, cursoId, nome, cpf, celular, email, assento, formaPagamento, status, dataInscricao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        cursoId,
        nome,
        cpf,
        celular,
        email,
        assentoId,
        formaPagamento,
        'pendente',
        dataInscricao
      ], function(err) {
        if (err) {
          console.error('Erro ao inserir inscrição:', err);
          return res.status(500).json({ message: 'Erro interno no servidor' });
        }

        res.status(201).json({ id, cursoId, nome, cpf, celular, email, assento: assentoId, formaPagamento, status: 'pendente', dataInscricao });
      });
    }
  );
});

// GET inscrições por curso
router.get('/curso/:cursoId', authMiddleware, (req, res) => {
  db.all(
    `SELECT * FROM inscricoes WHERE cursoId = ?`,
    [req.params.cursoId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao obter inscrições:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      res.json(rows);
    }
  );
});

// GET todas as inscrições
router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT * FROM inscricoes`, [], (err, rows) => {
    if (err) {
      console.error('Erro ao obter inscrições:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// PUT atualizar inscrição
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { nome, cpf, celular, email, assento, status, formaPagamento } = req.body;

  db.get(`SELECT * FROM inscricoes WHERE id = ?`, [id], (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });

    const trocarAssento = assento !== undefined && Number(assento) !== inscricao.assento;
    const cancelando = status === 'cancelado' && inscricao.status !== 'cancelado';

    const executarUpdate = () => {
      db.run(`
        UPDATE inscricoes SET
          nome           = COALESCE(?, nome),
          cpf            = COALESCE(?, cpf),
          celular        = COALESCE(?, celular),
          email          = COALESCE(?, email),
          assento        = COALESCE(?, assento),
          status         = COALESCE(?, status),
          formaPagamento = COALESCE(?, formaPagamento)
        WHERE id = ?
      `, [
        nome           ?? null,
        cpf            ?? null,
        celular        ?? null,
        email          ?? null,
        trocarAssento ? Number(assento) : null,
        status         ?? null,
        formaPagamento ?? null,
        id
      ], function(err) {
        if (err) {
          console.error('Erro ao atualizar inscrição:', err);
          return res.status(500).json({ message: 'Erro interno no servidor' });
        }

        if (cancelando) {
          const assentoParaLiberar = trocarAssento ? Number(assento) : inscricao.assento;
          db.run(
            `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
            [inscricao.cursoId, assentoParaLiberar],
            err => { if (err) console.error('Erro ao liberar assento:', err); }
          );
        }

        res.json({ message: 'Atualizado' });
      });
    };

    if (trocarAssento) {
      const novoAssentoId = Number(assento);

      // verificar novo assento
      db.get(
        `SELECT * FROM assentos WHERE cursoId = ? AND id = ?`,
        [inscricao.cursoId, novoAssentoId],
        (err, novoAssento) => {
          if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
          if (!novoAssento) return res.status(404).json({ message: 'Novo assento não encontrado' });
          if (novoAssento.status !== 'livre') return res.status(400).json({ message: 'Novo assento indisponível' });

          // liberar assento antigo
          db.run(
            `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
            [inscricao.cursoId, inscricao.assento],
            err => { if (err) console.error('Erro ao liberar assento antigo:', err); }
          );

          // reservar novo assento
          db.run(
            `UPDATE assentos SET status = 'reservado' WHERE cursoId = ? AND id = ?`,
            [inscricao.cursoId, novoAssentoId],
            err => { if (err) console.error('Erro ao reservar novo assento:', err); }
          );

          executarUpdate();
        }
      );
    } else {
      executarUpdate();
    }
  });
});

// DELETE inscrição — libera assento associado
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM inscricoes WHERE id = ?`, [id], (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });

    // liberar assento
    db.run(
      `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
      [inscricao.cursoId, inscricao.assento],
      err => { if (err) console.error('Erro ao liberar assento:', err); }
    );

    db.run(`DELETE FROM inscricoes WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Erro ao deletar inscrição:', err);
        return res.status(500).json({ message: 'Erro interno no servidor' });
      }
      res.json({ message: 'Inscrição e assento removido' });
    });
  });
});

module.exports = router;