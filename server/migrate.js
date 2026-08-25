require('dotenv').config();
const pool = require('./db');

// Todas as tabelas vivem no schema `cursos`, não no `public` padrão — o pool
// já seta search_path=cursos,public em toda conexão (ver db.js), então as
// rotas não precisam do prefixo.
//
// Este arquivo só ADICIONA schema (CREATE TABLE/ADD COLUMN/ADD CONSTRAINT,
// sempre com IF NOT EXISTS ou DO $$ .. EXCEPTION) — seguro rodar em toda
// subida do servidor.
async function migrate() {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS cursos`);
  console.log('✓ schema cursos');

  // conta do cliente final (quem se inscreve em curso) — sem relação com
  // public.users (login de admin via SSO do hub-novamix)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.clientes (
      id            UUID PRIMARY KEY,
      nome          VARCHAR(255) NOT NULL,
      email         VARCHAR(255) NOT NULL UNIQUE,
      senha_hash    VARCHAR(255) NOT NULL,
      cpf           VARCHAR(14) UNIQUE,
      celular       VARCHAR(20),
      status        BOOLEAN DEFAULT true,
      criado_em     TIMESTAMPTZ DEFAULT now(),
      ultimo_login  TIMESTAMPTZ
    )
  `);
  console.log('✓ cursos.clientes');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.clientes_tokens (
      id          UUID PRIMARY KEY,
      cliente_id  UUID NOT NULL,
      token       VARCHAR(255) NOT NULL UNIQUE,
      tipo        VARCHAR(30) NOT NULL,
      expira_em   TIMESTAMPTZ NOT NULL,
      usado_em    TIMESTAMPTZ,
      criado_em   TIMESTAMPTZ DEFAULT now()
    )
  `);
  console.log('✓ cursos.clientes_tokens');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.industrias (
      id             UUID PRIMARY KEY,
      razao_social   VARCHAR(255),
      nome           VARCHAR(255) NOT NULL,
      cnpj           VARCHAR(18),
      telefone       VARCHAR(20),
      email          VARCHAR(255),
      endereco       VARCHAR(500),
      instagram      VARCHAR(100),
      site           VARCHAR(255),
      foto           VARCHAR(255),
      criado_em      TIMESTAMPTZ DEFAULT now()
    )
  `);
  console.log('✓ cursos.industrias');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.culinaristas (
      id                UUID PRIMARY KEY,
      nome_culinarista  VARCHAR(255) NOT NULL,
      cpf               VARCHAR(14),
      industria_id      UUID,
      telefone          VARCHAR(20),
      instagram         VARCHAR(100),
      cursos            JSONB,
      foto              VARCHAR(255),
      criado_em         TIMESTAMPTZ DEFAULT now()
    )
  `);
  console.log('✓ cursos.culinaristas');

  // filiais (public.branchs) que uma culinarista atende — N:N
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.culinarista_filial (
      culinarista_id UUID NOT NULL,
      filial_id      INTEGER NOT NULL,
      PRIMARY KEY (culinarista_id, filial_id)
    )
  `);
  console.log('✓ cursos.culinarista_filial');

  // curso normal e infantil vivem na mesma tabela — tipo distingue
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.cursos (
      id             UUID PRIMARY KEY,
      nome_curso     VARCHAR(255) NOT NULL,
      tipo           VARCHAR(20) DEFAULT 'normal',
      culinarista_id UUID NOT NULL,
      filial_id      INTEGER NOT NULL,
      categoria      VARCHAR(100) NOT NULL,
      duracao        VARCHAR(50) NOT NULL,
      data           TIMESTAMP NOT NULL,
      valor          NUMERIC(10,2) NOT NULL,
      ingredientes   TEXT,
      capacidade     INTEGER DEFAULT 24,
      status         BOOLEAN DEFAULT true,
      criado_em      TIMESTAMPTZ DEFAULT now()
    )
  `);
  console.log('✓ cursos.cursos');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.fotos (
      id       SERIAL PRIMARY KEY,
      curso_id UUID NOT NULL,
      url      VARCHAR(255) NOT NULL
    )
  `);
  console.log('✓ cursos.fotos');

  // curso_id e cliente_id ficam nullable de propósito: excluir o curso ou a
  // conta zera o vínculo (ON DELETE SET NULL) sem apagar a inscrição —
  // curso_removido_nome/curso_excluido_por guardam o histórico
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.inscricoes (
      id                  UUID PRIMARY KEY,
      curso_id            UUID,
      cliente_id          UUID,
      nome                VARCHAR(255) NOT NULL,
      cpf                 VARCHAR(14) NOT NULL,
      celular             VARCHAR(20) NOT NULL,
      email               VARCHAR(255) NOT NULL,
      assento             INTEGER NOT NULL,
      status              VARCHAR(20) NOT NULL DEFAULT 'pendente',
      data_inscricao      TIMESTAMPTZ DEFAULT now(),
      curso_removido_nome VARCHAR(255),
      reembolsado_por     INTEGER,
      curso_excluido_por  INTEGER,
      lembrete_enviado_em TIMESTAMPTZ
    )
  `);
  await pool.query(`ALTER TABLE cursos.inscricoes ADD COLUMN IF NOT EXISTS cliente_id UUID`);
  await pool.query(`ALTER TABLE cursos.inscricoes ADD COLUMN IF NOT EXISTS lembrete_enviado_em TIMESTAMPTZ`);
  console.log('✓ cursos.inscricoes');

  // no máximo uma inscrição ativa (pendente/pago/reembolsando) por assento —
  // é a trava de concorrência da reserva de vaga
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS inscricoes_assento_ativo_unico
    ON cursos.inscricoes (curso_id, assento)
    WHERE status IN ('pendente', 'pago', 'reembolsando')
  `);
  console.log('✓ índice único cursos.inscricoes (curso_id, assento) para status ativos');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.pagamentos (
      id                UUID PRIMARY KEY,
      inscricao_id      UUID NOT NULL,
      metodo_pagamento  VARCHAR(20),
      mp_pagamento_id   VARCHAR(50) UNIQUE,
      status            VARCHAR(20) DEFAULT 'pendente',
      comprovante_url   VARCHAR(500),
      criado_em         TIMESTAMPTZ DEFAULT now(),
      atualizado_em     TIMESTAMPTZ
    )
  `);
  console.log('✓ cursos.pagamentos');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.banners (
      id            UUID PRIMARY KEY,
      posicao       VARCHAR(20) NOT NULL,
      imagem        VARCHAR(255) NOT NULL,
      imagem_mobile VARCHAR(255),
      link          VARCHAR(500),
      ordem         INTEGER DEFAULT 0,
      ativo         BOOLEAN DEFAULT true
    )
  `);
  console.log('✓ cursos.banners');

  // auditoria das ações administrativas — usuario_hub_id é public.users.id
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.logs (
      id             SERIAL PRIMARY KEY,
      tipo_entidade  VARCHAR(50) NOT NULL,
      entidade_id    VARCHAR(100) NOT NULL,
      acao           VARCHAR(50) NOT NULL,
      detalhes       TEXT,
      usuario_hub_id INTEGER,
      criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  console.log('✓ cursos.logs');

  // cursos.culinarista_id é NOT NULL — ON DELETE SET NULL contradiria isso
  // (o Postgres rejeitaria o DELETE de qualquer jeito). A trava de verdade é
  // no app (culinaristas.routes.js recusa excluir se houver curso vinculado);
  // aqui a FK só bloqueia por padrão (RESTRICT), sem ação especial.
  await pool.query(`ALTER TABLE cursos.cursos DROP CONSTRAINT IF EXISTS cursos_culinarista_fk`);

  // Postgres não tem "ADD CONSTRAINT IF NOT EXISTS" — o DO $$ .. EXCEPTION
  // captura duplicate_object pra manter idempotente
  const fks = [
    ['cursos.cursos', 'cursos_culinarista_fk', 'FOREIGN KEY (culinarista_id) REFERENCES cursos.culinaristas(id)'],
    ['cursos.cursos', 'cursos_filial_fk', 'FOREIGN KEY (filial_id) REFERENCES public.branchs(id)'],
    ['cursos.culinaristas', 'culinaristas_industria_fk', 'FOREIGN KEY (industria_id) REFERENCES cursos.industrias(id) ON DELETE SET NULL'],
    ['cursos.culinarista_filial', 'culinarista_filial_culinarista_fk', 'FOREIGN KEY (culinarista_id) REFERENCES cursos.culinaristas(id) ON DELETE CASCADE'],
    ['cursos.culinarista_filial', 'culinarista_filial_filial_fk', 'FOREIGN KEY (filial_id) REFERENCES public.branchs(id)'],
    ['cursos.fotos', 'fotos_curso_fk', 'FOREIGN KEY (curso_id) REFERENCES cursos.cursos(id) ON DELETE CASCADE'],
    ['cursos.inscricoes', 'inscricoes_curso_fk', 'FOREIGN KEY (curso_id) REFERENCES cursos.cursos(id) ON DELETE SET NULL'],
    ['cursos.inscricoes', 'inscricoes_cliente_fk', 'FOREIGN KEY (cliente_id) REFERENCES cursos.clientes(id) ON DELETE SET NULL'],
    ['cursos.inscricoes', 'inscricoes_reembolsado_por_fk', 'FOREIGN KEY (reembolsado_por) REFERENCES public.users(id)'],
    ['cursos.inscricoes', 'inscricoes_excluido_por_fk', 'FOREIGN KEY (curso_excluido_por) REFERENCES public.users(id)'],
    ['cursos.clientes_tokens', 'clientes_tokens_cliente_fk', 'FOREIGN KEY (cliente_id) REFERENCES cursos.clientes(id) ON DELETE CASCADE'],
    ['cursos.pagamentos', 'pagamentos_inscricao_fk', 'FOREIGN KEY (inscricao_id) REFERENCES cursos.inscricoes(id) ON DELETE CASCADE'],
    ['cursos.logs', 'logs_usuario_hub_fk', 'FOREIGN KEY (usuario_hub_id) REFERENCES public.users(id)'],
  ];
  for (const [tabela, nome, definicao] of fks) {
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE ${tabela} ADD CONSTRAINT ${nome} ${definicao};
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }
  console.log(`✓ ${fks.length} FKs`);

  // índice em toda coluna de FK (Postgres não cria automático pro lado que referencia)
  const indices = [
    ['cursos', 'culinarista_id'], ['cursos', 'filial_id'],
    ['fotos', 'curso_id'],
    ['inscricoes', 'curso_id'], ['inscricoes', 'cliente_id'],
    ['inscricoes', 'reembolsado_por'], ['inscricoes', 'curso_excluido_por'],
    ['pagamentos', 'inscricao_id'],
    ['culinaristas', 'industria_id'],
    ['culinarista_filial', 'filial_id'],
    ['clientes_tokens', 'cliente_id'],
    ['logs', 'usuario_hub_id'],
  ];
  for (const [tabela, coluna] of indices) {
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_${tabela}_${coluna} ON cursos.${tabela} (${coluna})`);
  }
  console.log(`✓ ${indices.length} índices em colunas de FK`);

  await pool.query(`DROP TABLE IF EXISTS cursos.usuarios`);
  await pool.query(`DROP TABLE IF EXISTS cursos.assentos`);
}

migrate()
  .then(() => {
    console.log('Migração concluída.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erro na migração:', err);
    process.exit(1);
  });
