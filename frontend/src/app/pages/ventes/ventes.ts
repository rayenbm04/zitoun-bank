import { Component, computed, inject, input, signal, effect } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-ventes',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './ventes.html',
})
export class Ventes {
  readonly data = inject(DataService);
  private fb = inject(FormBuilder);

  /** Paramètre d'URL ?offre=… quand on vient du comparateur */
  readonly offre = input<string>();

  readonly message = signal<{ type: 'error' | 'success'; texte: string } | null>(null);

  readonly form = this.fb.nonNullable.group({
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    acheteur: ['', Validators.required],
    quantiteL: [0, [Validators.required, Validators.min(1)]],
    prixParL: [0, [Validators.required, Validators.min(0.1)]],
  });

  readonly triees = computed(() => [...this.data.ventes()].sort((a, b) => b.date.localeCompare(a.date)));

  constructor() {
    // Pré-remplit le formulaire avec l'offre choisie dans le comparateur
    effect(() => {
      const id = Number(this.offre());
      const o = this.data.offres().find(x => x.id === id);
      if (o) this.form.patchValue({ acheteur: o.acheteur, prixParL: o.prixParL });
    });
  }

  total(): number {
    const v = this.form.getRawValue();
    return v.quantiteL * v.prixParL;
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const msg = this.data.ajouterVente(this.form.getRawValue());
    if (msg) {
      this.message.set({ type: 'error', texte: msg });
    } else {
      this.message.set({ type: 'success', texte: 'Vente enregistrée : le stock d’huile a été mis à jour.' });
      this.form.patchValue({ quantiteL: 0 });
    }
  }
}
