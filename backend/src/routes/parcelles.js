const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { route, entierPositif } = require('../outils');

const router = express.Router();
// Toutes les requêtes filtrent sur user_id : chaque agriculteur ne voit que ses propres données.
router.use(requireAuth);

const REGIONS = ['Sfax', 'Sousse', 'Monastir', 'Mahdia', 'Kairouan'];
const VARIETES = ['Chemlali', 'Chetoui'];
const ETATS = ['Bon', 'Moyen', 'À surveiller'];

function versParcelle(row) {
  return {
    id: row.id,
    nom: row.nom,
    region: row.region,
    superficieHa: row.superficie_ha,
    variete: row.variete,
    nbOliviers: row.nb_oliviers,
    etat: row.etat,
  };
}

/** Valide le corps de la requête ; renvoie { parcelle } ou { erreur } (message affiché tel quel dans l’interface). */
function lireParcelle(body) {
  const p = {
    nom: String(body.nom || '').trim(),
    region: String(body.region || ''),
    superficieHa: Number(body.superficieHa),
    variete: String(body.variete || ''),
    nbOliviers: Number(body.nbOliviers),
    etat: String(body.etat || ''),
  };
  if (!p.nom || p.nom.length > 80) return { erreur: 'Le nom de la parcelle est obligatoire (80 caractères au maximum).' };
  if (!REGIONS.includes(p.region)) return { erreur: 'Région inconnue.' };
  if (!VARIETES.includes(p.variete)) return { erreur: 'Variété inconnue.' };
  if (!ETATS.includes(p.etat)) return { erreur: 'État inconnu.' };
  if (!(p.superficieHa > 0 && p.superficieHa <= 10000)) return { erreur: 'La superficie doit être comprise entre 0 et 10 000 ha.' };
  if (!entierPositif(p.nbOliviers, 1000000)) return { erreur: 'Le nombre d’oliviers doit être un entier positif.' };
  return { parcelle: p };
}

async function trouver(id, userId) {
  const [rows] = await pool.query('SELECT * FROM parcelles WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0] ? versParcelle(rows[0]) : null;
}

router.get('/', route(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM parcelles WHERE user_id = ? ORDER BY id', [req.userId]);
  res.json(rows.map(versParcelle));
}));

router.post('/', route(async (req, res) => {
  const { parcelle: p, erreur } = lireParcelle(req.body);
  if (erreur) return res.status(400).json({ message: erreur });
  const [result] = await pool.query(
    'INSERT INTO parcelles (user_id, nom, region, superficie_ha, variete, nb_oliviers, etat) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.userId, p.nom, p.region, p.superficieHa, p.variete, p.nbOliviers, p.etat]
  );
  res.status(201).json(await trouver(result.insertId, req.userId));
}));

router.put('/:id', route(async (req, res) => {
  const { parcelle: p, erreur } = lireParcelle(req.body);
  if (erreur) return res.status(400).json({ message: erreur });
  const [result] = await pool.query(
    'UPDATE parcelles SET nom = ?, region = ?, superficie_ha = ?, variete = ?, nb_oliviers = ?, etat = ? WHERE id = ? AND user_id = ?',
    [p.nom, p.region, p.superficieHa, p.variete, p.nbOliviers, p.etat, req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Parcelle introuvable.' });
  res.json(await trouver(req.params.id, req.userId));
}));

router.delete('/:id', route(async (req, res) => {
  const [result] = await pool.query('DELETE FROM parcelles WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Parcelle introuvable.' });
  res.status(204).end();
}));

module.exports = router;
