import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CAPACITE_HUILE_L, CAPACITE_OLIVES_KG, DataService, SEUIL_HUILE_L, SEUIL_OLIVES_KG,
} from '../../core/data.service';
import { PrefsService } from '../../core/prefs.service';
import { QUALITES, VARIETES } from '../../core/models';
import { Badge } from '../../shared/ui/badge';
import { Icon } from '../../shared/ui/icon';
import { Alert } from '../../shared/ui/alert';
import { EmptyState } from '../../shared/ui/empty-state';

type Onglet = 'olives' | 'huile' | 'oliviers';

@Component({
  selector: 'app-stocks',
  imports: [RouterLink, Badge, Icon, Alert, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stocks.html',
  styleUrl: './stocks.css',
})
export class Stocks {
  readonly data = inject(DataService);
  readonly p = inject(PrefsService);

  readonly onglet = signal<Onglet>('olives');
  readonly sens = signal<'tous' | 'entree' | 'sortie'>('tous');
  readonly periode = signal<'7' | '30' | 'saison'>('saison');

  readonly qualites = QUALITES;
  readonly seuilHuile = SEUIL_HUILE_L;
  readonly seuilOlives = SEUIL_OLIVES_KG;
  readonly capaciteHuile = CAPACITE_HUILE_L;
  readonly capaciteOlives = CAPACITE_OLIVES_KG;

  readonly onglets: { id: Onglet; nom: string; icone: string }[] = [
    { id: 'olives', nom: 'Olives', icone: 'panier' },
    { id: 'huile', nom: 'Huile', icone: 'goutte' },
    { id: 'oliviers', nom: 'Oliviers', icone: 'arbre' },
  ];

  readonly mouvements = computed(() => {
    const produit = this.onglet();
    const s = this.sens();
    const jours = this.periode();
    const limite = jours === 'saison' ? '' : new Date(Date.now() - Number(jours) * 86_400_000).toISOString().slice(0, 10);
    return this.data.mouvements().filter(m => m.produit === produit && (s === 'tous' || m.type === s) && m.date >= limite);
  });

  readonly totaux = computed(() => {
    const m = this.mouvements();
    return {
      entree: m.filter(x => x.type === 'entree').reduce((a, x) => a + x.quantite, 0),
      sortie: m.filter(x => x.type === 'sortie').reduce((a, x) => a + x.quantite, 0),
    };
  });

  readonly parVariete = computed(() =>
    VARIETES.map(v => ({ v, n: this.data.parcelles().filter(x => x.variete === v).reduce((s, x) => s + x.nbOliviers, 0) }))
  );

  readonly qualitesBasses = computed(() => {
    const s = this.data.stockParQualite();
    return (['Extra vierge', 'Vierge'] as const).filter(q => s[q] < SEUIL_HUILE_L);
  });

  pct(v: number, max: number): number {
    return Math.max(0, Math.min(100, (v / max) * 100));
  }

  choisir(o: Onglet): void {
    this.onglet.set(o);
    this.sens.set('tous');
  }

  clavier(e: KeyboardEvent, i: number): void {
    const n = this.onglets.length;
    let j = i;
    const rtl = document.documentElement.dir === 'rtl';
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) j = (i + 1) % n;
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) j = (i - 1 + n) % n;
    else return;
    e.preventDefault();
    this.choisir(this.onglets[j].id);
    document.getElementById('tab-' + this.onglets[j].id)?.focus();
  }
}
