const express = require('express');
const router = express.Router();
const { authenticate, requireCursosAccess } = require('../middleware/auth.middleware');

// Usado pelo frontend pra saber se a sessão do hub (cookie compartilhado)
// está válida e qual o nível de acesso ao módulo 'cursos' — equivalente ao
// GET /financeiro/me do financeiro-novamix.
router.get('/me', authenticate, requireCursosAccess, (req, res) => {
    res.json({ access: req.cursosAccess, isAdmin: req.cursosAccess === 'admin' });
});

module.exports = router;
