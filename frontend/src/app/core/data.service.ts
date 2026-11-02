import { Injectable, computed, signal } from '@angular/core';
import {
  Offre, Parcelle, PointPrix, Production, QualiteHuile, Recolte, Vente,
} from './models';

/**
 * Données fictives de démonstration, gardées en mémoire.
 * Elles sont réinitialisées à chaque rechargement de la page.
 * Seules l'inscription et la connexion passent par l'API (backend).
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  private nextId = 100;

  readonly parcelles = signal<Parcelle[]>([
    { id: 1, nom: 'Henchir El Ain', localisation: 'Sfax', superficieHa: 4, variete: 'Chemlali', nbOliviers: 180, ageMoyen: 35, etat: 'Bon' },
    { id: 2, nom: 'Bled Jedd', localisation: 'Sfax', superficieHa: 2.5, variete: 'Chemlali', nbOliviers: 90, ageMoyen: 60, etat: 'Moyen' },
    { id: 3, nom: 'Parcelle Nord', localisation: 'Mahdia', superficieHa: 1.5, variete: 'Chétoui', nbOliviers: 30, ageMoyen: 12, etat: 'À surveiller' },
  ]);

  readonly recoltes = signal<Recolte[]>([
    { id: 1, date: '2025-11-08', parcelleId: 1, quantiteKg: 4200 },
    { id: 2, date: '2025-11-20', parcelleId: 2, quantiteKg: 2100 },
    { id: 3, date: '2025-12-02', parcelleId: 3, quantiteKg: 900 },
  ]);

  readonly productions = signal<Production[]>([
    { id: 1, date: '2025-11-10', moulin: 'Huilerie Ben Salah', olivesKg: 4000, huileL: 860, acidite: 0.6 },
    { id: 2, date: '2025-11-22', moulin: 'Huilerie El Amal', olivesKg: 2000, huileL: 400, acidite: 1.4 },
  ]);

  readonly offres = signal<Offre[]>([
    { id: 1, acheteur: 'Coopérative Ennour', type: 'Coopérative', region: 'Sfax', prixParL: 12.5, qualiteMin: 'Vierge', date: '2025-12-10' },
    { id: 2, acheteur: 'Med Olive Export', type: 'Exportateur', region: 'Sousse', prixParL: 13.8, qualiteMin: 'Extra vierge', date: '2025-12-12' },
    { id: 3, acheteur: 'Grossiste Kairouan', type: 'Grossiste', region: 'Kairouan', prixParL: 8.0, qualiteMin: 'Ordinaire', date: '2025-12-15' },
    { id: 4, acheteur: 'Huilerie El Amal', type: 'Moulin', region: 'Sfax', prixParL: 11.2, qualiteMin: 'Vierge', date: '2025-12-14' },
  ]);

  readonly ventes = signal<Vente[]>([
    { id: 1, date: '2025-11-28', acheteur: 'Coopérative Ennour', quantiteL: 300, prixParL: 12.0 },
    { id: 2, date: '2025-12-05', acheteur: 'Huilerie El Amal', quantiteL: 150, prixParL: 11.0 },
  ]);

  /** Évolution du prix moyen de l'huile (DT/L), données fictives */
  readonly historiquePrix = signal<PointPrix[]>([
    { mois: 'Juil.', prix: 15.5 },
    { mois: 'Août', prix: 14.8 },
    { mois: 'Sept.', prix: 14.0 },
    { mois: 'Oct.', prix: 12.4 },
    { mois: 'Nov.', prix: 12.8 },
    { mois: 'Déc.', prix: 11.9 },
  ]);

  // ---- Valeurs calculées automatiquement ----

  readonly totalOliviers = computed(() => this.parcelles().reduce((s, p) => s + p.nbOliviers, 0));
  readonly totalRecolteKg = computed(() => this.recoltes().reduce((s, r) => s + r.quantiteKg, 0));
  readonly olivesPresseesKg = computed(() => this.productions().reduce((s, p) => s + p.olivesKg, 0));
  readonly huileProduiteL = computed(() => this.productions().reduce((s, p) => s + p.huileL, 0));
  readonly huileVendueL = computed(() => this.ventes().reduce((s, v) => s + v.quantiteL, 0));

  /** Stock d'olives = olives récoltées - olives envoyées au moulin */
  readonly stockOlivesKg = computed(() => this.totalRecolteKg() - this.olivesPresseesKg());
  /** Stock d'huile = huile produite - huile vendue */
  readonly stockHuileL = computed(() => this.huileProduiteL() - this.huileVendueL());

  readonly revenus = computed(() => this.ventes().reduce((s, v) => s + v.quantiteL * v.prixParL, 0));

  /** Rendement moyen en litres d'huile pour 100 kg d'olives */
  readonly rendementMoyen = computed(() => {
    const olives = this.olivesPresseesKg();
    return olives > 0 ? (this.huileProduiteL() / olives) * 100 : 0;
  });

  readonly prixMoyenMarche = computed(() => {
    const o = this.offres();
    return o.length ? o.reduce((s, x) => s + x.prixParL, 0) / o.length : 0;
  });

  readonly meilleureOffre = computed(() =>
    this.offres().reduce<Offre | null>((best, o) => (!best || o.prixParL > best.prixParL ? o : best), null)
  );

  readonly alertes = computed(() => {
    const liste: string[] = [];
    if (this.stockHuileL() < 200) liste.push('Stock d’huile faible (moins de 200 L).');
    if (this.stockOlivesKg() > 1000) liste.push('Plus de 1 000 kg d’olives en attente de passage au moulin.');
    const surveiller = this.parcelles().filter(p => p.etat === 'À surveiller').length;
    if (surveiller > 0) liste.push(`${surveiller} parcelle(s) à surveiller.`);
    const best = this.meilleureOffre();
    if (best && best.prixParL > this.prixMoyenMarche()) {
      liste.push(`Meilleure offre du moment : ${best.prixParL.toFixed(2).replace('.', ',')} DT/L (${best.acheteur}).`);
    }
    return liste;
  });

  // ---- Outils ----

  qualite(acidite: number): QualiteHuile {
    if (acidite <= 0.8) return 'Extra vierge';
    if (acidite <= 2) return 'Vierge';
    return 'Ordinaire';
  }

  nomParcelle(id: number): string {
    return this.parcelles().find(p => p.id === id)?.nom ?? '—';
  }

  // ---- Ajouts / suppressions ----

  ajouterParcelle(p: Omit<Parcelle, 'id'>): void {
    this.parcelles.update(list => [...list, { ...p, id: this.nextId++ }]);
  }

  supprimerParcelle(id: number): void {
    this.parcelles.update(list => list.filter(p => p.id !== id));
  }

  ajouterRecolte(r: Omit<Recolte, 'id'>): void {
    this.recoltes.update(list => [...list, { ...r, id: this.nextId++ }]);
  }

  /** Renvoie un message d'erreur, ou null si l'ajout a réussi */
  ajouterProduction(p: Omit<Production, 'id'>): string | null {
    if (p.olivesKg > this.stockOlivesKg()) {
      return `Stock d’olives insuffisant (${this.stockOlivesKg()} kg disponibles).`;
    }
    this.productions.update(list => [...list, { ...p, id: this.nextId++ }]);
    return null;
  }

  /** Renvoie un message d'erreur, ou null si la vente est enregistrée (le stock baisse automatiquement) */
  ajouterVente(v: Omit<Vente, 'id'>): string | null {
    if (v.quantiteL > this.stockHuileL()) {
      return `Stock d’huile insuffisant (${this.stockHuileL()} L disponibles).`;
    }
    this.ventes.update(list => [...list, { ...v, id: this.nextId++ }]);
    return null;
  }
}
