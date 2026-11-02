// Types de données utilisés dans l'application

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  region: string | null;
  createdAt: string;
}

export type Variete = 'Chemlali' | 'Chétoui' | 'Autre';
export type EtatParcelle = 'Bon' | 'Moyen' | 'À surveiller';

export interface Parcelle {
  id: number;
  nom: string;
  localisation: string;
  superficieHa: number;
  variete: Variete;
  nbOliviers: number;
  ageMoyen: number;
  etat: EtatParcelle;
}

export interface Recolte {
  id: number;
  date: string;
  parcelleId: number;
  quantiteKg: number;
}

export type QualiteHuile = 'Extra vierge' | 'Vierge' | 'Ordinaire';

export interface Production {
  id: number;
  date: string;
  moulin: string;
  olivesKg: number;
  huileL: number;
  acidite: number;
}

export interface Offre {
  id: number;
  acheteur: string;
  type: 'Coopérative' | 'Exportateur' | 'Grossiste' | 'Moulin';
  region: string;
  prixParL: number;
  qualiteMin: QualiteHuile;
  date: string;
}

export interface Vente {
  id: number;
  date: string;
  acheteur: string;
  quantiteL: number;
  prixParL: number;
}

export interface PointPrix {
  mois: string;
  prix: number;
}
