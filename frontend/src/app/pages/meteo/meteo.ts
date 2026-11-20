import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { PrefsService } from '../../core/prefs.service';
import { REGIONS, Region } from '../../core/models';
import {
  MeteoService, Meteo as DonneesMeteo, conseils, decrireTemps, estFavorable, nomDuJour, regionValide,
} from '../../core/meteo.service';
import { Alert } from '../../shared/ui/alert';
import { Icon } from '../../shared/ui/icon';
import { EmptyState } from '../../shared/ui/empty-state';

@Component({
  selector: 'app-meteo',
  imports: [Alert, Icon, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meteo.html',
  styleUrl: './meteo.css',
})
export class Meteo {
  private readonly service = inject(MeteoService);
  private readonly auth = inject(AuthService);
  readonly p = inject(PrefsService);

  readonly regions = REGIONS;
  readonly region = signal<Region>(regionValide(this.auth.user()?.region));
  readonly etat = signal<'chargement' | 'pret' | 'erreur'>('chargement');
  readonly meteo = signal<DonneesMeteo | null>(null);

  readonly conseils = computed(() => {
    const m = this.meteo();
    return m ? conseils(m) : [];
  });

  readonly temps = decrireTemps;
  readonly nomDuJour = nomDuJour;
  readonly favorable = estFavorable;

  constructor() {
    this.charger();
  }

  choisir(r: Region): void {
    if (r === this.region()) return;
    this.region.set(r);
    this.charger();
  }

  charger(): void {
    this.etat.set('chargement');
    this.service.charger(this.region()).subscribe({
      next: m => {
        this.meteo.set(m);
        this.etat.set('pret');
      },
      error: () => this.etat.set('erreur'),
    });
  }

  arrondi(v: number): number {
    return Math.round(v);
  }

  jourMois(iso: string): string {
    return this.p.date(iso).slice(0, 5);
  }
}
