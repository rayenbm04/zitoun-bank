import { Injectable, computed, signal } from '@angular/core';
import {
  Mouvement, Offre, Parcelle, PointPrix, Pressage, QualiteHuile, Recolte, Vente,
} from './models';

function ilYa(jours: number): string {
  const d = new Date();
  d.setDate(d.getDate() - jours);
  return d.toISOString().slice(0, 10);
}

export const DENSITE_HUILE = 0.916;
export const SEUIL_HUILE_L = 150;
export const SEUIL_OLIVES_KG = 1000;
export const CAPACITE_HUILE_L = 1500;
export const CAPACITE_OLIVES_KG = 5000;

export interface Alerte {
  id: string;
  ton: 'info' | 'ok' | 'warn' | 'danger';
  icone: string;
  titre: string;
  texte: string;
  vars: Record<string, string | number>;
  lien?: string;
  action?: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private nextId = 100;

  readonly chargement = signal(true);

  readonly parcelles = signal<Parcelle[]>([
    { id: 1, nom: 'Henchir El Ain', region: 'Sfax', superficieHa: 4, variete: 'Chemlali', nbOliviers: 180, etat: 'Bon' },
    { id: 2, nom: 'Bled Jedd', region: 'Sfax', superficieHa: 2.5, variete: 'Chemlali', nbOliviers: 90, etat: 'Moyen' },
    { id: 3, nom: 'Parcelle Nord', region: 'Mahdia', superficieHa: 1.5, variete: 'Chetoui', nbOliviers: 30, etat: 'À surveiller' },
  ]);

  readonly recoltes = signal<Recolte[]>([
    { id: 1, date: ilYa(26), parcelleId: 1, quantiteKg: 1800 },
    { id: 2, date: ilYa(22), parcelleId: 2, quantiteKg: 2100 },
    { id: 3, date: ilYa(12), parcelleId: 1, quantiteKg: 2400 },
    { id: 4, date: ilYa(8), parcelleId: 3, quantiteKg: 900 },
  ]);

  readonly pressages = signal<Pressage[]>([
    { id: 1, date: ilYa(24), moulin: 'Huilerie Ben Salah', olivesKg: 1500, huileL: 298, qualite: 'Extra vierge' },
    { id: 2, date: ilYa(19), moulin: 'Huilerie El Amal', olivesKg: 2000, huileL: 424, qualite: 'Extra vierge' },
    { id: 3, date: ilYa(10), moulin: 'Huilerie Ben Salah', olivesKg: 1800, huileL: 405, qualite: 'Extra vierge' },
    { id: 4, date: ilYa(4), moulin: 'Huilerie El Amal', olivesKg: 700, huileL: 163, qualite: 'Vierge' },
  ]);

  readonly offres = signal<Offre[]>([
    { id: 1, acheteur: 'Med Olive Export', type: 'Exportateur', region: 'Sousse', qualite: 'Extra vierge', prixParL: 14.2, quantiteMaxL: 1000, date: ilYa(0) },
    { id: 2, acheteur: 'Monastir Oils', type: 'Exportateur', region: 'Monastir', qualite: 'Extra vierge', prixParL: 13.9, quantiteMaxL: 800, date: ilYa(1) },
    { id: 3, acheteur: 'Coopérative Ennour', type: 'Coopérative', region: 'Sfax', qualite: 'Extra vierge', prixParL: 13.4, quantiteMaxL: 600, date: ilYa(0) },
    { id: 4, acheteur: 'Huilerie El Amal', type: 'Moulin', region: 'Sfax', qualite: 'Vierge', prixParL: 11.1, quantiteMaxL: 300, date: ilYa(2) },
    { id: 5, acheteur: 'SMSA El Baraka', type: 'Coopérative', region: 'Mahdia', qualite: 'Vierge', prixParL: 10.8, quantiteMaxL: 500, date: ilYa(1) },
    { id: 6, acheteur: 'Grossiste Kairouan', type: 'Grossiste', region: 'Kairouan', qualite: 'Ordinaire', prixParL: 7.6, quantiteMaxL: 2000, date: ilYa(3) },
  ]);

