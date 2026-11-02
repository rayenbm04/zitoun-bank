import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { QualiteHuile } from '../../core/models';

@Component({
  selector: 'app-production',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './production.html',
})
export class ProductionPage {
  readonly data = inject(DataService);
  private fb = inject(FormBuilder);
  readonly erreur = signal('');

  readonly form = this.fb.nonNullable.group({
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    moulin: ['', Validators.required],
    olivesKg: [0, [Validators.required, Validators.min(1)]],
    huileL: [0, [Validators.required, Validators.min(1)]],
    acidite: [0.5, [Validators.required, Validators.min(0), Validators.max(10)]],
  });

  readonly triees = computed(() => [...this.data.productions()].sort((a, b) => b.date.localeCompare(a.date)));

  rendement(olivesKg: number, huileL: number): number {
    return olivesKg > 0 ? (huileL / olivesKg) * 100 : 0;
  }

  badge(q: QualiteHuile): string {
    return q === 'Extra vierge' ? 'badge' : q === 'Vierge' ? 'badge or' : 'badge rouge';
  }

  ajouter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const msg = this.data.ajouterProduction(this.form.getRawValue());
    this.erreur.set(msg ?? '');
    if (!msg) this.form.patchValue({ olivesKg: 0, huileL: 0 });
  }
}
