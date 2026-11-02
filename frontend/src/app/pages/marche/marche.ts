import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { LineChart } from '../../shared/line-chart';

type Tri = 'prix' | 'date';

@Component({
  selector: 'app-marche',
  imports: [DatePipe, DecimalPipe, RouterLink, LineChart],
  templateUrl: './marche.html',
})
export class Marche {
  readonly data = inject(DataService);
  readonly tri = signal<Tri>('prix');
  readonly region = signal('Toutes');

  readonly regions = computed(() => ['Toutes', ...new Set(this.data.offres().map(o => o.region))]);

  readonly offres = computed(() => {
    const r = this.region();
    const liste = this.data.offres().filter(o => r === 'Toutes' || o.region === r);
    return liste.sort((a, b) => (this.tri() === 'prix' ? b.prixParL - a.prixParL : b.date.localeCompare(a.date)));
  });

  readonly meilleureId = computed(() => this.data.meilleureOffre()?.id);

  /** Écart avec le prix moyen des offres, en % */
  ecart(prix: number): number {
    const moy = this.data.prixMoyenMarche();
    return moy ? ((prix - moy) / moy) * 100 : 0;
  }

  /** Gain si l'agriculteur vend tout son stock à cette offre plutôt qu'au prix moyen */
  gain(prix: number): number {
    return (prix - this.data.prixMoyenMarche()) * this.data.stockHuileL();
  }
}
