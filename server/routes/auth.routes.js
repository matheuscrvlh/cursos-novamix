const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { loginLimiter } = require('../middleware/rateLimit.middleware');

router.post('/login', loginLimiter, (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario], async (err, row) => {
        try {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

            const senhaCorreta = await bcrypt.compare(senha, row.senha);
            if (!senhaCorreta) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

            const token = jwt.sign(
                { id: row.id, usuario: row.usuario },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.json({ token, usuario: row.usuario });
        } catch (err2) {
            // esse callback roda fora do ciclo de request/response do Express
            // (é invocado pela lib do sqlite3), então uma exceção aqui — ex:
            // jwt.sign falhando por JWT_SECRET ausente — não seria capturada
            // por nada e derrubaria o processo inteiro (unhandled rejection)
            console.error('Erro no login:', err2);
            res.status(500).json({ error: 'Erro interno no servidor' });
        }
    });
});

module.exports = router;
