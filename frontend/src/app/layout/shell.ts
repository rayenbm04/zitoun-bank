import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { PrefsService } from '../core/prefs.service';
import { Icon } from '../shared/ui/icon';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Sidebar, Topbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'tiroir.set(false)' },
  template: `
    <a class="skip-link" href="#contenu">{{ prefs.t('nav.passer') }}</a>
    <app-sidebar [open]="tiroir()" (fermer)="tiroir.set(false)" />
    <div class="principal">
      <app-topbar [titre]="titre()" />
      <main id="contenu" tabindex="-1" class="contenu">
        <router-outlet />
      </main>
    </div>

    <nav class="nav-bas" [attr.aria-label]="prefs.t('nav.principal')">
      @for (l of raccourcis; track l.path) {
        <a [routerLink]="l.path" routerLinkActive="actif" #rla="routerLinkActive" [attr.aria-current]="rla.isActive ? 'page' : null">
          <app-icon [name]="l.icone" tone="mono" />
          <span>{{ prefs.t(l.cle) }}</span>
        </a>
      }
      <button type="button" (click)="tiroir.set(true)" [attr.aria-expanded]="tiroir()" [attr.aria-label]="prefs.t('nav.ouvrir')">
        <app-icon name="menu" />
        <span>{{ prefs.t('nav.plus') }}</span>
      </button>
    </nav>
  `,
  styles: `
    :host { display: flex; min-height: 100vh; }
    .principal { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .contenu { flex: 1; width: 100%; max-width: var(--content-max); padding: 32px 40px 64px; outline: none; }
    .nav-bas { display: none; }
    @media (max-width: 1100px) { .contenu { padding: 28px 28px 56px; } }
    @media (max-width: 720px) {
      .contenu { padding: 20px 16px 104px; }
      .nav-bas {
        display: grid; grid-template-columns: repeat(4, 1fr); position: fixed; inset-inline: 0; bottom: 0; z-index: 35;
        padding: 6px 6px calc(6px + env(safe-area-inset-bottom)); background: var(--nav-bg);
        box-shadow: 0 -6px 24px rgba(23, 28, 14, 0.2);
      }
      .nav-bas a, .nav-bas button {
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-height: 56px;
        border: none; background: transparent; color: var(--nav-fg); text-decoration: none; border-radius: 12px;
        font-size: 0.6875rem; font-weight: 600; cursor: pointer; padding: 4px 2px; text-align: center; line-height: 1.15;
      }
      .nav-bas app-icon { width: 22px; height: 22px; }
      .nav-bas a.actif { color: var(--or-clair); background: rgba(201, 162, 39, 0.14); }
      .nav-bas a:focus-visible, .nav-bas button:focus-visible { box-shadow: 0 0 0 3px var(--or-clair); }
    }
  `,
})
export class Shell {
  readonly prefs = inject(PrefsService);
  private readonly router = inject(Router);

  readonly tiroir = signal(false);

  readonly raccourcis = [
    { path: '/tableau-de-bord', cle: 'nav.dashboard', icone: 'grille' },
    { path: '/marche', cle: 'nav.marche', icone: 'etiquette' },
  ];

  readonly titre = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.titreCourant())
    ),
    { initialValue: this.titreCourant() }
  );

  private titreCourant(): string {
    let r = this.router.routerState.snapshot.root;
    while (r.firstChild) r = r.firstChild;
    return (r.data?.['titre'] as string) ?? 'nav.dashboard';
  }
}
