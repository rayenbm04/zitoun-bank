import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { PrefsService } from '../../core/prefs.service';
import { BarChart } from '../../shared/ui/charts';
import { Icon } from '../../shared/ui/icon';
import { Field } from '../../shared/ui/field';
import { EmptyState } from '../../shared/ui/empty-state';
import { ToastService } from '../../shared/ui/toast';

@Component({
  selector: 'app-recoltes',
  imports: [ReactiveFormsModule, BarChart, Icon, Field, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recoltes.html',
  styleUrl: './recoltes.css',
})
export class Recoltes {
  readonly data = inject(DataService);
  readonly p = inject(PrefsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly aujourdhui = new Date().toISOString().slice(0, 10);
  readonly filtre = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    parcelleId: [this.data.parcelles()[0]?.id ?? 0, [Validators.required, Validators.min(1)]],
    date: [this.aujourdhui, Validators.required],
    quantiteKg: [null as number | null, [Validators.required, Validators.min(1), Validators.max(50000)]],
  });

  erreur(champ: 'parcelleId' | 'date' | 'quantiteKg'): string | null {
    const c = this.form.controls[champ];
    if (!c.touched || c.valid) return null;
    if (champ === 'quantiteKg') return c.hasError('required') ? 'Indiquez la quantité.' : 'Entre 1 et 50 000 kg.';
    if (champ === 'date') return 'Choisissez une date.';
    return 'Choisissez une parcelle.';
  }

  readonly parParcelle = computed(() =>
    this.data.parcelles().map(x => {
      const kg = this.data.recoltes().filter(r => r.parcelleId === x.id).reduce((s, r) => s + r.quantiteKg, 0);
      return { id: x.id, nom: x.nom, kg, parArbre: x.nbOliviers ? kg / x.nbOliviers : 0 };
    })
  );

  readonly barres = computed(() => this.parParcelle().map(x => ({ label: x.nom, valeur: x.kg })));

  readonly historique = computed(() => {
    const f = this.filtre();
    return [...this.data.recoltes()]
      .filter(r => f === null || r.parcelleId === f)
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  readonly moyenneParArbre = computed(() => {
    const arbres = this.data.totalOliviers();
    return arbres ? this.data.totalRecolteKg() / arbres : 0;
  });

  variete(id: number): string {
    return this.data.parcelles().find(x => x.id === id)?.variete ?? '';
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.data.ajouterRecolte({ parcelleId: Number(v.parcelleId), date: v.date, quantiteKg: Number(v.quantiteKg) });
    this.toast.afficher('Récolte enregistrée', `${this.p.nombre(Number(v.quantiteKg))} kg · ${this.data.nomParcelle(Number(v.parcelleId))}. Le stock d’olives est à jour.`);
    this.form.patchValue({ quantiteKg: null });
    this.form.controls.quantiteKg.markAsUntouched();
  }
}
