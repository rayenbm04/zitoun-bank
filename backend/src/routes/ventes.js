const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { route, dateValide } = require('../outils');

const router = express.Router();
// Toutes les requêtes filtrent sur user_id : chaque agriculteur ne voit que ses propres données.
router.use(requireAuth);

const QUALITES = ['Extra vierge', 'Vierge', 'Ordinaire'];

function versVente(row) {
  return {
    id: row.id,
    date: row.date,
    acheteur: row.acheteur,
    qualite: row.qualite,
    quantiteL: row.quantite_l,
    prixParL: row.prix_par_l,
    statut: row.statut,
  };
}

/** Huile disponible pour une qualité = huile pressée − huile vendue. */
async function stockHuile(userId, qualite) {
  const [[r]] = await pool.query(
    `SELECT (SELECT COALESCE(SUM(huile_l), 0) FROM pressages WHERE user_id = ? AND qualite = ?)
          - (SELECT COALESCE(SUM(quantite_l), 0) FROM ventes WHERE user_id = ? AND qualite = ?) AS stock`,
    [userId, qualite, userId, qualite]
  );
  return Number(r.stock);
}

router.get('/', route(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM ventes WHERE user_id = ? ORDER BY date, id', [req.userId]);
  res.json(rows.map(versVente));
}));

router.post('/', route(async (req, res) => {
  const acheteur = String(req.body.acheteur || '').trim();
  const date = String(req.body.date || '');
  const qualite = String(req.body.qualite || '');
  const quantiteL = Number(req.body.quantiteL);
  const prixParL = Number(req.body.prixParL);

  if (!acheteur || acheteur.length > 100) return res.status(400).json({ message: 'Indiquez l’acheteur (100 caractères au maximum).' });
  if (!dateValide(date)) return res.status(400).json({ message: 'Date invalide.' });
  if (!QUALITES.includes(qualite)) return res.status(400).json({ message: 'Qualité inconnue.' });
  if (!(quantiteL > 0 && quantiteL <= 100000)) return res.status(400).json({ message: 'La quantité doit être supérieure à 0 L.' });
  if (!(prixParL > 0 && prixParL <= 100)) return res.status(400).json({ message: 'Le prix par litre doit être compris entre 0 et 100 TND.' });

  const stock = await stockHuile(req.userId, qualite);
  if (quantiteL > stock) {
    return res.status(400).json({
      message: `Stock insuffisant : ${stock.toLocaleString('fr-FR')} L d’huile ${qualite.toLowerCase()} disponibles.`,
    });
  }

  const [result] = await pool.query(
    'INSERT INTO ventes (user_id, date, acheteur, qualite, quantite_l, prix_par_l) VALUES (?, ?, ?, ?, ?, ?)',
    [req.userId, date, acheteur, qualite, quantiteL, prixParL]
  );
  const [rows] = await pool.query('SELECT * FROM ventes WHERE id = ?', [result.insertId]);
  res.status(201).json(versVente(rows[0]));
}));

module.exports = router;
