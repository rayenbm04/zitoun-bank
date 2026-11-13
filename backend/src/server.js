require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET manquant : copiez .env.example en .env et remplissez-le.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:4200' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', database: 'ok' });
  } catch (err) {
    res.status(500).json({ api: 'ok', database: 'erreur', detail: err.message });
  }
});

app.use((req, res) => res.status(404).json({ message: 'Route introuvable.' }));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`API Zitoun Bank démarrée sur http://localhost:${PORT}`);
});
