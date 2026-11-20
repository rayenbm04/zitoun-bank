import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { PrefsService } from '../../core/prefs.service';
import { TYPES_TACHE, Tache, TypeTache } from '../../core/models';
import { Icon } from '../../shared/ui/icon';
import { Field } from '../../shared/ui/field';
import { EmptyState } from '../../shared/ui/empty-state';
import { ToastService } from '../../shared/ui/toast';

interface Case {
  iso: string;
  jour: number;
  taches: Tache[];
}

const CLASSES: Record<TypeTache, string> = {
  Récolte: 't-recolte',
  Taille: 't-taille',
  Traitement: 't-traitement',
  Irrigation: 't-irrigation',
  Fertilisation: 't-fertilisation',
  Labour: 't-labour',
};

const SAISON: { type: TypeTache; mois: number[]; detail: string }[] = [
  {
    type: 'Récolte',
    mois: [10, 11, 0],
    detail: 'De novembre à janvier, pressage dans les 48 heures',
  },
  { type: 'Taille', mois: [0, 1, 2], detail: 'Après la récolte, avant la floraison' },
  { type: 'Fertilisation', mois: [1, 2, 3], detail: 'À la reprise de la végétation' },
  { type: 'Labour', mois: [1, 2, 9], detail: 'Désherbage et travail du sol' },
  { type: 'Traitement', mois: [2, 3, 4, 8, 9, 10], detail: 'Œil de paon et mouche de l’olive' },
  { type: 'Irrigation', mois: [5, 6, 7, 8], detail: 'Arrosages d’appoint en période sèche' },
];

function versIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function versDate(iso: string): Date {
  const [a, m, j] = iso.split('-').map(Number);
  return new Date(a, m - 1, j);
}

@Component({
  selector: 'app-calendrier',
  imports: [NgTemplateOutlet, ReactiveFormsModule, Icon, Field, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendrier.html',
  styleUrl: './calendrier.css',
})
export class Calendrier {
  readonly data = inject(DataService);
  readonly p = inject(PrefsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly types = TYPES_TACHE;
  readonly saison = SAISON;
  readonly joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  readonly aujourdhui = new Date().toISOString().slice(0, 10);
  readonly moisCourant = new Date().getMonth();
  readonly moisAnnee = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];

  readonly affiche = signal({ annee: new Date().getFullYear(), mois: new Date().getMonth() });
  readonly selection = signal(this.aujourdhui);
  readonly envoi = signal(false);

  readonly form = this.fb.nonNullable.group({
    type: ['Récolte' as TypeTache, Validators.required],
    parcelleId: [0],
    date: [this.aujourdhui, Validators.required],
    note: ['', Validators.maxLength(80)],
  });

  readonly titreMois = computed(() => {
    const { annee, mois } = this.affiche();
    const nom = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
      new Date(annee, mois, 1),
    );
    return nom.charAt(0).toUpperCase() + nom.slice(1);
  });

  readonly cases = computed<(Case | null)[]>(() => {
    const { annee, mois } = this.affiche();
    // Cases vides avant le 1er du mois : la semaine commence le lundi (getDay() renvoie 0 pour dimanche).
    const decalage = (new Date(annee, mois, 1).getDay() + 6) % 7;
    const nbJours = new Date(annee, mois + 1, 0).getDate();
    const taches = this.data.taches();
    const liste: (Case | null)[] = Array.from({ length: decalage }, () => null);
    for (let j = 1; j <= nbJours; j++) {
      const iso = versIso(new Date(annee, mois, j));
      liste.push({ iso, jour: j, taches: taches.filter((t) => t.date === iso) });
    }
    return liste;
  });

  readonly tachesDuJour = computed(() =>
    this.data.taches().filter((t) => t.date === this.selection()),
  );

  readonly aVenir = computed(() => {
    const limite = versIso(new Date(Date.now() + 30 * 86_400_000));
    return this.data
      .taches()
      .filter((t) => !t.faite && t.date >= this.aujourdhui && t.date <= limite)
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly enRetard = computed(() =>
    [...this.data.tachesEnRetard()].sort((a, b) => a.date.localeCompare(b.date)),
  );

  classe(type: TypeTache): string {
    return CLASSES[type];
  }

  dateLongue(iso: string): string {
    const texte = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(versDate(iso));
    return texte.charAt(0).toUpperCase() + texte.slice(1);
  }

  libelleCase(c: Case): string {
    const n = c.taches.length;
    return `${this.dateLongue(c.iso)}${n ? `, ${n} tâche${n > 1 ? 's' : ''}` : ''}`;
  }

  parcelle(t: Tache): string {
    return t.parcelleId === null ? 'Toutes les parcelles' : this.data.nomParcelle(t.parcelleId);
  }

  changerMois(delta: number): void {
    this.affiche.update(({ annee, mois }) => {
      const d = new Date(annee, mois + delta, 1);
      return { annee: d.getFullYear(), mois: d.getMonth() };
    });
  }

  revenirAujourdhui(): void {
    const d = new Date();
    this.affiche.set({ annee: d.getFullYear(), mois: d.getMonth() });
    this.choisir(this.aujourdhui);
  }

  choisir(iso: string): void {
    this.selection.set(iso);
    this.form.patchValue({ date: iso });
  }

  erreur(champ: 'date' | 'note'): string | null {
    const c = this.form.controls[champ];
    if (!c.touched || c.valid) return null;
    return champ === 'date' ? 'Choisissez une date.' : '80 caractères au maximum.';
  }

  async ajouter(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const parcelleId = Number(v.parcelleId) || null;
    this.envoi.set(true);
    const erreur = await this.data.ajouterTache({
      type: v.type,
      parcelleId,
      date: v.date,
      note: v.note.trim(),
    });
    this.envoi.set(false);
    if (erreur) {
      this.toast.afficher('Tâche non ajoutée', erreur, 'danger');
      return;
    }
    this.toast.afficher('Tâche ajoutée', `${v.type} · ${this.dateLongue(v.date)}`);
    const d = versDate(v.date);
    this.affiche.set({ annee: d.getFullYear(), mois: d.getMonth() });
    this.selection.set(v.date);
    this.form.patchValue({ note: '' });
    this.form.controls.note.markAsUntouched();
  }

  async basculer(t: Tache): Promise<void> {
    const erreur = await this.data.basculerTache(t.id);
    if (erreur) this.toast.afficher('Tâche non modifiée', erreur, 'danger');
  }

  async supprimer(t: Tache): Promise<void> {
    const erreur = await this.data.supprimerTache(t.id);
    if (erreur) {
      this.toast.afficher('Tâche non supprimée', erreur, 'danger');
      return;
    }
    this.toast.afficher('Tâche supprimée', `${t.type} · ${this.dateLongue(t.date)}`);
  }
}
