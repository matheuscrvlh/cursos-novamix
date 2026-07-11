const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/banco.db', (err) => {
    if (err) {
        console.error('Erro ao conectar no banco', err);
    } else {
        console.log('SQLite conectado 🚀');
    }
});

module.exports = db;