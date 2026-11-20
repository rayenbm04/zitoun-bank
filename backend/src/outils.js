function route(traitement) {
  return (req, res) =>
    traitement(req, res).catch(err => {
      console.error(`Erreur ${req.method} ${req.originalUrl} :`, err.message);
      res.status(500).json({ message: 'Erreur serveur, réessayez dans un instant.' });
    });
}

function dateValide(valeur) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(valeur || ''))) return false;
  const d = new Date(`${valeur}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === valeur;
}

function entierPositif(valeur, max) {
  return Number.isInteger(valeur) && valeur >= 1 && valeur <= max;
}

module.exports = { route, dateValide, entierPositif };
