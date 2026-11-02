import { Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DataService } from '../../core/data.service';

interface Mouvement {
  date: string;
  produit: 'Olives' | 'Huile';
  libelle: string;
  quantite: number;
  unite: string;
}

@Component({
  selector: 'app-stocks',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './stocks.html',
})
export class Stocks {
  readonly data = inject(DataService);

  /** Tous les mouvements de stock (entrées positives, sorties négatives), du plus récent au plus ancien */
  readonly mouvements = computed<Mouvement[]>(() => {
    const d = this.data;
    const liste: Mouvement[] = [
      ...d.recoltes().map(r => ({ date: r.date, produit: 'Olives' as const, libelle: `Récolte · ${d.nomParcelle(r.parcelleId)}`, quantite: r.quantiteKg, unite: 'kg' })),
      ...d.productions().map(p => ({ date: p.date, produit: 'Olives' as const, libelle: `Envoi au moulin · ${p.moulin}`, quantite: -p.olivesKg, unite: 'kg' })),
      ...d.productions().map(p => ({ date: p.date, produit: 'Huile' as const, libelle: `Production · ${p.moulin}`, quantite: p.huileL, unite: 'L' })),
      ...d.ventes().map(v => ({ date: v.date, produit: 'Huile' as const, libelle: `Vente · ${v.acheteur}`, quantite: -v.quantiteL, unite: 'L' })),
    ];
    return liste.sort((a, b) => b.date.localeCompare(a.date));
  });

  readonly valeurStock = computed(() => this.data.stockHuileL() * this.data.prixMoyenMarche());
}
