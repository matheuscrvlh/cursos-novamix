const pool = require('../db');

// Registra uma ação administrativa em cursos.logs, pro painel de auditoria.
// userHubId vem de req.user.sub (id em public.users, hub-novamix). Nunca deve
// derrubar a requisição que a chamou — auditoria é best-effort, um log que
// falha não pode impedir a ação de negócio em si.
async function logAudit({ entityType, entityId, action, details, userHubId }) {
  try {
    await pool.query(
      `INSERT INTO cursos.logs (tipo_entidade, entidade_id, acao, detalhes, usuario_hub_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [entityType, String(entityId), action, details ?? null, userHubId ?? null]
    );
  } catch (err) {
    console.error('Erro ao gravar log de auditoria:', err);
  }
}

module.exports = logAudit;
