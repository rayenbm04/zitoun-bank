import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { PrefsService } from '../../core/prefs.service';
import { ETATS, Parcelle, REGIONS, VARIETES } from '../../core/models';
import { KpiCard } from '../../shared/ui/kpi-card';
import { Badge } from '../../shared/ui/badge';
import { Icon } from '../../shared/ui/icon';
import { Modal } from '../../shared/ui/modal';
import { Field } from '../../shared/ui/field';
import { EmptyState } from '../../shared/ui/empty-state';
import { ToastService } from '../../shared/ui/toast';

@Component({
  selector: 'app-verger',
  imports: [ReactiveFormsModule, KpiCard, Badge, Icon, Modal, Field, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './verger.html',
})
export class Verger {
  readonly data = inject(DataService);
  readonly p = inject(PrefsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly regions = REGIONS;
  readonly varietes = VARIETES;
  readonly etats = ETATS;

  readonly formOuvert = signal(false);
  readonly enEdition = signal<Parcelle | null>(null);
  readonly aSupprimer = signal<Parcelle | null>(null);
  readonly confirmOuvert = signal(false);

  readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    region: ['Sfax' as Parcelle['region'], Validators.required],
    superficieHa: [1, [Validators.required, Validators.min(0.1)]],
    variete: ['Chemlali' as Parcelle['variete'], Validators.required],
    nbOliviers: [50, [Validators.required, Validators.min(1)]],
    etat: ['Bon' as Parcelle['etat'], Validators.required],
  });

  readonly densite = computed(() => {
    const ha = this.data.superficieTotale();
    return ha ? Math.round(this.data.totalOliviers() / ha) : 0;
  });

  readonly regionsTexte = computed(() => {
    const r = [...new Set(this.data.parcelles().map(x => x.region))];
    return r.length ? 'à ' + (r.length > 1 ? r.slice(0, -1).join(', ') + ' et ' + r.at(-1) : r[0]) : 'aucune pour l’instant';
  });

  erreur(champ: 'nom' | 'superficieHa' | 'nbOliviers'): string | null {
    const c = this.form.controls[champ];
    if (!c.touched || c.valid) return null;
    return { nom: 'Donnez un nom à la parcelle.', superficieHa: 'Superficie supérieure à 0 ha.', nbOliviers: 'Au moins 1 olivier.' }[champ];
  }

  ouvrirAjout(): void {
    this.enEdition.set(null);
    this.form.reset();
    this.formOuvert.set(true);
  }

  ouvrirEdition(p: Parcelle): void {
    this.enEdition.set(p);
    this.form.setValue({ nom: p.nom, region: p.region, superficieHa: p.superficieHa, variete: p.variete, nbOliviers: p.nbOliviers, etat: p.etat });
    this.formOuvert.set(true);
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const edit = this.enEdition();
    this.data.enregistrerParcelle(this.form.getRawValue(), edit?.id);
    this.formOuvert.set(false);
    this.toast.afficher(edit ? 'Parcelle modifiée' : 'Parcelle ajoutée', this.form.getRawValue().nom);
  }

  demanderSuppression(p: Parcelle): void {
    this.aSupprimer.set(p);
    this.confirmOuvert.set(true);
  }

  supprimer(): void {
    const p = this.aSupprimer();
    if (!p) return;
    this.data.supprimerParcelle(p.id);
    this.confirmOuvert.set(false);
    this.toast.afficher('Parcelle supprimée', p.nom);
  }
}
