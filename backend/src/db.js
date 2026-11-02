// Connexion à la base MySQL (pool de connexions réutilisables)
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zitoun_bank',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
