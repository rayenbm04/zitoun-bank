const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { route, dateValide, entierPositif } = require('../outils');

const router = express.Router();
// Toutes les requêtes filtrent sur user_id : chaque agriculteur ne voit que ses propres données.
router.use(requireAuth);

const QUALITES = ['Extra vierge', 'Vierge', 'Ordinaire'];

function versPressage(row) {
  return { id: row.id, date: row.date, moulin: row.moulin, olivesKg: row.olives_kg, huileL: row.huile_l, qualite: row.qualite };
}

/** Olives disponibles = total récolté − total déjà pressé. Le contrôle est refait côté serveur. */
async function stockOlives(userId) {
  const [[r]] = await pool.query(
    `SELECT (SELECT COALESCE(SUM(quantite_kg), 0) FROM recoltes WHERE user_id = ?)
          - (SELECT COALESCE(SUM(olives_kg), 0) FROM pressages WHERE user_id = ?) AS stock`,
    [userId, userId]
  );
  return Number(r.stock);
}

router.get('/', route(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pressages WHERE user_id = ? ORDER BY date, id', [req.userId]);
  res.json(rows.map(versPressage));
}));

router.post('/', route(async (req, res) => {
  const moulin = String(req.body.moulin || '').trim();
  const date = String(req.body.date || '');
  const olivesKg = Number(req.body.olivesKg);
  const huileL = Number(req.body.huileL);
  const qualite = String(req.body.qualite || '');

  if (!moulin || moulin.length > 100) return res.status(400).json({ message: 'Indiquez le moulin (100 caractères au maximum).' });
  if (!dateValide(date)) return res.status(400).json({ message: 'Date invalide.' });
  if (!entierPositif(olivesKg, 100000)) return res.status(400).json({ message: 'La quantité d’olives doit être un entier positif.' });
  if (!(huileL > 0 && huileL <= olivesKg)) return res.status(400).json({ message: 'La quantité d’huile est incohérente avec les olives pressées.' });
  if (!QUALITES.includes(qualite)) return res.status(400).json({ message: 'Qualité inconnue.' });

  const stock = await stockOlives(req.userId);
  if (olivesKg > stock) {
    return res.status(400).json({ message: `Stock d’olives insuffisant : ${stock.toLocaleString('fr-FR')} kg disponibles.` });
  }

  const [result] = await pool.query(
    'INSERT INTO pressages (user_id, date, moulin, olives_kg, huile_l, qualite) VALUES (?, ?, ?, ?, ?, ?)',
    [req.userId, date, moulin, olivesKg, huileL, qualite]
  );
  const [rows] = await pool.query('SELECT * FROM pressages WHERE id = ?', [result.insertId]);
  res.status(201).json(versPressage(rows[0]));
}));

module.exports = router;
