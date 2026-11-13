import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { REGIONS } from '../../core/models';
import { Icon } from '../../shared/ui/icon';
import { Alert } from '../../shared/ui/alert';
import { Field } from '../../shared/ui/field';
import { Branche, Logo } from '../../shared/ui/brand';

function samePassword(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

type Champ = 'prenom' | 'nom' | 'email' | 'telephone' | 'region' | 'password' | 'confirm';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Icon, Alert, Field, Logo, Branche],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.html',
  styleUrl: './auth.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly voirMdp = signal(false);
  readonly regions = REGIONS;

  readonly form = this.fb.nonNullable.group(
    {
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.pattern(/^(\+216\s?)?[2-9]\d(\s?\d{3}){2}$/)],
      region: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: samePassword, updateOn: 'change' }
  );

  private readonly valeurs = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  private readonly statut = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  readonly force = computed(() => {
    const p = this.valeurs().password ?? '';
    let n = 0;
    if (p.length >= 8) n++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) n++;
    if (/\d/.test(p)) n++;
    if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) n++;
    return p ? Math.max(n, 1) : 0;
  });
  readonly forceTexte = computed(() => ['', 'Trop faible', 'Moyen', 'Bon', 'Excellent'][this.force()]);

  erreur(champ: Champ): string | null {
    this.statut();
    const c = this.form.controls[champ];
    if (!c.touched) return null;
    if (champ === 'confirm') {
      if (c.hasError('required')) return 'Confirmez le mot de passe.';
      return this.form.hasError('mismatch') ? 'Les deux mots de passe sont différents.' : null;
    }
    if (c.valid) return null;
    const messages: Record<Champ, string> = {
      prenom: 'Saisissez votre prénom.',
      nom: 'Saisissez votre nom.',
      email: c.hasError('required') ? 'Saisissez votre adresse e-mail.' : 'Adresse e-mail invalide (exemple : nom@domaine.tn).',
      telephone: 'Numéro tunisien à 8 chiffres, par exemple 98 123 456.',
      region: 'Choisissez la région de votre exploitation.',
      password: c.hasError('required') ? 'Choisissez un mot de passe.' : 'Au moins 8 caractères.',
      confirm: '',
    };
    return messages[champ];
  }

  valide(champ: Champ): boolean {
    this.statut();
    const c = this.form.controls[champ];
    return c.touched && c.valid && !!c.value;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document.querySelector<HTMLElement>('.field.invalid input, .field.invalid select')?.focus();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { confirm, ...data } = this.form.getRawValue();

    this.auth.register(data).subscribe({
      next: () => this.router.navigate(['/tableau-de-bord']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 0
            ? 'Le serveur ne répond pas. Vérifiez que le backend est démarré (npm run dev dans backend).'
            : (err.error?.message ?? 'L’inscription a échoué. Réessayez.')
        );
      },
    });
  }
}
