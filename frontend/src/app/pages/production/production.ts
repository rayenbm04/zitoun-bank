import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { PrefsService } from '../../core/prefs.service';
import { QUALITES, QualiteHuile } from '../../core/models';
import { KpiCard } from '../../shared/ui/kpi-card';
import { Badge } from '../../shared/ui/badge';
import { Icon } from '../../shared/ui/icon';
import { Field } from '../../shared/ui/field';
import { Alert } from '../../shared/ui/alert';
import { LineChart, Serie } from '../../shared/ui/charts';
import { ToastService } from '../../shared/ui/toast';

@Component({
  selector: 'app-production',
  imports: [ReactiveFormsModule, KpiCard, Badge, Icon, Field, Alert, LineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './production.html',
  styleUrl: './production.css',
})
export class Production {
  readonly data = inject(DataService);
  readonly p = inject(PrefsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly qualites = QUALITES;
  readonly moulins = ['Huilerie Ben Salah', 'Huilerie El Amal', 'Moulin Zaafrane', 'Huilerie Chaabane'];
  readonly aujourdhui = new Date().toISOString().slice(0, 10);
  readonly erreurStock = signal('');
  readonly envoi = signal(false);

  readonly form = this.fb.nonNullable.group({
    moulin: ['', Validators.required],
    date: [this.aujourdhui, Validators.required],
    olivesKg: [null as number | null, [Validators.required, Validators.min(1)]],
    huileL: [null as number | null, [Validators.required, Validators.min(1)]],
    qualite: ['Extra vierge' as QualiteHuile, Validators.required],
  });

  private readonly valeurs = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  readonly rendementSaisi = computed(() => {
    const v = this.valeurs();
    return v.olivesKg && v.huileL ? this.data.rendement(Number(v.olivesKg), Number(v.huileL)) : null;
  });

  readonly tries = computed(() => [...this.data.pressages()].sort((a, b) => b.date.localeCompare(a.date)));
  readonly chrono = computed(() => [...this.data.pressages()].sort((a, b) => a.date.localeCompare(b.date)));
  readonly etiquettes = computed(() => this.chrono().map(x => this.p.date(x.date).slice(0, 5)));
  readonly series = computed<Serie[]>(() => [
    { nom: 'Rendement', couleur: 'or', valeurs: this.chrono().map(x => +this.data.rendement(x.olivesKg, x.huileL).toFixed(1)) },
  ]);

  erreur(champ: 'moulin' | 'olivesKg' | 'huileL'): string | null {
    const c = this.form.controls[champ];
    if (!c.touched || c.valid) return null;
    return { moulin: 'Indiquez le moulin.', olivesKg: 'Quantité d’olives requise.', huileL: 'Litres d’huile obtenus requis.' }[champ];
  }

  async enregistrer(): Promise<void> {
    this.erreurStock.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.envoi.set(true);
    const msg = await this.data.ajouterPressage({
      moulin: v.moulin, date: v.date, olivesKg: Number(v.olivesKg), huileL: Number(v.huileL), qualite: v.qualite,
    });
    this.envoi.set(false);
    if (msg) {
      this.erreurStock.set(msg);
      return;
    }
    this.toast.afficher('Pressage enregistré', `${this.p.nombre(Number(v.huileL))} L d’huile ${v.qualite.toLowerCase()} ajoutés au stock.`);
    this.form.patchValue({ olivesKg: null, huileL: null });
    this.form.controls.olivesKg.markAsUntouched();
    this.form.controls.huileL.markAsUntouched();
  }
}
