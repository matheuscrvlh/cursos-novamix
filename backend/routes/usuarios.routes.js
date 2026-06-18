const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

const SALT_ROUNDS = 12;

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// GET /api/usuarios — lista todos (sem senha)
router.get('/', (req, res) => {
    db.all('SELECT id, usuario, dataCadastro FROM usuarios ORDER BY dataCadastro DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/usuarios — cria usuário
router.post('/', async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }
    if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const id = uuidv4();
    const hash = await bcrypt.hash(senha, SALT_ROUNDS);
    const dataCadastro = new Date().toISOString();

    db.run(
        'INSERT INTO usuarios (id, usuario, senha, dataCadastro) VALUES (?, ?, ?, ?)',
        [id, usuario, hash, dataCadastro],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Este nome de usuário já existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id, usuario, dataCadastro });
        }
    );
});

// PUT /api/usuarios/:id — atualiza usuário
router.put('/:id', async (req, res) => {
    const { usuario, senha } = req.body;
    const { id } = req.params;

    if (!usuario) {
        return res.status(400).json({ error: 'Nome de usuário é obrigatório.' });
    }

    if (senha) {
        if (senha.length < 6) {
            return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
        }
        const hash = await bcrypt.hash(senha, SALT_ROUNDS);
        db.run(
            'UPDATE usuarios SET usuario = ?, senha = ? WHERE id = ?',
            [usuario, hash, id],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(409).json({ error: 'Este nome de usuário já existe.' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
                res.json({ id, usuario });
            }
        );
    } else {
        db.run(
            'UPDATE usuarios SET usuario = ? WHERE id = ?',
            [usuario, id],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(409).json({ error: 'Este nome de usuário já existe.' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
                res.json({ id, usuario });
            }
        );
    }
});

// DELETE /api/usuarios/:id — remove usuário
router.delete('/:id', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM usuarios', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row.total <= 1) {
            return res.status(400).json({ error: 'Não é possível excluir o único usuário do sistema.' });
        }

        db.run('DELETE FROM usuarios WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
            res.json({ message: 'Usuário excluído com sucesso.' });
        });
    });
});

module.exports = router;
