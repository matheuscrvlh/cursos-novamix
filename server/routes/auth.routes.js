const express = require('express');
const router = express.Router();
const { authenticate, requireCursosAccess } = require('../middleware/auth.middleware');

// Usado pelo frontend pra saber se a sessão do hub (cookie compartilhado)
// está válida e qual o nível de acesso ao módulo 'cursos' — equivalente ao
// GET /financeiro/me do financeiro-novamix. isAdmin vem do role do payload
// (public.users.role no hub-novamix), não do access do módulo — qualquer
// usuário com o módulo liberado já pode fazer tudo, exceto as ações restritas
// a admin (excluir, reembolsar — ver requireCursosAdmin).
router.get('/me', authenticate, requireCursosAccess, (req, res) => {
    res.json({ access: req.cursosAccess, isAdmin: req.user?.role === 'admin' });
});

module.exports = router;
