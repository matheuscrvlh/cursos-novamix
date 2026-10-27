const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não configurado — defina no .env antes de subir o servidor');
    process.exit(1);
}

// Supabase exige SSL, e o certificado dele é assinado por uma CA que o Node
// não conhece. Com DATABASE_CA_CERT apontando pro certificado dessa CA
// (baixado no painel do Supabase), a conexão confere que do outro lado está
// mesmo o Supabase. Sem ele, a conexão continua cifrada mas sem conferir o
// certificado — alguém no meio do caminho poderia se passar pelo banco.
function configSsl() {
    const caminho = process.env.DATABASE_CA_CERT;
    if (!caminho) {
        console.warn('[db] DATABASE_CA_CERT não configurado — conexão com o banco SEM conferir o certificado (ver .env.example)');
        return { rejectUnauthorized: false };
    }
    return { ca: fs.readFileSync(path.resolve(__dirname, caminho), 'utf8'), rejectUnauthorized: true };
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: configSsl(),
    // Todas as tabelas do projeto vivem no schema `cursos`, não no `public`
    // padrão — sem isso, toda query nas rotas (que usa nomes sem prefixo, tipo
    // `FROM inscricoes`) cairia no schema errado. Setado via parâmetro de
    // startup da conexão (equivalente a `SET search_path` rodado antes de
    // qualquer query), em vez do evento 'connect' do pool — o pool não espera
    // esse evento terminar antes de liberar o client pra próxima query, o que
    // causava corrida com a primeira query real de cada conexão nova.
    options: '-c search_path=cursos,public',
});

pool.on('error', err => {
    console.error('Erro inesperado no pool do Postgres:', err);
});

pool.connect()
    .then(client => {
        client.release();
        console.log('Postgres conectado 🚀');
    })
    .catch(err => console.error('Erro ao conectar no banco', err));

module.exports = pool;
