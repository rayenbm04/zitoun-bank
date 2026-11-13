import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { PrefsService } from '../../core/prefs.service';
import { Offre, QUALITES, QualiteHuile, REGIONS } from '../../core/models';
import { Badge } from '../../shared/ui/badge';
import { Icon } from '../../shared/ui/icon';
import { LineChart, Serie } from '../../shared/ui/charts';
import { EmptyState } from '../../shared/ui/empty-state';

@Component({
  selector: 'app-marche',
  imports: [RouterLink, Badge, Icon, LineChart, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './marche.html',
  styleUrl: './marche.css',
})
export class Marche {
  readonly data = inject(DataService);
  readonly p = inject(PrefsService);

  readonly regions = REGIONS;
  readonly qualites = QUALITES;
  readonly region = signal<string>('toutes');
  readonly qualite = signal<QualiteHuile | 'toutes'>('toutes');
  readonly tri = signal<'prix' | 'date'>('prix');

  readonly offres = computed(() => {
    const r = this.region(), q = this.qualite();
    return this.data
      .offres()
      .filter(o => (r === 'toutes' || o.region === r) && (q === 'toutes' || o.qualite === q))
      .sort((a, b) => (this.tri() === 'prix' ? b.prixParL - a.prixParL : b.date.localeCompare(a.date)));
  });

  readonly meilleure = computed(() =>
    this.offres().reduce<Offre | null>((b, o) => (!b || o.prixParL > b.prixParL ? o : b), null)
  );

  readonly ecartMeilleure = computed(() => {
    const m = this.meilleure();
    return m ? this.ecart(m.prixParL, m.qualite) : 0;
  });

  readonly gain = computed(() => {
    const m = this.meilleure();
    if (!m) return { litres: 0, montant: 0 };
    const litres = Math.min(this.data.stockParQualite()[m.qualite], m.quantiteMaxL);
    return { litres, montant: litres * m.prixParL };
  });

  readonly courbeQualite = computed<QualiteHuile>(() => (this.qualite() === 'toutes' ? 'Extra vierge' : (this.qualite() as QualiteHuile)));
  readonly mois = computed(() => this.data.historiquePrix().map(x => this.p.mois(x.mois)));
  readonly series = computed<Serie[]>(() => [
    { nom: this.courbeQualite(), couleur: 'or', valeurs: this.data.historiquePrix().map(x => x[this.courbeQualite()]) },
  ]);

  ecart(prix: number, q: QualiteHuile): number {
    const moy = this.data.prixMoyen(q);
    return moy ? ((prix - moy) / moy) * 100 : 0;
  }

  reinitialiser(): void {
    this.region.set('toutes');
    this.qualite.set('toutes');
  }
}
