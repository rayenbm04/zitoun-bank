import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DENSITE_HUILE, DataService } from '../../core/data.service';
import { PrefsService } from '../../core/prefs.service';
import { QUALITES, QualiteHuile } from '../../core/models';
import { Icon } from '../../shared/ui/icon';
import { Field } from '../../shared/ui/field';
import { Alert } from '../../shared/ui/alert';

type Champ = 'olivesKg' | 'rendement' | 'prixParL' | 'cueillette' | 'moulin' | 'transport' | 'autres';

const LIMITES: Record<Champ, [number, number]> = {
  olivesKg: [1, 200000],
  rendement: [5, 40],
  prixParL: [0.1, 50],
  cueillette: [0, 5],
  moulin: [0, 5],
  transport: [0, 100000],
  autres: [0, 100000],
};

const COULEURS = ['var(--s-cueillette)', 'var(--s-moulin)', 'var(--s-transport)', 'var(--s-autres)'];

@Component({
  selector: 'app-simulateur',
  imports: [ReactiveFormsModule, RouterLink, Icon, Field, Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './simulateur.html',
  styleUrl: './simulateur.css',
})
export class Simulateur {
  readonly data = inject(DataService);
  readonly p = inject(PrefsService);
  private readonly fb = inject(FormBuilder);

  readonly qualites = QUALITES;

  readonly form = this.fb.nonNullable.group({
    olivesKg: [0, this.regles('olivesKg')],
    rendement: [0, this.regles('rendement')],
    qualite: ['Extra vierge' as QualiteHuile],
    prixParL: [0, this.regles('prixParL')],
    cueillette: [0.25, this.regles('cueillette')],
    moulin: [0.15, this.regles('moulin')],
    transport: [120, this.regles('transport')],
    autres: [0, this.regles('autres')],
  });

  private readonly valeurs = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });
  private readonly valide = toSignal(this.form.statusChanges.pipe(map(s => s === 'VALID')), { initialValue: true });

  readonly qualiteChoisie = computed(() => this.valeurs().qualite);
  readonly meilleurPrix = computed(() => this.meilleurPrixPour(this.qualiteChoisie()));
  readonly prixMoyen = computed(() => this.data.prixMoyen(this.qualiteChoisie()));

  readonly resultat = computed(() => {
    const v = this.valeurs();
    const olives = Number(v.olivesKg) || 0;
    const huileL = (olives * (Number(v.rendement) || 0)) / 100 / DENSITE_HUILE;
    const prix = Number(v.prixParL) || 0;
    const chiffreAffaires = huileL * prix;
    const couts = [
      { nom: 'Cueillette', montant: olives * (Number(v.cueillette) || 0) },
      { nom: 'Moulin', montant: olives * (Number(v.moulin) || 0) },
      { nom: 'Transport', montant: Number(v.transport) || 0 },
      { nom: 'Autres charges', montant: Number(v.autres) || 0 },
    ];
    const coutTotal = couts.reduce((s, c) => s + c.montant, 0);
    const benefice = chiffreAffaires - coutTotal;
    const coutParL = huileL > 0 ? coutTotal / huileL : 0;
    const base = Math.max(chiffreAffaires, coutTotal) || 1;
    const segments = [
      ...couts.map((c, i) => ({ ...c, couleur: COULEURS[i], part: (c.montant / base) * 100 })),
      { nom: 'Bénéfice', montant: Math.max(benefice, 0), couleur: 'var(--s-benefice)', part: (Math.max(benefice, 0) / base) * 100 },
    ].filter(s => s.montant > 0);
    const scenarios = [-10, -5, 0, 5, 10].map(pct => {
      const prixScenario = prix * (1 + pct / 100);
      return { pct, prix: prixScenario, benefice: huileL * prixScenario - coutTotal };
    });
    return {
      huileL, chiffreAffaires, couts, coutTotal, benefice, coutParL, segments, scenarios,
      marge: chiffreAffaires > 0 ? (benefice / chiffreAffaires) * 100 : 0,
    };
  });

  constructor() {
    this.reinitialiser();
    this.form.controls.qualite.valueChanges.subscribe(q => {
      const prix = this.meilleurPrixPour(q);
      if (prix) this.form.controls.prixParL.setValue(prix);
    });
  }

  private regles(champ: Champ) {
    const [min, max] = LIMITES[champ];
    return [Validators.required, Validators.min(min), Validators.max(max)];
  }

  private meilleurPrixPour(q: QualiteHuile): number {
    return this.data.offres().filter(o => o.qualite === q).reduce((m, o) => Math.max(m, o.prixParL), 0);
  }

  reinitialiser(): void {
    const recolte = this.data.totalRecolteKg();
    this.form.reset({
      olivesKg: recolte > 0 ? recolte : 1000,
      rendement: Math.round(this.data.rendementMoyen() * 10) / 10 || 20,
      qualite: 'Extra vierge',
      prixParL: this.meilleurPrixPour('Extra vierge') || 13,
      cueillette: 0.25,
      moulin: 0.15,
      transport: 120,
      autres: 0,
    });
  }

  erreur(champ: Champ): string | null {
    const c = this.form.controls[champ];
    if (c.valid) return null;
    const [min, max] = LIMITES[champ];
    return c.hasError('required') ? 'Champ obligatoire.' : `Entre ${this.p.nombre(min, min < 1 ? 1 : 0)} et ${this.p.nombre(max)}.`;
  }

  variation(pct: number): string {
    if (pct === 0) return 'Prix saisi';
    return `${pct > 0 ? '+' : '−'}${Math.abs(pct)} %`;
  }

  formuleValide(): boolean {
    return this.valide();
  }
}