  readonly ventes = signal<Vente[]>([
    { id: 1, date: ilYa(15), acheteur: 'Coopérative Ennour', qualite: 'Extra vierge', quantiteL: 400, prixParL: 13.1, statut: 'Payée' },
    { id: 2, date: ilYa(7), acheteur: 'Monastir Oils', qualite: 'Extra vierge', quantiteL: 250, prixParL: 13.6, statut: 'Livrée' },
    { id: 3, date: ilYa(2), acheteur: 'Huilerie El Amal', qualite: 'Vierge', quantiteL: 40, prixParL: 10.9, statut: 'En attente' },
  ]);

  readonly historiquePrix = signal<PointPrix[]>(
    [
      [14.6, 11.9, 8.2], [14.1, 11.5, 8.0], [13.4, 11.0, 7.6],
      [12.9, 10.6, 7.3], [13.2, 10.8, 7.5], [13.6, 11.1, 7.6],
    ].map(([e, v, o], i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return { mois: d.getMonth(), annee: d.getFullYear(), 'Extra vierge': e, Vierge: v, Ordinaire: o };
    })
  );

  constructor() {
    setTimeout(() => this.chargement.set(false), 700);
  }

  readonly superficieTotale = computed(() => this.parcelles().reduce((s, p) => s + p.superficieHa, 0));
  readonly totalOliviers = computed(() => this.parcelles().reduce((s, p) => s + p.nbOliviers, 0));
  readonly totalRecolteKg = computed(() => this.recoltes().reduce((s, r) => s + r.quantiteKg, 0));
  readonly olivesPresseesKg = computed(() => this.pressages().reduce((s, p) => s + p.olivesKg, 0));
  readonly huileProduiteL = computed(() => this.pressages().reduce((s, p) => s + p.huileL, 0));

  readonly stockOlivesKg = computed(() => this.totalRecolteKg() - this.olivesPresseesKg());

  readonly stockParQualite = computed(() => {
    const stock: Record<QualiteHuile, number> = { 'Extra vierge': 0, Vierge: 0, Ordinaire: 0 };
    for (const p of this.pressages()) stock[p.qualite] += p.huileL;
    for (const v of this.ventes()) stock[v.qualite] -= v.quantiteL;
    return stock;
  });
  readonly stockHuileL = computed(() => Object.values(this.stockParQualite()).reduce((s, v) => s + v, 0));

  rendement(olivesKg: number, huileL: number): number {
    return olivesKg > 0 ? ((huileL * DENSITE_HUILE) / olivesKg) * 100 : 0;
  }
  readonly rendementMoyen = computed(() => this.rendement(this.olivesPresseesKg(), this.huileProduiteL()));

  readonly ventesDuMois = computed(() => {
    const limite = ilYa(30);
    return this.ventes().filter(v => v.date >= limite);
  });
  readonly montantDuMois = computed(() => this.ventesDuMois().reduce((s, v) => s + v.quantiteL * v.prixParL, 0));
  readonly revenus = computed(() => this.ventes().reduce((s, v) => s + v.quantiteL * v.prixParL, 0));

  readonly offresExtra = computed(() => this.offres().filter(o => o.qualite === 'Extra vierge'));
  readonly prixMoyenDuJour = computed(() => {
    const o = this.offresExtra();
    return o.length ? o.reduce((s, x) => s + x.prixParL, 0) / o.length : 0;
  });

  prixMoyen(qualite: QualiteHuile): number {
    const o = this.offres().filter(x => x.qualite === qualite);
    return o.length ? o.reduce((s, x) => s + x.prixParL, 0) / o.length : 0;
  }

  readonly meilleureOffre = computed(() =>
    this.offres().reduce<Offre | null>((best, o) => (!best || o.prixParL > best.prixParL ? o : best), null)
  );

  readonly mouvements = computed<Mouvement[]>(() => {
    const liste: Mouvement[] = [];
    for (const r of this.recoltes()) {
      liste.push({ id: 'r' + r.id, date: r.date, produit: 'olives', type: 'entree', quantite: r.quantiteKg, libelle: 'Récolte', detail: this.nomParcelle(r.parcelleId) });
    }
    for (const p of this.pressages()) {
      liste.push({ id: 'po' + p.id, date: p.date, produit: 'olives', type: 'sortie', quantite: p.olivesKg, libelle: 'Envoi au moulin', detail: p.moulin });
      liste.push({ id: 'ph' + p.id, date: p.date, produit: 'huile', type: 'entree', quantite: p.huileL, libelle: 'Pressage ' + p.qualite.toLowerCase(), detail: p.moulin });
    }
    for (const v of this.ventes()) {
      liste.push({ id: 'v' + v.id, date: v.date, produit: 'huile', type: 'sortie', quantite: v.quantiteL, libelle: 'Vente ' + v.qualite.toLowerCase(), detail: v.acheteur });
    }
    return liste.sort((a, b) => b.date.localeCompare(a.date));
  });

