const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { route, dateValide } = require('../outils');

const router = express.Router();
// Toutes les requêtes filtrent sur user_id : chaque agriculteur ne voit que ses propres données.
router.use(requireAuth);

const TYPES = ['Récolte', 'Taille', 'Traitement', 'Irrigation', 'Fertilisation', 'Labour'];

function versTache(row) {
  return { id: row.id, date: row.date, type: row.type, parcelleId: row.parcelle_id, note: row.note, faite: row.faite === 1 };
}

router.get('/', route(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM taches WHERE user_id = ? ORDER BY date, id', [req.userId]);
  res.json(rows.map(versTache));
}));

router.post('/', route(async (req, res) => {
  const type = String(req.body.type || '');
  const date = String(req.body.date || '');
  const note = String(req.body.note || '').trim();
  const parcelleId = req.body.parcelleId === null || req.body.parcelleId === undefined ? null : Number(req.body.parcelleId);

  if (!TYPES.includes(type)) return res.status(400).json({ message: 'Type de travail inconnu.' });
  if (!dateValide(date)) return res.status(400).json({ message: 'Date invalide.' });
  if (note.length > 80) return res.status(400).json({ message: 'La note ne doit pas dépasser 80 caractères.' });
  if (parcelleId !== null) {
    const [parcelles] = await pool.query('SELECT id FROM parcelles WHERE id = ? AND user_id = ?', [parcelleId, req.userId]);
    if (parcelles.length === 0) return res.status(400).json({ message: 'Choisissez une de vos parcelles.' });
  }

  const [result] = await pool.query(
    'INSERT INTO taches (user_id, parcelle_id, date, type, note) VALUES (?, ?, ?, ?, ?)',
    [req.userId, parcelleId, date, type, note]
  );
  const [rows] = await pool.query('SELECT * FROM taches WHERE id = ?', [result.insertId]);
  res.status(201).json(versTache(rows[0]));
}));

router.patch('/:id', route(async (req, res) => {
  if (typeof req.body.faite !== 'boolean') return res.status(400).json({ message: 'Le champ « faite » doit valoir vrai ou faux.' });
  const [result] = await pool.query('UPDATE taches SET faite = ? WHERE id = ? AND user_id = ?', [req.body.faite ? 1 : 0, req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Tâche introuvable.' });
  const [rows] = await pool.query('SELECT * FROM taches WHERE id = ?', [req.params.id]);
  res.json(versTache(rows[0]));
}));

router.delete('/:id', route(async (req, res) => {
  const [result] = await pool.query('DELETE FROM taches WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Tâche introuvable.' });
  res.status(204).end();
}));

module.exports = router;
