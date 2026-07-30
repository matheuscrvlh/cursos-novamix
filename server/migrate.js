require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cursos (
      id          TEXT PRIMARY KEY,
      nomeCurso   TEXT NOT NULL,
      culinarista TEXT,
      categoria   TEXT,
      duracao     TEXT,
      data        TEXT,
      hora        TEXT,
      loja        TEXT,
      valor       REAL,
      ingredientes TEXT,
      ativo       TEXT DEFAULT 'true'
    )
  `, err => { if (err) console.error('cursos:', err); else console.log('✓ cursos'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS assentos (
      id      INTEGER NOT NULL,
      cursoId TEXT NOT NULL,
      status  TEXT DEFAULT 'livre',
      PRIMARY KEY (id, cursoId)
    )
  `, err => { if (err) console.error('assentos:', err); else console.log('✓ assentos'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS fotos (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      cursoId TEXT NOT NULL,
      url     TEXT NOT NULL
    )
  `, err => { if (err) console.error('fotos:', err); else console.log('✓ fotos'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS inscricoes (
      id             TEXT PRIMARY KEY,
      cursoId        TEXT NOT NULL,
      nome           TEXT,
      cpf            TEXT,
      celular        TEXT,
      assento        INTEGER,
      formaPagamento TEXT DEFAULT 'mercadopago',
      status         TEXT DEFAULT 'pendente',
      dataInscricao  TEXT,
      mp_preference_id TEXT,
      mp_payment_id    TEXT
    )
  `, err => { if (err) console.error('inscricoes:', err); else console.log('✓ inscricoes'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS culinaristas (
      id             TEXT PRIMARY KEY,
      nomeCulinarista TEXT,
      cpf            TEXT,
      industria      TEXT,
      telefone       TEXT,
      instagram      TEXT,
      lojas          TEXT,
      cursos         TEXT,
      foto           TEXT,
      dataCadastro   TEXT
    )
  `, err => { if (err) console.error('culinaristas:', err); else console.log('✓ culinaristas'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS industrias (
      id           TEXT PRIMARY KEY,
      razaoSocial  TEXT,
      nome         TEXT,
      cnpj         TEXT,
      telefone     TEXT,
      email        TEXT,
      endereco     TEXT,
      instagram    TEXT,
      site         TEXT,
      foto         TEXT,
      dataCadastro TEXT
    )
  `, err => { if (err) console.error('industrias:', err); else console.log('✓ industrias'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS cursosInfantis (
      id              TEXT PRIMARY KEY,
      nomeCurso       TEXT,
      tipo            TEXT,
      culinarista     TEXT,
      categoria       TEXT,
      duracao         TEXT,
      data            TEXT,
      hora            TEXT,
      loja            TEXT,
      valor           REAL,
      nomeResponsavel TEXT,
      nomeAluno       TEXT,
      modalidade      TEXT
    )
  `, err => { if (err) console.error('cursosInfantis:', err); else console.log('✓ cursosInfantis'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS inscricoesInfantis (
      id              TEXT PRIMARY KEY,
      cursoId         TEXT,
      nomeResponsavel TEXT,
      telefone        TEXT,
      nomeCrianca     TEXT,
      idadeCrianca    TEXT,
      cpf             TEXT,
      formaPagamento  TEXT,
      status          TEXT,
      dataInscricao   TEXT
    )
  `, err => { if (err) console.error('inscricoesInfantis:', err); else console.log('✓ inscricoesInfantis'); });

  // ALTER TABLE seguro: ignora erro se coluna já existir
  db.run('ALTER TABLE cursos ADD COLUMN ingredientes TEXT', err => {
    if (err && !err.message.includes('duplicate column')) console.error('ingredientes:', err);
    else console.log('✓ cursos.ingredientes');
  });

  db.run('ALTER TABLE inscricoes ADD COLUMN mp_preference_id TEXT', err => {
    if (err && !err.message.includes('duplicate column')) console.error('mp_preference_id:', err);
    else console.log('✓ inscricoes.mp_preference_id');
  });
  db.run('ALTER TABLE inscricoes ADD COLUMN mp_payment_id TEXT', err => {
    if (err && !err.message.includes('duplicate column')) console.error('mp_payment_id:', err);
    else console.log('✓ inscricoes.mp_payment_id');
  });
  db.run('ALTER TABLE inscricoes ADD COLUMN email TEXT', err => {
    if (err && !err.message.includes('duplicate column')) console.error('email:', err);
    else console.log('✓ inscricoes.email');
  });

  // guarda o nome do curso quando ele é apagado mas a inscrição continua
  // existindo (pagas sobrevivem à exclusão do curso) — sem isso, o admin
  // perde a referência de qual curso era depois que a linha em `cursos` some
  db.run('ALTER TABLE inscricoes ADD COLUMN cursoRemovidoNome TEXT', err => {
    if (err && !err.message.includes('duplicate column')) console.error('cursoRemovidoNome:', err);
    else console.log('✓ inscricoes.cursoRemovidoNome');
  });

  // método de pagamento de verdade (pix/cartao), preenchido só depois que o
  // cliente escolhe no Brick — formaPagamento continua fixo em 'mercadopago'
  // (é o gateway, usado pra decidir se mostra Verificar/Reembolsar no admin)
  db.run('ALTER TABLE inscricoes ADD COLUMN metodoPagamento TEXT', err => {
    if (err && !err.message.includes('duplicate column')) console.error('metodoPagamento:', err);
    else console.log('✓ inscricoes.metodoPagamento');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id           TEXT PRIMARY KEY,
      usuario      TEXT UNIQUE NOT NULL,
      senha        TEXT NOT NULL,
      dataCadastro TEXT
    )
  `, async (err) => {
    if (err) { console.error('usuarios:', err); return; }
    console.log('✓ usuarios');

    // Seed: cria admin padrão se não existir nenhum usuário
    db.get('SELECT COUNT(*) as total FROM usuarios', [], async (err2, row) => {
      if (err2 || row.total > 0) return;
      const hash = await bcrypt.hash(process.env.ADMIN_SEED_SENHA || 'changeme', 12);
      db.run(
        'INSERT INTO usuarios (id, usuario, senha, dataCadastro) VALUES (?, ?, ?, ?)',
        [uuidv4(), 'admin', hash, new Date().toISOString()],
        (err3) => {
          if (err3) console.error('seed admin:', err3);
          else console.log('✓ usuário admin criado (senha: admin123)');
        }
      );
    });
  });
});

setTimeout(() => { db.close(); console.log('Migração concluída.'); }, 1500);
