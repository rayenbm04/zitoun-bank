import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { Icon } from '../../shared/ui/icon';
import { Alert } from '../../shared/ui/alert';
import { Field } from '../../shared/ui/field';
import { Branche, Logo } from '../../shared/ui/brand';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Icon, Alert, Field, Logo, Branche],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './auth.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly voirMdp = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  erreur(champ: 'email' | 'password'): string | null {
    const c = this.form.controls[champ];
    if (!c.touched || c.valid) return null;
    if (champ === 'email') return c.hasError('required') ? 'Saisissez votre adresse e-mail.' : 'Cette adresse e-mail n’est pas valide (exemple : nom@domaine.tn).';
    return 'Saisissez votre mot de passe.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/tableau-de-bord']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 0
            ? 'Le serveur ne répond pas. Vérifiez que le backend est démarré (npm run dev dans backend).'
            : (err.error?.message ?? 'La connexion a échoué. Réessayez.')
        );
      },
    });
  }
}
