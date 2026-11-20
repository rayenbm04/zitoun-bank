import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { PrefsService } from '../../core/prefs.service';
import { REGIONS } from '../../core/models';
import { Icon } from '../../shared/ui/icon';
import { Field } from '../../shared/ui/field';
import { Alert } from '../../shared/ui/alert';
import { ToastService } from '../../shared/ui/toast';

function memeMdp(g: AbstractControl): ValidationErrors | null {
  return g.get('nouveau')?.value === g.get('confirm')?.value ? null : { mismatch: true };
}

function messageServeur(err: HttpErrorResponse, defaut: string): string {
  return err.status === 0
    ? 'Le serveur ne répond pas. Vérifiez que le backend est démarré.'
    : (err.error?.message ?? defaut);
}

@Component({
  selector: 'app-profil',
  imports: [ReactiveFormsModule, Icon, Field, Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {
  readonly auth = inject(AuthService);
  readonly prefs = inject(PrefsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly regions = REGIONS;
  readonly envoiInfos = signal(false);
  readonly erreurInfos = signal('');
  readonly envoiMdp = signal(false);
  readonly erreurMdp = signal('');

  readonly infos = this.fb.nonNullable.group({
    prenom: [this.auth.user()?.prenom ?? '', Validators.required],
    nom: [this.auth.user()?.nom ?? '', Validators.required],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
    telephone: [
      this.auth.user()?.telephone ?? '',
      Validators.pattern(/^(\+216\s?)?[2-9]\d(\s?\d{3}){2}$/),
    ],
    region: [this.auth.user()?.region ?? '', Validators.required],
  });

  readonly mdp = this.fb.nonNullable.group(
    {
      actuel: ['', Validators.required],
      nouveau: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: memeMdp },
  );

  erreurInfo(champ: 'prenom' | 'nom' | 'email' | 'telephone' | 'region'): string | null {
    const c = this.infos.controls[champ];
    if (!c.touched || c.valid) return null;
    return {
      prenom: 'Saisissez votre prénom.',
      nom: 'Saisissez votre nom.',
      email: 'Adresse e-mail invalide.',
      telephone: 'Numéro tunisien à 8 chiffres, par exemple 98 123 456.',
      region: 'Choisissez une région.',
    }[champ];
  }

  erreurMotDePasse(champ: 'actuel' | 'nouveau' | 'confirm'): string | null {
    const c = this.mdp.controls[champ];
    if (!c.touched) return null;
    if (champ === 'confirm')
      return c.hasError('required')
        ? 'Confirmez le nouveau mot de passe.'
        : this.mdp.hasError('mismatch')
          ? 'Les deux mots de passe sont différents.'
          : null;
    if (c.valid) return null;
    return champ === 'actuel' ? 'Saisissez votre mot de passe actuel.' : 'Au moins 8 caractères.';
  }

  enregistrerInfos(): void {
    this.erreurInfos.set('');
    if (this.infos.invalid) {
      this.infos.markAllAsTouched();
      return;
    }
    this.envoiInfos.set(true);
    this.auth.updateProfile(this.infos.getRawValue()).subscribe({
      next: () => {
        this.envoiInfos.set(false);
        this.infos.markAsPristine();
        this.toast.afficher('Informations enregistrées', 'Votre profil est à jour.');
      },
      error: (err: HttpErrorResponse) => {
        this.envoiInfos.set(false);
        this.erreurInfos.set(messageServeur(err, 'L’enregistrement a échoué.'));
      },
    });
  }

  changerMdp(): void {
    this.erreurMdp.set('');
    if (this.mdp.invalid) {
      this.mdp.markAllAsTouched();
      return;
    }
    this.envoiMdp.set(true);
    const { actuel, nouveau } = this.mdp.getRawValue();
    this.auth.changePassword(actuel, nouveau).subscribe({
      next: () => {
        this.envoiMdp.set(false);
        this.mdp.reset();
        this.toast.afficher('Mot de passe modifié', 'Utilisez-le à votre prochaine connexion.');
      },
      error: (err: HttpErrorResponse) => {
        this.envoiMdp.set(false);
        this.erreurMdp.set(messageServeur(err, 'Le changement de mot de passe a échoué.'));
      },
    });
  }
}
