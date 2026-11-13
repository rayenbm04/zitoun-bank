import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { PrefsService } from '../core/prefs.service';
import { Icon } from '../shared/ui/icon';
import { Logo } from '../shared/ui/brand';

export const LIENS = [
  { path: '/tableau-de-bord', cle: 'nav.dashboard', icone: 'grille' },
  { path: '/marche', cle: 'nav.marche', icone: 'etiquette' },
  { path: '/ventes', cle: 'nav.ventes', icone: 'billet' },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.open]': 'open()' },
  template: `
    <div class="voile" (click)="fermer.emit()" aria-hidden="true"></div>
    <aside class="panneau" [attr.aria-label]="prefs.t('nav.espace')">
      <div class="haut">
        <a routerLink="/tableau-de-bord" class="logo-lien" aria-label="Zitoun Bank, tableau de bord" (click)="fermer.emit()">
          <app-logo [inverse]="true" />
        </a>
        <button type="button" class="fermer" (click)="fermer.emit()" [attr.aria-label]="prefs.t('nav.fermer')">
          <app-icon name="fermer" />
        </button>
      </div>

      <nav [attr.aria-label]="prefs.t('nav.principal')">
        <ul>
          @for (l of liens; track l.path) {
            <li>
              <a [routerLink]="l.path" routerLinkActive="actif" #rla="routerLinkActive"
                 [attr.aria-current]="rla.isActive ? 'page' : null" [attr.title]="prefs.t(l.cle)" (click)="fermer.emit()">
                <app-icon [name]="l.icone" tone="mono" />
                <span class="txt">{{ prefs.t(l.cle) }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="bas">
        <div class="moi">
          <span class="avatar" aria-hidden="true">{{ initiales() }}</span>
          <span class="txt">
            <strong>{{ auth.user()?.prenom }} {{ auth.user()?.nom }}</strong>
            <small>{{ prefs.t(auth.user()?.region ?? '') || '' }}</small>
          </span>
        </div>
        <button type="button" class="sortir" (click)="auth.logout()" [attr.title]="prefs.t('nav.deconnexion')">
          <app-icon name="sortie" /><span class="txt">{{ prefs.t('nav.deconnexion') }}</span>
        </button>
      </div>
    </aside>
  `,
  styles: `
    :host { display: contents; }
    .panneau {
      position: sticky; top: 0; height: 100vh; width: var(--sidebar-w); flex: none; z-index: 40;
      display: flex; flex-direction: column; gap: 28px; padding: 22px 14px 18px;
      background: var(--nav-bg); color: var(--nav-fg);
      background-image: radial-gradient(120% 60% at 0% 100%, rgba(124, 139, 79, 0.22), transparent 60%);
    }
    .haut { display: flex; align-items: center; justify-content: space-between; padding: 0 8px; min-height: 44px; }
    .logo-lien { text-decoration: none; border-radius: 10px; }
    .logo-lien:focus-visible { box-shadow: 0 0 0 3px var(--or-clair); }
    .fermer { display: none; }
    nav { flex: 1; overflow-y: auto; margin: 0 -4px; padding: 0 4px; }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
    nav a {
      display: flex; align-items: center; gap: 12px; min-height: 46px; padding: 0 14px;
      border-radius: 12px; color: var(--nav-fg); text-decoration: none; font-weight: 500;
      transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
    }
    nav a app-icon { width: 22px; height: 22px; opacity: 0.9; }
    nav a:hover { background: var(--nav-hover); color: var(--nav-fg-strong); }
    nav a:focus-visible { box-shadow: 0 0 0 3px var(--or-clair); }
    nav a.actif { background: var(--nav-active-bg); color: var(--nav-active-fg); font-weight: 700; }
    nav a.actif app-icon { opacity: 1; }
    .bas { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(253, 251, 245, 0.12); padding-top: 14px; }
    .moi { display: flex; align-items: center; gap: 12px; padding: 4px 8px; min-width: 0; }
    .avatar {
      width: 40px; height: 40px; flex: none; border-radius: 50%; display: grid; place-items: center;
      background: var(--or); color: var(--olive-900); font-weight: 700; font-size: 0.9375rem;
    }
    .moi .txt { display: flex; flex-direction: column; min-width: 0; }
    .moi strong { color: var(--nav-fg-strong); font-size: 0.9375rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .moi small { color: #b9c0a6; font-size: 0.8125rem; }
    .sortir {
      display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 0 14px; border: none; border-radius: 12px;
      background: transparent; color: var(--nav-fg); cursor: pointer; font-weight: 500; text-align: start;
    }
    .sortir app-icon { width: 20px; height: 20px; }
    .sortir:hover { background: var(--nav-hover); color: var(--nav-fg-strong); }
    .sortir:focus-visible { box-shadow: 0 0 0 3px var(--or-clair); }
    .voile { display: none; }

    @media (max-width: 1100px) and (min-width: 721px) {
      .panneau { width: 84px; padding-inline: 12px; align-items: stretch; }
      .haut { padding: 0; justify-content: center; }
      :host ::ng-deep .haut app-logo .nom { display: none; }
      nav a, .sortir { justify-content: center; padding: 0; }
      .txt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
      .moi { justify-content: center; padding: 0; }
    }

    @media (max-width: 720px) {
      .panneau {
        position: fixed; inset-block: 0; inset-inline-start: 0; width: min(86vw, 320px); height: 100dvh;
        transform: translateX(-104%); transition: transform 260ms var(--ease-out); box-shadow: var(--shadow-3); z-index: 70;
      }
      :host-context([dir='rtl']) .panneau { transform: translateX(104%); }
      :host(.open) .panneau { transform: none !important; }
      .fermer {
        display: grid; place-items: center; width: 44px; height: 44px; border: none; border-radius: 12px;
        background: rgba(253, 251, 245, 0.08); color: var(--nav-fg-strong); cursor: pointer;
      }
      .fermer app-icon { width: 22px; height: 22px; }
      .voile {
        display: block; position: fixed; inset: 0; z-index: 69; background: rgba(23, 28, 14, 0.5);
        opacity: 0; pointer-events: none; transition: opacity 200ms ease;
      }
      :host(.open) .voile { opacity: 1; pointer-events: auto; }
    }
  `,
})
export class Sidebar {
  readonly auth = inject(AuthService);
  readonly prefs = inject(PrefsService);
  readonly open = input(false);
  readonly fermer = output<void>();
  readonly liens = LIENS;

  readonly initiales = computed(() => {
    const u = this.auth.user();
    return u ? `${u.prenom[0] ?? ''}${u.nom[0] ?? ''}`.toUpperCase() : 'ZB';
  });
}
