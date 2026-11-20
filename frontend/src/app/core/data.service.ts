import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './config';
import {
  Mouvement,
  Offre,
  Parcelle,
  PointPrix,
  Pressage,
  QualiteHuile,
  Recolte,
  Tache,
  Vente,
} from './models';

function ilYa(jours: number): string {
  const d = new Date();
  d.setDate(d.getDate() - jours);
  return d.toISOString().slice(0, 10);
}

/** Transforme une erreur HTTP en message lisible pour l’agriculteur (le backend renvoie { message }). */
export function messageErreur(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return 'Le serveur ne répond pas. Vérifiez que l’API est lancée.';
    return e.error?.message ?? 'Une erreur est survenue, réessayez.';
  }
  return 'Une erreur est survenue, réessayez.';
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
/**
 * Source unique des données de l’espace agriculteur.
 * Les listes viennent de l’API (une requête par table) et sont gardées dans des signals ;
 * les totaux, stocks et alertes sont des computed recalculés automatiquement à chaque changement.
 */
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly chargement = signal(true);
  readonly erreurChargement = signal(false);

  readonly parcelles = signal<Parcelle[]>([]);

  readonly recoltes = signal<Recolte[]>([]);

  readonly pressages = signal<Pressage[]>([]);

  readonly offres = signal<Offre[]>([]);

  readonly ventes = signal<Vente[]>([]);

  readonly taches = signal<Tache[]>([]);

  readonly historiquePrix = signal<PointPrix[]>(
    [
      [14.6, 11.9, 8.2],
      [14.1, 11.5, 8.0],
      [13.4, 11.0, 7.6],
      [12.9, 10.6, 7.3],
      [13.2, 10.8, 7.5],
      [13.6, 11.1, 7.6],
    ].map(([e, v, o], i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return {
        mois: d.getMonth(),
        annee: d.getFullYear(),
        'Extra vierge': e,
        Vierge: v,
        Ordinaire: o,
      };
    }),
  );

  /** Recharge les données à la connexion et les vide à la déconnexion. */
  private readonly utilisateur = computed(() => this.auth.user()?.id ?? null);

  constructor() {
    effect(() => {
      const id = this.utilisateur();
      untracked(() => (id === null ? this.vider() : this.charger()));
    });
  }

  /** Charge toutes les listes en parallèle ; le tableau de bord affiche des squelettes en attendant. */
  charger(): void {
    this.chargement.set(true);
    this.erreurChargement.set(false);
    forkJoin({
      parcelles: this.http.get<Parcelle[]>(`${API_URL}/parcelles`),
      recoltes: this.http.get<Recolte[]>(`${API_URL}/recoltes`),
      pressages: this.http.get<Pressage[]>(`${API_URL}/pressages`),
      offres: this.http.get<Offre[]>(`${API_URL}/offres`),
      ventes: this.http.get<Vente[]>(`${API_URL}/ventes`),
      taches: this.http.get<Tache[]>(`${API_URL}/taches`),
    }).subscribe({
      next: (d) => {
        this.parcelles.set(d.parcelles);
        this.recoltes.set(d.recoltes);
        this.pressages.set(d.pressages);
        this.offres.set(d.offres);
        this.ventes.set(d.ventes);
        this.taches.set(d.taches);
        this.chargement.set(false);
      },
      error: () => {
        this.erreurChargement.set(true);
        this.chargement.set(false);
      },
    });
  }

  private vider(): void {
    this.parcelles.set([]);
    this.recoltes.set([]);
    this.pressages.set([]);
    this.offres.set([]);
    this.ventes.set([]);
    this.taches.set([]);
  }

  readonly superficieTotale = computed(() =>
    this.parcelles().reduce((s, p) => s + p.superficieHa, 0),
  );
  readonly totalOliviers = computed(() => this.parcelles().reduce((s, p) => s + p.nbOliviers, 0));
  readonly totalRecolteKg = computed(() => this.recoltes().reduce((s, r) => s + r.quantiteKg, 0));
  readonly olivesPresseesKg = computed(() => this.pressages().reduce((s, p) => s + p.olivesKg, 0));
  readonly huileProduiteL = computed(() => this.pressages().reduce((s, p) => s + p.huileL, 0));

  /** Olives récoltées moins olives déjà envoyées au moulin. */
  readonly stockOlivesKg = computed(() => this.totalRecolteKg() - this.olivesPresseesKg());

  /** Huile pressée moins huile vendue, pour chaque qualité. */
  readonly stockParQualite = computed(() => {
    const stock: Record<QualiteHuile, number> = { 'Extra vierge': 0, Vierge: 0, Ordinaire: 0 };
    for (const p of this.pressages()) stock[p.qualite] += p.huileL;
    for (const v of this.ventes()) stock[v.qualite] -= v.quantiteL;
    return stock;
  });
  readonly stockHuileL = computed(() =>
    Object.values(this.stockParQualite()).reduce((s, v) => s + v, 0),
  );

  /** Rendement en % : kilos d’huile (litres × densité 0,916) pour 100 kg d’olives. */
  rendement(olivesKg: number, huileL: number): number {
    return olivesKg > 0 ? ((huileL * DENSITE_HUILE) / olivesKg) * 100 : 0;
  }
  readonly rendementMoyen = computed(() =>
    this.rendement(this.olivesPresseesKg(), this.huileProduiteL()),
  );

  readonly ventesDuMois = computed(() => {
    const limite = ilYa(30);
    return this.ventes().filter((v) => v.date >= limite);
  });
  readonly montantDuMois = computed(() =>
    this.ventesDuMois().reduce((s, v) => s + v.quantiteL * v.prixParL, 0),
  );
  readonly revenus = computed(() =>
    this.ventes().reduce((s, v) => s + v.quantiteL * v.prixParL, 0),
  );

  readonly offresExtra = computed(() => this.offres().filter((o) => o.qualite === 'Extra vierge'));
  readonly prixMoyenDuJour = computed(() => {
    const o = this.offresExtra();
    return o.length ? o.reduce((s, x) => s + x.prixParL, 0) / o.length : 0;
  });

  prixMoyen(qualite: QualiteHuile): number {
    const o = this.offres().filter((x) => x.qualite === qualite);
    return o.length ? o.reduce((s, x) => s + x.prixParL, 0) / o.length : 0;
  }

  readonly meilleureOffre = computed(() =>
    this.offres().reduce<Offre | null>(
      (best, o) => (!best || o.prixParL > best.prixParL ? o : best),
      null,
    ),
  );

  readonly mouvements = computed<Mouvement[]>(() => {
    const liste: Mouvement[] = [];
    for (const r of this.recoltes()) {
      liste.push({
        id: 'r' + r.id,
        date: r.date,
        produit: 'olives',
        type: 'entree',
        quantite: r.quantiteKg,
        libelle: 'Récolte',
        detail: this.nomParcelle(r.parcelleId),
      });
    }
    for (const p of this.pressages()) {
      liste.push({
        id: 'po' + p.id,
        date: p.date,
        produit: 'olives',
        type: 'sortie',
        quantite: p.olivesKg,
        libelle: 'Envoi au moulin',
        detail: p.moulin,
      });
      liste.push({
        id: 'ph' + p.id,
        date: p.date,
        produit: 'huile',
        type: 'entree',
        quantite: p.huileL,
        libelle: 'Pressage ' + p.qualite.toLowerCase(),
        detail: p.moulin,
      });
    }
    for (const v of this.ventes()) {
      liste.push({
        id: 'v' + v.id,
        date: v.date,
        produit: 'huile',
        type: 'sortie',
        quantite: v.quantiteL,
        libelle: 'Vente ' + v.qualite.toLowerCase(),
        detail: v.acheteur,
      });
    }
    return liste.sort((a, b) => b.date.localeCompare(a.date));
  });

  readonly tachesEnRetard = computed(() => {
    const aujourdhui = ilYa(0);
    return this.taches().filter((t) => !t.faite && t.date < aujourdhui);
  });

  /** Alertes du tableau de bord et de la cloche : tâches en retard, stock bas, meilleur prix, olives à presser, récolte oubliée. */
  readonly alertes = computed<Alerte[]>(() => {
    if (this.chargement() || this.erreurChargement()) return [];
    const liste: Alerte[] = [];
    const retard = this.tachesEnRetard().length;
    if (retard) {
      liste.push({
        id: 'taches',
        ton: 'warn',
        icone: 'calendrier',
        titre: 'al.retard',
        texte: 'al.retard.txt',
        vars: { n: retard },
        lien: '/calendrier',
        action: 'db.voirCalendrier',
      });
    }
    const stock = this.stockParQualite();
    for (const q of ['Extra vierge', 'Vierge'] as QualiteHuile[]) {
      if (stock[q] < SEUIL_HUILE_L) {
        liste.push({
          id: 'stock-' + q,
          ton: 'warn',
          icone: 'attention',
          titre: 'al.stockBas',
          texte: 'al.stockBas.txt',
          vars: { q: q.toLowerCase(), v: stock[q], s: SEUIL_HUILE_L },
          lien: '/stocks',
          action: 'db.voirStocks',
        });
      }
    }
    const best = this.meilleureOffre();
    if (best) {
      const moy = this.prixMoyen(best.qualite);
      liste.push({
        id: 'prix',
        ton: 'ok',
        icone: 'hausse',
        titre: 'al.meilleur',
        texte: 'al.meilleur.txt',
        vars: {
          p: best.prixParL.toFixed(2).replace('.', ','),
          a: best.acheteur,
          r: best.region,
          e: `${Math.round(((best.prixParL - moy) / moy) * 100)} %`,
        },
        lien: '/marche',
        action: 'db.voirMarche',
      });
    }
    if (this.stockOlivesKg() > SEUIL_OLIVES_KG) {
      liste.push({
        id: 'olives',
        ton: 'info',
        icone: 'horloge',
        titre: 'al.olives',
        texte: 'al.olives.txt',
        vars: { v: this.stockOlivesKg().toLocaleString('fr-FR') },
        lien: '/production',
        action: 'db.saisir',
      });
    }
    const aujourdHui = Date.now();
    for (const p of this.parcelles()) {
      const dates = this.recoltes()
        .filter((r) => r.parcelleId === p.id)
        .map((r) => r.date)
        .sort();
      const derniere = dates.at(-1);
      const jours = derniere
        ? Math.floor((aujourdHui - new Date(derniere).getTime()) / 86_400_000)
        : null;
      if (jours !== null && jours > 14) {
        liste.push({
          id: 'recolte-' + p.id,
          ton: 'info',
          icone: 'calendrier',
          titre: 'al.recolte',
          texte: 'al.recolte.txt',
          vars: { p: p.nom, j: jours },
          lien: '/recoltes',
          action: 'db.saisir',
        });
      }
    }
    return liste;
  });

  nomParcelle(id: number | null): string {
    return this.parcelles().find((p) => p.id === id)?.nom ?? 'Parcelle supprimée';
  }

  async enregistrerParcelle(p: Omit<Parcelle, 'id'>, id?: number): Promise<string | null> {
    try {
      const requete = id
        ? this.http.put<Parcelle>(`${API_URL}/parcelles/${id}`, p)
        : this.http.post<Parcelle>(`${API_URL}/parcelles`, p);
      const enregistree = await firstValueFrom(requete);
      this.parcelles.update((list) =>
        id ? list.map((x) => (x.id === id ? enregistree : x)) : [...list, enregistree],
      );
      return null;
    } catch (e) {
      return messageErreur(e);
    }
  }

  async supprimerParcelle(id: number): Promise<string | null> {
    try {
      await firstValueFrom(this.http.delete(`${API_URL}/parcelles/${id}`));
      this.parcelles.update((list) => list.filter((p) => p.id !== id));
      this.recoltes.update((list) =>
        list.map((r) => (r.parcelleId === id ? { ...r, parcelleId: null } : r)),
      );
      this.taches.update((list) =>
        list.map((t) => (t.parcelleId === id ? { ...t, parcelleId: null } : t)),
      );
      return null;
    } catch (e) {
      return messageErreur(e);
    }
  }

  async ajouterRecolte(r: Omit<Recolte, 'id'>): Promise<string | null> {
    try {
      const enregistree = await firstValueFrom(this.http.post<Recolte>(`${API_URL}/recoltes`, r));
      this.recoltes.update((list) => [...list, enregistree]);
      return null;
    } catch (e) {
      return messageErreur(e);
    }
  }

  async ajouterTache(t: Omit<Tache, 'id' | 'faite'>): Promise<string | null> {
    try {
      const enregistree = await firstValueFrom(this.http.post<Tache>(`${API_URL}/taches`, t));
      this.taches.update((list) => [...list, enregistree]);
      return null;
    } catch (e) {
      return messageErreur(e);
    }
  }

  /** Mise à jour « optimiste » : la case est cochée tout de suite, puis annulée si l’API refuse. */
  async basculerTache(id: number): Promise<string | null> {
    const tache = this.taches().find((t) => t.id === id);
    if (!tache) return null;
    this.taches.update((list) => list.map((t) => (t.id === id ? { ...t, faite: !t.faite } : t)));
    try {
      await firstValueFrom(
        this.http.patch<Tache>(`${API_URL}/taches/${id}`, { faite: !tache.faite }),
      );
      return null;
    } catch (e) {
      this.taches.update((list) =>
        list.map((t) => (t.id === id ? { ...t, faite: tache.faite } : t)),
      );
      return messageErreur(e);
    }
  }

  async supprimerTache(id: number): Promise<string | null> {
    try {
      await firstValueFrom(this.http.delete(`${API_URL}/taches/${id}`));
      this.taches.update((list) => list.filter((t) => t.id !== id));
      return null;
    } catch (e) {
      return messageErreur(e);
    }
  }

  async ajouterPressage(p: Omit<Pressage, 'id'>): Promise<string | null> {
    if (p.olivesKg > this.stockOlivesKg()) {
      return `Stock d’olives insuffisant : ${this.stockOlivesKg().toLocaleString('fr-FR')} kg disponibles.`;
    }
    try {
      const enregistre = await firstValueFrom(this.http.post<Pressage>(`${API_URL}/pressages`, p));
      this.pressages.update((list) => [...list, enregistre]);
      return null;
    } catch (e) {
      return messageErreur(e);
    }
  }

  async ajouterVente(v: Omit<Vente, 'id' | 'statut'>): Promise<string | null> {
    const dispo = this.stockParQualite()[v.qualite];
    if (v.quantiteL > dispo) {
      return `Stock insuffisant : ${dispo.toLocaleString('fr-FR')} L d’huile ${v.qualite.toLowerCase()} disponibles.`;
    }
    try {
      const enregistree = await firstValueFrom(this.http.post<Vente>(`${API_URL}/ventes`, v));
      this.ventes.update((list) => [...list, enregistree]);
      return null;
    } catch (e) {
      return messageErreur(e);
    }
  }
}
