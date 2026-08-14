require('dotenv').config();
const pool = require('./db');

// Todas as tabelas vivem no schema `cursos` (não no `public` padrão) — cada
// CREATE/ALTER aqui é qualificado com "cursos." explicitamente; as rotas não
// precisam repetir o prefixo porque o pool já seta search_path=cursos,public
// em toda conexão nova (ver db.js).
//
// Identificadores em camelCase precisam ficar entre aspas duplas em todo
// CREATE/ALTER/SELECT/INSERT/UPDATE — sem aspas, o Postgres dobra tudo pra
// minúsculo (ex: "nomeCurso" viraria nomecurso) e quebraria o formato que o
// frontend espera de volta no JSON (nomeCurso, cursoId, dataInscricao, etc.)
//
// Este arquivo só ADICIONA schema (CREATE TABLE/ADD COLUMN, sempre com
// IF NOT EXISTS) — é seguro rodar em toda subida do servidor. A transformação
// pontual de dados existentes (mesclar cursosInfantis em cursos, extrair
// pagamentos de inscricoes, dropar colunas/tabelas antigas) foi feita uma
// única vez por scripts/migrate-schema-v2.js, já rodado contra produção.
async function migrate() {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS cursos`);
  console.log('✓ schema cursos');

  // curso normal e infantil vivem na mesma tabela — "tipo" distingue, e
  // "capacidade" substitui os 24/20 assentos que antes eram hardcoded em
  // loops separados de criação
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.cursos (
      id           TEXT PRIMARY KEY,
      "nomeCurso"  TEXT NOT NULL,
      tipo         TEXT DEFAULT 'normal',
      culinarista  TEXT,
      categoria    TEXT,
      duracao      TEXT,
      data         TEXT,
      hora         TEXT,
      loja         TEXT,
      valor        REAL,
      ingredientes TEXT,
      capacidade   INTEGER DEFAULT 24,
      ativo        TEXT DEFAULT 'true'
    )
  `);
  await pool.query(`ALTER TABLE cursos.cursos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'normal'`);
  await pool.query(`ALTER TABLE cursos.cursos ADD COLUMN IF NOT EXISTS capacidade INTEGER DEFAULT 24`);
  console.log('✓ cursos.cursos');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.assentos (
      id        INTEGER NOT NULL,
      "cursoId" TEXT NOT NULL,
      status    TEXT DEFAULT 'livre',
      PRIMARY KEY (id, "cursoId")
    )
  `);
  console.log('✓ cursos.assentos');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.fotos (
      id        SERIAL PRIMARY KEY,
      "cursoId" TEXT NOT NULL,
      url       TEXT NOT NULL
    )
  `);
  console.log('✓ cursos.fotos');

  // dados de pagamento (mp_payment_id, método, status por tentativa) vivem
  // em cursos.pagamentos — inscricoes guarda só o essencial da inscrição em
  // si; "status" aqui é quem decide reservar/liberar assento, sem mudança
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.inscricoes (
      id                  TEXT PRIMARY KEY,
      "cursoId"           TEXT NOT NULL,
      nome                TEXT,
      cpf                 TEXT,
      celular             TEXT,
      email               TEXT,
      assento             INTEGER,
      status              TEXT DEFAULT 'pendente',
      "dataInscricao"     TEXT,
      "cursoRemovidoNome" TEXT
    )
  `);
  console.log('✓ cursos.inscricoes');

  // uma linha por tentativa de pagamento — mp_payment_id é único porque
  // webhook/verificação/resposta síncrona do Brick podem todos tentar
  // registrar a mesma tentativa, e isso deve atualizar a linha, não duplicar
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.pagamentos (
      id                 TEXT PRIMARY KEY,
      "inscricaoId"      TEXT NOT NULL,
      "metodoPagamento"  TEXT,
      mp_payment_id      TEXT UNIQUE,
      status             TEXT DEFAULT 'pendente',
      "criadoEm"         TEXT,
      "atualizadoEm"     TEXT
    )
  `);
  console.log('✓ cursos.pagamentos');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.culinaristas (
      id                 TEXT PRIMARY KEY,
      "nomeCulinarista"  TEXT,
      cpf                TEXT,
      industria          TEXT,
      telefone           TEXT,
      instagram          TEXT,
      lojas              TEXT,
      cursos             TEXT,
      foto               TEXT,
      "dataCadastro"     TEXT
    )
  `);
  console.log('✓ cursos.culinaristas');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.industrias (
      id             TEXT PRIMARY KEY,
      "razaoSocial"  TEXT,
      nome           TEXT,
      cnpj           TEXT,
      telefone       TEXT,
      email          TEXT,
      endereco       TEXT,
      instagram      TEXT,
      site           TEXT,
      foto           TEXT,
      "dataCadastro" TEXT
    )
  `);
  console.log('✓ cursos.industrias');

  await pool.query(`ALTER TABLE cursos.cursos ADD COLUMN IF NOT EXISTS ingredientes TEXT`);
  console.log('✓ cursos.cursos.ingredientes');

  await pool.query(`ALTER TABLE cursos.inscricoes ADD COLUMN IF NOT EXISTS email TEXT`);
  console.log('✓ cursos.inscricoes.email');

  // guarda o nome do curso quando ele é apagado mas a inscrição continua
  // existindo (pagas sobrevivem à exclusão do curso) — sem isso, o admin
  // perde a referência de qual curso era depois que a linha em `cursos` some
  await pool.query(`ALTER TABLE cursos.inscricoes ADD COLUMN IF NOT EXISTS "cursoRemovidoNome" TEXT`);
  console.log('✓ cursos.inscricoes.cursoRemovidoNome');

  // tabela de banners — antes era criada dentro de banners.routes.js na
  // primeira requisição; centralizada aqui junto com o resto do schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos.banners (
      id            TEXT    PRIMARY KEY,
      posicao       TEXT    NOT NULL,
      imagem        TEXT    NOT NULL,
      imagem_mobile TEXT,
      link          TEXT,
      ordem         INTEGER DEFAULT 0,
      ativo         INTEGER DEFAULT 1
    )
  `);
  await pool.query(`ALTER TABLE cursos.banners ADD COLUMN IF NOT EXISTS imagem_mobile TEXT`);
  console.log('✓ cursos.banners');

  // cursos.usuarios (login local) não é mais gerenciada por aqui — login
  // passou a ser via hub-novamix (ver server/middleware/auth.middleware.js).
  // A tabela continua existindo no banco com os dados antigos, só não
  // criamos/populamos ela mais.
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
