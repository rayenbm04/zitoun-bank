export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  region: string | null;
  createdAt: string;
}

export const REGIONS = ['Sfax', 'Sousse', 'Monastir', 'Mahdia', 'Kairouan'] as const;
export type Region = (typeof REGIONS)[number];

export const VARIETES = ['Chemlali', 'Chetoui'] as const;
export type Variete = (typeof VARIETES)[number];

export const ETATS = ['Bon', 'Moyen', 'À surveiller'] as const;
export type EtatParcelle = (typeof ETATS)[number];

export const QUALITES = ['Extra vierge', 'Vierge', 'Ordinaire'] as const;
export type QualiteHuile = (typeof QUALITES)[number];

export type StatutVente = 'Payée' | 'En attente' | 'Livrée';

export interface Parcelle {
  id: number;
  nom: string;
  region: Region;
  superficieHa: number;
  variete: Variete;
  nbOliviers: number;
  etat: EtatParcelle;
}

export interface Recolte {
  id: number;
  date: string;
  parcelleId: number;
  quantiteKg: number;
}

export interface Pressage {
  id: number;
  date: string;
  moulin: string;
  olivesKg: number;
  huileL: number;
  qualite: QualiteHuile;
}

export interface Offre {
  id: number;
  acheteur: string;
  type: 'Coopérative' | 'Exportateur' | 'Grossiste' | 'Moulin';
  region: Region;
  qualite: QualiteHuile;
  prixParL: number;
  quantiteMaxL: number;
  date: string;
}

export interface Vente {
  id: number;
  date: string;
  acheteur: string;
  qualite: QualiteHuile;
  quantiteL: number;
  prixParL: number;
  statut: StatutVente;
}

export interface PointPrix {
  mois: number;
  annee: number;
  'Extra vierge': number;
  Vierge: number;
  Ordinaire: number;
}

export type TypeMouvement = 'entree' | 'sortie';

export interface Mouvement {
  id: string;
  date: string;
  produit: 'olives' | 'huile';
  type: TypeMouvement;
  quantite: number;
  libelle: string;
  detail: string;
}
