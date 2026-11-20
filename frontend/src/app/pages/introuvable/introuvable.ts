import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Icon } from '../../shared/ui/icon';
import { Logo, OliveTree } from '../../shared/ui/brand';

@Component({
  selector: 'app-introuvable',
  imports: [RouterLink, Icon, Logo, OliveTree],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="entete">
      <a routerLink="/" aria-label="Zitoun Bank, accueil"><app-logo /></a>
    </header>
    <main class="zone">
      <div class="illu"><app-olive-tree /></div>
      <div class="texte">
        <p class="code" aria-hidden="true">404</p>
        <h1>Cette page n’existe pas</h1>
        <p class="sous">L’adresse est peut-être mal saisie, ou la page a été déplacée. Aucune olive n’a été perdue.</p>
        <div class="actions">
          @if (auth.isLoggedIn()) {
            <a routerLink="/tableau-de-bord" class="btn btn-primary"><app-icon name="grille" />Tableau de bord</a>
          } @else {
            <a routerLink="/" class="btn btn-primary"><app-icon name="olive" />Retour à l’accueil</a>
          }
          <button type="button" class="btn btn-outline" (click)="retour()"><app-icon name="retour" />Page précédente</button>
        </div>
      </div>
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg); }
    .entete { padding: 20px 40px; }
    .entete a { display: inline-block; border-radius: 10px; }
    .zone {
      flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); align-items: center; gap: 48px;
      width: 100%; max-width: 1080px; margin: 0 auto; padding: 24px 40px 64px;
    }
    .illu { max-width: 420px; justify-self: end; width: 100%; }
    .code {
      font-family: var(--font-display); font-size: clamp(4.5rem, 12vw, 7.5rem); font-weight: 700; line-height: 1;
      color: var(--accent-text); letter-spacing: -0.02em;
    }
    h1 { margin-top: 12px; font-size: var(--fs-2xl); }
    .sous { margin-top: 12px; color: var(--text-muted); max-width: 44ch; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
    @media (max-width: 760px) {
      .entete { padding: 16px 20px; }
      .zone { grid-template-columns: minmax(0, 1fr); gap: 16px; padding: 8px 20px 48px; text-align: center; }
      .illu { justify-self: center; max-width: 240px; }
      .sous { margin-inline: auto; }
      .actions { justify-content: center; }
    }
  `,
})
export class Introuvable {
  readonly auth = inject(AuthService);
  private readonly location = inject(Location);

  retour(): void {
    this.location.back();
  }
}
