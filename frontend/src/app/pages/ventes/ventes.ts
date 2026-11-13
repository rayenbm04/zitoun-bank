import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { PrefsService } from '../../core/prefs.service';
import { QUALITES, QualiteHuile, StatutVente } from '../../core/models';
import { KpiCard } from '../../shared/ui/kpi-card';
import { Badge } from '../../shared/ui/badge';
import { Icon } from '../../shared/ui/icon';
import { Field } from '../../shared/ui/field';
import { Alert } from '../../shared/ui/alert';
import { EmptyState } from '../../shared/ui/empty-state';
import { ToastService } from '../../shared/ui/toast';

@Component({
  selector: 'app-ventes',
  imports: [ReactiveFormsModule, KpiCard, Badge, Icon, Field, Alert, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ventes.html',
  styleUrl: './ventes.css',
})
export class Ventes {
  readonly data = inject(DataService);
  readonly p = inject(PrefsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly offre = input<string>();

  readonly qualites = QUALITES;
  readonly erreurStock = signal('');
  readonly filtre = signal<StatutVente | 'toutes'>('toutes');
  readonly offreChoisie = computed(() => this.data.offres().find(o => o.id === Number(this.offre())) ?? null);

  readonly form = this.fb.nonNullable.group({
    acheteur: ['', Validators.required],
    qualite: ['Extra vierge' as QualiteHuile, Validators.required],
    quantiteL: [null as number | null, [Validators.required, Validators.min(1)]],
    prixParL: [null as number | null, [Validators.required, Validators.min(0.1)]],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
  });

  readonly valeurs = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  readonly total = computed(() => {
    const v = this.valeurs();
    return (Number(v.quantiteL) || 0) * (Number(v.prixParL) || 0);
  });
  readonly dispo = computed(() => this.data.stockParQualite()[(this.valeurs().qualite ?? 'Extra vierge') as QualiteHuile]);
  readonly depasse = computed(() => (Number(this.valeurs().quantiteL) || 0) > this.dispo());

  readonly huileVendue = computed(() => this.data.ventes().reduce((s, v) => s + v.quantiteL, 0));

  readonly historique = computed(() => {
    const f = this.filtre();
    return [...this.data.ventes()].filter(v => f === 'toutes' || v.statut === f).sort((a, b) => b.date.localeCompare(a.date));
  });

  constructor() {
    effect(() => {
      const o = this.offreChoisie();
      if (!o) return;
      untracked(() => {
        const stock = this.data.stockParQualite()[o.qualite];
        this.form.patchValue({
          acheteur: o.acheteur,
          qualite: o.qualite,
          prixParL: o.prixParL,
          quantiteL: Math.min(stock, o.quantiteMaxL) || null,
        });
      });
    });
  }

  erreur(champ: 'acheteur' | 'quantiteL' | 'prixParL'): string | null {
    const c = this.form.controls[champ];
    if (champ === 'quantiteL' && this.depasse()) return `Stock insuffisant : ${this.p.nombre(this.dispo())} L disponibles.`;
    if (!c.touched || c.valid) return null;
    return { acheteur: 'Indiquez l’acheteur.', quantiteL: 'Quantité supérieure à 0 L.', prixParL: 'Prix par litre requis.' }[champ];
  }

  oublierOffre(): void {
    this.router.navigate(['/ventes']);
    this.form.reset();
  }

  enregistrer(): void {
    this.erreurStock.set('');
    if (this.form.invalid || this.depasse()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const msg = this.data.ajouterVente({
      acheteur: v.acheteur, qualite: v.qualite, quantiteL: Number(v.quantiteL), prixParL: Number(v.prixParL), date: v.date,
    });
    if (msg) {
      this.erreurStock.set(msg);
      return;
    }
    this.toast.afficher('Vente enregistrée', `${this.p.nombre(Number(v.quantiteL))} L à ${v.acheteur}, ${this.p.nombre(this.total(), 2)} TND. Le stock d’huile est à jour.`);
    this.router.navigate(['/ventes']);
    this.form.reset();
  }
}
