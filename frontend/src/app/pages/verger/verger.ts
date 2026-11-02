import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { EtatParcelle, Variete } from '../../core/models';

@Component({
  selector: 'app-verger',
  imports: [ReactiveFormsModule],
  templateUrl: './verger.html',
})
export class Verger {
  readonly data = inject(DataService);
  private fb = inject(FormBuilder);

  readonly varietes: Variete[] = ['Chemlali', 'Chétoui', 'Autre'];
  readonly etats: EtatParcelle[] = ['Bon', 'Moyen', 'À surveiller'];

  readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    localisation: ['', Validators.required],
    superficieHa: [1, [Validators.required, Validators.min(0.1)]],
    variete: ['Chemlali' as Variete, Validators.required],
    nbOliviers: [50, [Validators.required, Validators.min(1)]],
    ageMoyen: [10, [Validators.required, Validators.min(0)]],
    etat: ['Bon' as EtatParcelle, Validators.required],
  });

  ajouter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.data.ajouterParcelle(this.form.getRawValue());
    this.form.reset();
  }

  badge(etat: EtatParcelle): string {
    return etat === 'Bon' ? '' : etat === 'Moyen' ? 'or' : 'rouge';
  }
}
