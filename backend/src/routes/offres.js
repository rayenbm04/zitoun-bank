const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { route } = require('../outils');

const router = express.Router();
router.use(requireAuth);

function versOffre(row) {
  return {
    id: row.id,
    acheteur: row.acheteur,
    type: row.type,
    region: row.region,
    qualite: row.qualite,
    prixParL: row.prix_par_l,
    quantiteMaxL: row.quantite_max_l,
    date: row.date,
  };
}

router.get('/', route(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM offres ORDER BY date DESC, prix_par_l DESC');
  res.json(rows.map(versOffre));
}));

module.exports = router;
