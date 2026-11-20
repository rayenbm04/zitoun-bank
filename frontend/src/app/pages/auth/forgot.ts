import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/ui/icon';
import { Field } from '../../shared/ui/field';
import { Branche, Logo } from '../../shared/ui/brand';

@Component({
  selector: 'app-forgot',
  imports: [ReactiveFormsModule, RouterLink, Icon, Field, Logo, Branche],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './auth.css',
  template: `
    <app-branche class="deco haut" />
    <app-branche class="deco" />

    <header class="entete">
      <a routerLink="/" aria-label="Zitoun Bank, accueil"><app-logo /></a>
      <a routerLink="/connexion" class="retour"><app-icon name="retour" />Connexion</a>
    </header>

    <main class="zone">
      <section class="carte" aria-labelledby="titre" aria-live="polite">
        @if (!envoyeA()) {
          <h1 id="titre">Mot de passe oublié</h1>
          <p class="sous">
            Indiquez l’adresse e-mail de votre compte. Nous vous enverrons un lien pour choisir un
            nouveau mot de passe.
          </p>

          <form [formGroup]="form" (ngSubmit)="envoyer()" novalidate>
            <app-field label="Adresse e-mail" for="email" [error]="erreur()">
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                inputmode="email"
                placeholder="nom@domaine.tn"
                aria-describedby="email-msg"
              />
            </app-field>
            <button
              class="btn btn-primary btn-block"
              type="submit"
              [disabled]="loading()"
              [attr.aria-busy]="loading()"
            >
              @if (loading()) {
                <span class="spinner" aria-hidden="true"></span> Envoi en cours…
              } @else {
                Envoyer le lien
              }
            </button>
          </form>
          <p class="bascule"><a routerLink="/connexion">Retour à la connexion</a></p>
        } @else {
          <div class="succes">
            <span class="rond"><app-icon name="mail" /></span>
            <h1 id="titre">Vérifiez votre boîte mail</h1>
            <p>
              Si un compte existe pour <strong class="strong">{{ envoyeA() }}</strong
              >, un lien de réinitialisation vient d’être envoyé. Il reste valable 30 minutes.
            </p>
            <p class="note">
              Rien reçu ? Regardez dans les courriers indésirables, ou
              <button type="button" class="lien" (click)="envoyeA.set(null)">
                essayez une autre adresse</button
              >.
            </p>
            <a routerLink="/connexion" class="btn btn-secondary">Retour à la connexion</a>
          </div>
        }
      </section>
    </main>
  `,
  styles: `
    .lien {
      border: none;
      background: none;
      padding: 0;
      color: var(--accent-text);
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
      text-underline-offset: 3px;
    }
  `,
})
export class Forgot {
  private fb = inject(FormBuilder);
  readonly loading = signal(false);
  readonly envoyeA = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  erreur(): string | null {
    const c = this.form.controls.email;
    if (!c.touched || c.valid) return null;
    return c.hasError('required')
      ? 'Saisissez votre adresse e-mail.'
      : 'Adresse e-mail invalide (exemple : nom@domaine.tn).';
  }

  envoyer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.envoyeA.set(this.form.getRawValue().email);
    }, 900);
  }
}
