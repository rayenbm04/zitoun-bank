require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

const EMAIL = 'demo@zitounbank.tn';
const MOT_DE_PASSE = 'demo12345';

function ilYa(jours) {
  const d = new Date();
  d.setDate(d.getDate() - jours);
  return d.toISOString().slice(0, 10);
}

async function main() {
  await pool.query('DELETE FROM users WHERE email = ?', [EMAIL]);

  const hash = await bcrypt.hash(MOT_DE_PASSE, 10);
  const [user] = await pool.query(
    'INSERT INTO users (nom, prenom, email, telephone, region, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
    ['Ben Salah', 'Amine', EMAIL, '98 123 456', 'Sfax', hash]
  );
  const u = user.insertId;

  const parcelles = [
    ['Henchir El Ain', 'Sfax', 4, 'Chemlali', 180, 'Bon'],
    ['Bled Jedd', 'Sfax', 2.5, 'Chemlali', 90, 'Moyen'],
    ['Parcelle Nord', 'Mahdia', 1.5, 'Chetoui', 30, 'À surveiller'],
  ];
  const ids = [];
  for (const p of parcelles) {
    const [r] = await pool.query(
      'INSERT INTO parcelles (user_id, nom, region, superficie_ha, variete, nb_oliviers, etat) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u, ...p]
    );
    ids.push(r.insertId);
  }

  const recoltes = [[26, 0, 1800], [22, 1, 2100], [12, 0, 2400], [8, 2, 900]];
  for (const [jours, parcelle, kg] of recoltes) {
    await pool.query('INSERT INTO recoltes (user_id, parcelle_id, date, quantite_kg) VALUES (?, ?, ?, ?)', [u, ids[parcelle], ilYa(jours), kg]);
  }

  const pressages = [
    [24, 'Huilerie Ben Salah', 1500, 298, 'Extra vierge'],
    [19, 'Huilerie El Amal', 2000, 424, 'Extra vierge'],
    [10, 'Huilerie Ben Salah', 1800, 405, 'Extra vierge'],
    [4, 'Huilerie El Amal', 700, 163, 'Vierge'],
  ];
  for (const [jours, moulin, olives, huile, qualite] of pressages) {
    await pool.query(
      'INSERT INTO pressages (user_id, date, moulin, olives_kg, huile_l, qualite) VALUES (?, ?, ?, ?, ?, ?)',
      [u, ilYa(jours), moulin, olives, huile, qualite]
    );
  }

  const ventes = [
    [15, 'Coopérative Ennour', 'Extra vierge', 400, 13.1, 'Payée'],
    [7, 'Monastir Oils', 'Extra vierge', 250, 13.6, 'Livrée'],
    [2, 'Huilerie El Amal', 'Vierge', 40, 10.9, 'En attente'],
  ];
  for (const [jours, acheteur, qualite, litres, prix, statut] of ventes) {
    await pool.query(
      'INSERT INTO ventes (user_id, date, acheteur, qualite, quantite_l, prix_par_l, statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u, ilYa(jours), acheteur, qualite, litres, prix, statut]
    );
  }

  const taches = [
    [18, 'Traitement', 2, 'Cuivre contre l’œil de paon', 1],
    [8, 'Récolte', 2, '', 1],
    [3, 'Labour', 0, 'Désherber au pied des arbres', 0],
    [-1, 'Récolte', 0, 'Prévoir 4 ouvriers et les filets', 0],
    [-4, 'Récolte', 1, '', 0],
    [-9, 'Traitement', 1, 'Traitement au cuivre après la récolte', 0],
    [-16, 'Fertilisation', null, 'Commander le fumier', 0],
    [-40, 'Taille', 0, '', 0],
  ];
  for (const [jours, type, parcelle, note, faite] of taches) {
    await pool.query(
      'INSERT INTO taches (user_id, parcelle_id, date, type, note, faite) VALUES (?, ?, ?, ?, ?, ?)',
      [u, parcelle === null ? null : ids[parcelle], ilYa(jours), type, note, faite]
    );
  }

  console.log(`Compte de démonstration prêt : ${EMAIL} / ${MOT_DE_PASSE}`);
}

main()
  .catch(err => {
    console.error('Échec du remplissage :', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
