import { Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-recoltes',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './recoltes.html',
})
export class Recoltes {
  readonly data = inject(DataService);
  private fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    parcelleId: [0, [Validators.required, Validators.min(1)]],
    quantiteKg: [0, [Validators.required, Validators.min(1)]],
  });

  /** Récolte totale par parcelle */
  readonly parParcelle = computed(() =>
    this.data.parcelles().map(p => {
      const kg = this.data.recoltes().filter(r => r.parcelleId === p.id).reduce((s, r) => s + r.quantiteKg, 0);
      return { nom: p.nom, kg, kgParArbre: p.nbOliviers ? kg / p.nbOliviers : 0 };
    })
  );

  readonly triees = computed(() => [...this.data.recoltes()].sort((a, b) => b.date.localeCompare(a.date)));

  ajouter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.data.ajouterRecolte({ ...v, parcelleId: Number(v.parcelleId) });
    this.form.patchValue({ quantiteKg: 0 });
  }
}
