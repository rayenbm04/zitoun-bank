import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

/** Vérifie que les deux mots de passe sont identiques */
function samePassword(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './auth.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly regions = ['Sfax', 'Sousse', 'Mahdia', 'Monastir', 'Kairouan', 'Sidi Bouzid', 'Gabès', 'Médenine', 'Nabeul', 'Autre'];

  readonly form = this.fb.nonNullable.group(
    {
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.pattern(/^[0-9 +]{8,15}$/)],
      region: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: samePassword }
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { confirm, ...data } = this.form.getRawValue();

    this.auth.register(data).subscribe({
      next: () => this.router.navigate(['/tableau-de-bord']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.status === 0
          ? 'Impossible de joindre le serveur. Le backend est-il démarré ?'
          : err.error?.message ?? 'Erreur lors de l’inscription.');
      },
    });
  }
}
