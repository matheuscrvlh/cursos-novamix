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

  // verificar se assento existe
  db.get(
    `SELECT * FROM assentos WHERE cursoId = ? AND id = ?`,
    [cursoId, assentoId],
    (err, cadeira) => {
      if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
      if (!cadeira) return res.status(404).json({ message: 'Assento não encontrado' });

      // reservar assento de forma atômica: o WHERE status = 'livre' garante que,
      // sob concorrência, só uma requisição consegue mudar o status (this.changes === 1).
      // Checar e depois dar UPDATE em passos separados permitia duas pessoas reservarem
      // o mesmo assento ao mesmo tempo.
      db.run(
        `UPDATE assentos SET status = 'reservado' WHERE cursoId = ? AND id = ? AND status = 'livre'`,
        [cursoId, assentoId],
        function (err) {
          if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
          if (this.changes === 0) return res.status(400).json({ message: 'Assento indisponível' });

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
              db.run(
                `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
                [cursoId, assentoId],
                rollbackErr => { if (rollbackErr) console.error('Erro ao liberar assento após falha:', rollbackErr); }
              );
              return res.status(500).json({ message: 'Erro interno no servidor' });
            }

            res.status(201).json({ id, cursoId, nome, cpf, celular, email, assento: assentoId, formaPagamento, status: 'pendente', dataInscricao });
          });
        }
      );
    }
  );
});

// PUT trocar de assento — rota pública (o próprio cliente usa antes de pagar,
// sem estar logado). Só mexe no assento, nunca em status/formaPagamento/dados
// pessoais — para isso continua exigindo login via PUT /:id.
router.put('/:id/assento', (req, res) => {
  const { id } = req.params;
  const { assento } = req.body;

  if (assento === undefined) {
    return res.status(400).json({ message: 'Assento obrigatório' });
  }

  db.get(`SELECT * FROM inscricoes WHERE id = ?`, [id], (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });
    if (inscricao.status === 'pago' || inscricao.status === 'cancelado') {
      return res.status(400).json({ message: 'Não é possível trocar de assento dessa inscrição.' });
    }

    const novoAssentoId = Number(assento);
    if (novoAssentoId === inscricao.assento) {
      return res.json({ message: 'Atualizado' });
    }

    db.get(
      `SELECT * FROM assentos WHERE cursoId = ? AND id = ?`,
      [inscricao.cursoId, novoAssentoId],
      (err, novoAssento) => {
        if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
        if (!novoAssento) return res.status(404).json({ message: 'Novo assento não encontrado' });

        // reserva atômica do novo assento — evita que duas pessoas troquem para o
        // mesmo assento ao mesmo tempo (ver comentário equivalente no POST '/')
        db.run(
          `UPDATE assentos SET status = 'reservado' WHERE cursoId = ? AND id = ? AND status = 'livre'`,
          [inscricao.cursoId, novoAssentoId],
          function (err) {
            if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
            if (this.changes === 0) return res.status(400).json({ message: 'Esse assento já foi ocupado por outra pessoa.' });

            db.run(
              `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
              [inscricao.cursoId, inscricao.assento],
              err => { if (err) console.error('Erro ao liberar assento antigo:', err); }
            );

            db.run(
              `UPDATE inscricoes SET assento = ? WHERE id = ?`,
              [novoAssentoId, id],
              err => {
                if (err) {
                  console.error('Erro ao atualizar assento da inscrição:', err);
                  return res.status(500).json({ message: 'Erro interno no servidor' });
                }
                res.json({ message: 'Atualizado' });
              }
            );
          }
        );
      }
    );
  });
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
    const reativando = status !== undefined && status !== 'cancelado' && inscricao.status === 'cancelado';

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

      // reserva atômica do novo assento (ver comentário equivalente no POST '/')
      db.run(
        `UPDATE assentos SET status = 'reservado' WHERE cursoId = ? AND id = ? AND status = 'livre'`,
        [inscricao.cursoId, novoAssentoId],
        function (err) {
          if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
          if (this.changes === 0) return res.status(400).json({ message: 'Novo assento indisponível' });

          // liberar assento antigo
          db.run(
            `UPDATE assentos SET status = 'livre' WHERE cursoId = ? AND id = ?`,
            [inscricao.cursoId, inscricao.assento],
            err => { if (err) console.error('Erro ao liberar assento antigo:', err); }
          );

          executarUpdate();
        }
      );
    } else if (reativando) {
      // volta de 'cancelado' pra outro status: a vaga foi liberada quando cancelou,
      // então precisa conferir se ninguém mais pegou antes de reservar de novo —
      // reserva atômica (ver comentário equivalente no POST '/')
      db.run(
        `UPDATE assentos SET status = 'reservado' WHERE cursoId = ? AND id = ? AND status = 'livre'`,
        [inscricao.cursoId, inscricao.assento],
        function (err) {
          if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
          if (this.changes === 0) {
            return res.status(400).json({ message: 'Não é possível reativar: essa vaga já foi ocupada por outra pessoa.' });
          }

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