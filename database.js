const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'clientes.db');

// Criar ou abrir o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
        // Criar a tabela de clientes se ela não existir
        db.run(`CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telefone TEXT UNIQUE NOT NULL,
            ultima_interacao DATE NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err.message);
            } else {
                console.log('Tabela "clientes" pronta.');
            }
        });
    }
});

/**
 * Verifica se já houve contato com o cliente hoje
 * @param {string} telefone - Número do telefone do cliente
 * @returns {Promise<boolean>} - True se já houve contato hoje, false caso contrário
 */
async function clienteJaContatadoHoje(telefone) {
    return new Promise((resolve, reject) => {
        const hoje = new Date().toISOString().split('T')[0];
        
        const query = `SELECT * FROM clientes WHERE telefone = ? AND ultima_interacao = ?`;
        db.get(query, [telefone, hoje], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

/**
 * Registra ou atualiza a data da última interação do cliente
 * @param {string} telefone - Número do telefone do cliente
 */
async function registrarInteracao(telefone) {
    return new Promise((resolve, reject) => {
        const hoje = new Date().toISOString().split('T')[0];
        
        // Tentar atualizar primeiro
        const updateQuery = `UPDATE clientes SET ultima_interacao = ? WHERE telefone = ?`;
        db.run(updateQuery, [hoje, telefone], function(err) {
            if (err) {
                reject(err);
                return;
            }
            
            // Se nenhuma linha foi afetada, inserir novo registro
            if (this.changes === 0) {
                const insertQuery = `INSERT INTO clientes (telefone, ultima_interacao) VALUES (?, ?)`;
                db.run(insertQuery, [telefone, hoje], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    clienteJaContatadoHoje,
    registrarInteracao
};
