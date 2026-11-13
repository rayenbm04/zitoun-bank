import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { PrefsService } from '../../core/prefs.service';
import { KpiCard } from '../../shared/ui/kpi-card';
import { Alert } from '../../shared/ui/alert';
import { Badge } from '../../shared/ui/badge';
import { LineChart, Serie } from '../../shared/ui/charts';
import { Icon } from '../../shared/ui/icon';
import { EmptyState } from '../../shared/ui/empty-state';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, KpiCard, Alert, Badge, LineChart, Icon, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly data = inject(DataService);
  readonly auth = inject(AuthService);
  readonly p = inject(PrefsService);

  readonly mois = computed(() => this.data.historiquePrix().map(x => this.p.mois(x.mois)));
  readonly series = computed<Serie[]>(() => [
    { nom: this.p.t('Extra vierge'), couleur: 'or', valeurs: this.data.historiquePrix().map(x => x['Extra vierge']) },
    { nom: this.p.t('Vierge'), couleur: 'olive', valeurs: this.data.historiquePrix().map(x => x.Vierge) },
  ]);

  readonly variation = computed(() => {
    const h = this.data.historiquePrix();
    const a = h.at(-2)?.['Extra vierge'] ?? 0, b = h.at(-1)?.['Extra vierge'] ?? 0;
    return a ? ((b - a) / a) * 100 : 0;
  });

  readonly dernieres = computed(() => [...this.data.ventes()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5));

  readonly aujourdhui = computed(() => {
    const d = new Date();
    return `${d.getDate()} ${this.p.mois(d.getMonth())} ${d.getFullYear()}`;
  });
}
