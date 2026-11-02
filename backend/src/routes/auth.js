// Routes d'authentification : inscription, connexion, profil connecté
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Crée un jeton de connexion pour un utilisateur
function createToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Ne renvoie jamais le mot de passe au client
function publicUser(row) {
  return {
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email,
    telephone: row.telephone,
    region: row.region,
    createdAt: row.created_at,
  };
}

// POST /api/auth/register : inscription
router.post('/register', async (req, res) => {
  try {
    const nom = String(req.body.nom || '').trim();
    const prenom = String(req.body.prenom || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const telephone = String(req.body.telephone || '').trim() || null;
    const region = String(req.body.region || '').trim() || null;
    const password = String(req.body.password || '');

    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ message: 'Nom, prénom, e-mail et mot de passe sont obligatoires.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cette adresse e-mail.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (nom, prenom, email, telephone, region, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, region, passwordHash]
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return res.status(201).json({ token: createToken(result.insertId), user: publicUser(rows[0]) });
  } catch (err) {
    console.error('Erreur inscription :', err.message);
    return res.status(500).json({ message: 'Erreur serveur lors de l’inscription.' });
  }
});

// POST /api/auth/login : connexion
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail et mot de passe sont obligatoires.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    const valid = user && (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' });
    }

    return res.json({ token: createToken(user.id), user: publicUser(user) });
  } catch (err) {
    console.error('Erreur connexion :', err.message);
    return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
});

// GET /api/auth/me : utilisateur connecté (route protégée)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    return res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    console.error('Erreur profil :', err.message);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
