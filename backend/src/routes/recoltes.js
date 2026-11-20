const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { route, dateValide, entierPositif } = require('../outils');

const router = express.Router();
// Toutes les requêtes filtrent sur user_id : chaque agriculteur ne voit que ses propres données.
router.use(requireAuth);

function versRecolte(row) {
  return { id: row.id, date: row.date, parcelleId: row.parcelle_id, quantiteKg: row.quantite_kg };
}

router.get('/', route(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM recoltes WHERE user_id = ? ORDER BY date, id', [req.userId]);
  res.json(rows.map(versRecolte));
}));

router.post('/', route(async (req, res) => {
  const parcelleId = Number(req.body.parcelleId);
  const date = String(req.body.date || '');
  const quantiteKg = Number(req.body.quantiteKg);

  if (!dateValide(date)) return res.status(400).json({ message: 'Date invalide.' });
  if (!entierPositif(quantiteKg, 50000)) return res.status(400).json({ message: 'La quantité doit être comprise entre 1 et 50 000 kg.' });

  const [parcelles] = await pool.query('SELECT id FROM parcelles WHERE id = ? AND user_id = ?', [parcelleId, req.userId]);
  if (parcelles.length === 0) return res.status(400).json({ message: 'Choisissez une de vos parcelles.' });

  const [result] = await pool.query(
    'INSERT INTO recoltes (user_id, parcelle_id, date, quantite_kg) VALUES (?, ?, ?, ?)',
    [req.userId, parcelleId, date, quantiteKg]
  );
  const [rows] = await pool.query('SELECT * FROM recoltes WHERE id = ?', [result.insertId]);
  res.status(201).json(versRecolte(rows[0]));
}));

module.exports = router;