  readonly alertes = computed<Alerte[]>(() => {
    const liste: Alerte[] = [];
    const stock = this.stockParQualite();
    for (const q of ['Extra vierge', 'Vierge'] as QualiteHuile[]) {
      if (stock[q] < SEUIL_HUILE_L) {
        liste.push({
          id: 'stock-' + q, ton: 'warn', icone: 'attention', titre: 'al.stockBas', texte: 'al.stockBas.txt',
          vars: { q: q.toLowerCase(), v: stock[q], s: SEUIL_HUILE_L },
        });
      }
    }
    const best = this.meilleureOffre();
    if (best) {
      const moy = this.prixMoyen(best.qualite);
      liste.push({
        id: 'prix', ton: 'ok', icone: 'hausse', titre: 'al.meilleur', texte: 'al.meilleur.txt',
        vars: { p: best.prixParL.toFixed(2).replace('.', ','), a: best.acheteur, r: best.region, e: `${Math.round(((best.prixParL - moy) / moy) * 100)} %` },
        lien: '/marche', action: 'db.voirMarche',
      });
    }
    if (this.stockOlivesKg() > SEUIL_OLIVES_KG) {
      liste.push({
        id: 'olives', ton: 'info', icone: 'horloge', titre: 'al.olives', texte: 'al.olives.txt',
        vars: { v: this.stockOlivesKg().toLocaleString('fr-FR') },
      });
    }
    const aujourdHui = Date.now();
    for (const p of this.parcelles()) {
      const dates = this.recoltes().filter(r => r.parcelleId === p.id).map(r => r.date).sort();
      const derniere = dates.at(-1);
      const jours = derniere ? Math.floor((aujourdHui - new Date(derniere).getTime()) / 86_400_000) : null;
      if (jours !== null && jours > 14) {
        liste.push({
          id: 'recolte-' + p.id, ton: 'info', icone: 'calendrier', titre: 'al.recolte', texte: 'al.recolte.txt',
          vars: { p: p.nom, j: jours },
        });
      }
    }
    return liste;
  });

  nomParcelle(id: number): string {
    return this.parcelles().find(p => p.id === id)?.nom ?? 'Parcelle supprimée';
  }

  enregistrerParcelle(p: Omit<Parcelle, 'id'>, id?: number): void {
    if (id) {
      this.parcelles.update(list => list.map(x => (x.id === id ? { ...p, id } : x)));
    } else {
      this.parcelles.update(list => [...list, { ...p, id: this.nextId++ }]);
    }
  }

  supprimerParcelle(id: number): void {
    this.parcelles.update(list => list.filter(p => p.id !== id));
  }

  ajouterRecolte(r: Omit<Recolte, 'id'>): void {
    this.recoltes.update(list => [...list, { ...r, id: this.nextId++ }]);
  }

  ajouterPressage(p: Omit<Pressage, 'id'>): string | null {
    if (p.olivesKg > this.stockOlivesKg()) {
      return `Stock d’olives insuffisant : ${this.stockOlivesKg().toLocaleString('fr-FR')} kg disponibles.`;
    }
    this.pressages.update(list => [...list, { ...p, id: this.nextId++ }]);
    return null;
  }

  ajouterVente(v: Omit<Vente, 'id' | 'statut'>): string | null {
    const dispo = this.stockParQualite()[v.qualite];
    if (v.quantiteL > dispo) {
      return `Stock insuffisant : ${dispo.toLocaleString('fr-FR')} L d’huile ${v.qualite.toLowerCase()} disponibles.`;
    }
    this.ventes.update(list => [...list, { ...v, id: this.nextId++, statut: 'En attente' }]);
    return null;
  }
}
