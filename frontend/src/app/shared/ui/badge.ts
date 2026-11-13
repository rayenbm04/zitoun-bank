import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icon } from './icon';
import { PrefsService } from '../../core/prefs.service';

type Ton = { bg: string; fg: string; icone: string };

const TONS: Record<string, Ton> = {
  'Extra vierge': { bg: 'var(--q-extra-bg)', fg: 'var(--q-extra-fg)', icone: 'etoile' },
  Vierge: { bg: 'var(--q-vierge-bg)', fg: 'var(--q-vierge-fg)', icone: 'valide' },
  Ordinaire: { bg: 'var(--q-ord-bg)', fg: 'var(--q-ord-fg)', icone: 'info' },
  Bon: { bg: 'var(--ok-bg)', fg: 'var(--ok-fg)', icone: 'succes' },
  Moyen: { bg: 'var(--warn-bg)', fg: 'var(--warn-fg)', icone: 'erreur' },
  'À surveiller': { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', icone: 'attention' },
  Payée: { bg: 'var(--ok-bg)', fg: 'var(--ok-fg)', icone: 'succes' },
  Livrée: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', icone: 'camion' },
  'En attente': { bg: 'var(--warn-bg)', fg: 'var(--warn-fg)', icone: 'horloge' },
  Entrée: { bg: 'var(--ok-bg)', fg: 'var(--ok-fg)', icone: 'entree' },
  Sortie: { bg: 'var(--surface-2)', fg: 'var(--text-strong)', icone: 'sortie2' },
  'Meilleure offre': { bg: '#f3e6b5', fg: '#6b5209', icone: 'etoile' },
};

@Component({
  selector: 'app-badge',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'badge', '[style.background]': 'ton().bg', '[style.color]': 'ton().fg' },
  template: `<app-icon [name]="ton().icone" />{{ libelle() }}`,
})
export class Badge {
  private readonly prefs = inject(PrefsService);
  readonly valeur = input.required<string>();
  readonly ton = computed<Ton>(() => TONS[this.valeur()] ?? { bg: 'var(--info-bg)', fg: 'var(--info-fg)', icone: 'info' });
  readonly libelle = computed(() => this.prefs.t(this.valeur()));
}
