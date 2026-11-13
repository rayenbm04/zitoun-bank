import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { PrefsService } from '../core/prefs.service';
import { Icon } from '../shared/ui/icon';
import { Logo } from '../shared/ui/brand';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, Icon, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'clicDehors($event)',
    '(document:keydown.escape)': 'ouvert.set(null)',
  },
  template: `
    <header class="barre">
      <a routerLink="/tableau-de-bord" class="logo-mobile" aria-label="Zitoun Bank, tableau de bord">
        <app-logo [compact]="true" />
      </a>
      <h1 class="titre">{{ prefs.t(titre()) }}</h1>

      <div class="outils">
        <div class="langue" role="group" [attr.aria-label]="prefs.t('top.langue')">
          <button type="button" [attr.aria-pressed]="prefs.langue() === 'fr'" (click)="prefs.langue.set('fr')" lang="fr">FR</button>
          <button type="button" [attr.aria-pressed]="prefs.langue() === 'ar'" (click)="prefs.langue.set('ar')" lang="ar" aria-label="العربية">ع</button>
        </div>

        <button type="button" class="ico" (click)="prefs.basculerTheme()"
                [attr.aria-label]="prefs.sombre() ? prefs.t('top.clair') : prefs.t('top.sombre')"
                [attr.title]="prefs.sombre() ? prefs.t('top.clair') : prefs.t('top.sombre')">
          <app-icon [name]="prefs.sombre() ? 'soleil' : 'lune'" />
        </button>

        <div class="pop-zone">
          <button type="button" class="ico" (click)="basculer('notifs')" [attr.aria-expanded]="ouvert() === 'notifs'"
                  aria-controls="pop-notifs" [attr.aria-label]="prefs.t('top.notifs') + ' (' + data.alertes().length + ')'">
            <app-icon name="cloche" />
            @if (data.alertes().length) { <span class="pastille" aria-hidden="true">{{ data.alertes().length }}</span> }
          </button>
          @if (ouvert() === 'notifs') {
            <div class="pop" id="pop-notifs" role="region" [attr.aria-label]="prefs.t('top.notifs')">
              <p class="pop-titre">{{ prefs.t('top.notifs') }}</p>
              <ul>
                @for (a of data.alertes(); track a.id) {
                  <li>
                    @if (a.lien) {
                      <a [routerLink]="a.lien" (click)="ouvert.set(null)" [class]="'n n-' + a.ton">
                        <span class="n-ic"><app-icon [name]="a.icone" /></span>
                        <span class="n-txt">
                          <strong>{{ prefs.t(a.titre, a.vars) }}</strong>
                          <small>{{ prefs.t(a.texte, a.vars) }}</small>
                        </span>
                      </a>
                    } @else {
                      <div [class]="'n n-' + a.ton">
                        <span class="n-ic"><app-icon [name]="a.icone" /></span>
                        <span class="n-txt">
                          <strong>{{ prefs.t(a.titre, a.vars) }}</strong>
                          <small>{{ prefs.t(a.texte, a.vars) }}</small>
                        </span>
                      </div>
                    }
                  </li>
                } @empty {
                  <li class="vide">{{ prefs.t('top.aucune') }}</li>
                }
              </ul>
            </div>
          }
        </div>

        <div class="pop-zone">
          <button type="button" class="compte" (click)="basculer('compte')" [attr.aria-expanded]="ouvert() === 'compte'"
                  aria-controls="pop-compte" [attr.aria-label]="prefs.t('top.compte')">
            <span class="avatar" aria-hidden="true">{{ initiales() }}</span>
            <span class="nom">{{ auth.user()?.prenom }}</span>
            <app-icon name="chevron-bas" />
          </button>
          @if (ouvert() === 'compte') {
            <div class="pop pop-compte" id="pop-compte">
              <div class="qui">
                <strong>{{ auth.user()?.prenom }} {{ auth.user()?.nom }}</strong>
                <small>{{ auth.user()?.email }}</small>
              </div>
              <button type="button" class="item" (click)="auth.logout()"><app-icon name="sortie" />{{ prefs.t('nav.deconnexion') }}</button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: `
    .barre {
      position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: 16px;
      min-height: var(--topbar-h); padding: 12px 40px;
      background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
    }
    .logo-mobile { display: none; border-radius: 10px; }
    .titre { flex: 1; min-width: 0; font-size: 1.625rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .outils { display: flex; align-items: center; gap: 8px; }
    .langue { display: inline-flex; padding: 3px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--border); }
    .langue button {
      min-width: 40px; height: 36px; border: none; border-radius: 9px; background: transparent; cursor: pointer;
      color: var(--text-muted); font-weight: 700; font-size: 0.875rem;
    }
    .langue button[lang='ar'] { font-family: var(--font-ar); font-size: 1rem; }
    .langue button[aria-pressed='true'] { background: var(--surface); color: var(--text-strong); box-shadow: var(--shadow-1); }
    .ico {
      position: relative; width: 44px; height: 44px; border-radius: 12px; border: 1px solid transparent;
      background: transparent; color: var(--text-strong); display: grid; place-items: center; cursor: pointer;
    }
    .ico:hover { background: var(--surface-2); border-color: var(--border); }
    .ico app-icon { width: 21px; height: 21px; }
    .pastille {
      position: absolute; top: 5px; inset-inline-end: 5px; min-width: 18px; height: 18px; padding: 0 5px;
      border-radius: 999px; background: var(--danger-fg); color: #fff; font-size: 11px; font-weight: 700;
      display: grid; place-items: center; border: 2px solid var(--bg);
    }
    .compte {
      display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 8px 0 4px; border-radius: 999px;
      border: 1px solid var(--border); background: var(--surface); cursor: pointer; color: var(--text-strong); font-weight: 600;
    }
    :host-context([dir='rtl']) .compte { padding: 0 4px 0 8px; }
    .compte:hover { border-color: var(--sauge); }
    .compte app-icon { width: 16px; height: 16px; color: var(--text-muted); }
    .avatar {
      width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
      background: var(--olive-700); color: #fdfbf5; font-size: 0.8125rem; font-weight: 700;
    }
    .pop-zone { position: relative; }
    .pop {
      position: absolute; top: calc(100% + 10px); inset-inline-end: 0; width: 360px; max-width: calc(100vw - 24px);
      background: var(--surface); border: 1px solid var(--border); border-radius: 18px; box-shadow: var(--shadow-3);
      padding: 10px; z-index: 50; animation: pop 180ms var(--ease-out);
    }
    .pop-titre { font-weight: 700; color: var(--text-strong); padding: 8px 10px 10px; }
    .pop ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
    .n { display: flex; gap: 12px; padding: 10px; border-radius: 12px; text-decoration: none; color: var(--text); }
    .n:hover { background: var(--surface-2); }
    .n-ic { width: 36px; height: 36px; flex: none; border-radius: 10px; display: grid; place-items: center; background: var(--info-bg); color: var(--info-fg); }
    .n-warn .n-ic { background: var(--warn-bg); color: var(--warn-fg); }
    .n-ok .n-ic { background: var(--ok-bg); color: var(--ok-fg); }
    .n-danger .n-ic { background: var(--danger-bg); color: var(--danger-fg); }
    .n-ic app-icon { width: 18px; height: 18px; }
    .n-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .n-txt strong { color: var(--text-strong); font-size: 0.9375rem; }
    .n-txt small { color: var(--text-muted); font-size: 0.8125rem; }
    .vide { padding: 12px; color: var(--text-muted); }
    .pop-compte { width: 260px; }
    .qui { display: flex; flex-direction: column; padding: 8px 10px 12px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
    .qui strong { color: var(--text-strong); }
    .qui small { color: var(--text-muted); overflow-wrap: anywhere; }
    .item {
      display: flex; align-items: center; gap: 10px; width: 100%; min-height: 44px; padding: 0 10px; border-radius: 10px;
      border: none; background: transparent; color: var(--text-strong); text-decoration: none; cursor: pointer; font-weight: 500; text-align: start;
    }
    .item:hover { background: var(--surface-2); }
    .item app-icon { width: 18px; height: 18px; color: var(--icon); }
    @keyframes pop { from { opacity: 0; transform: translateY(-6px); } }

    @media (max-width: 1100px) { .barre { padding-inline: 28px; } }
    @media (max-width: 720px) {
      .barre { padding: 10px 16px; gap: 10px; min-height: 64px; }
      .titre { font-size: 1.1875rem; }
      .compte .nom, .compte app-icon { display: none; }
      .compte { padding: 0; border: none; background: transparent; width: 44px; justify-content: center; }
      .outils { gap: 2px; }
      .langue { padding: 2px; }
      .langue button { min-width: 32px; height: 34px; }
      .ico { width: 40px; height: 40px; }
      .pop { position: fixed; top: 70px; inset-inline: 12px; width: auto; }
    }
  `,
})
export class Topbar {
  readonly prefs = inject(PrefsService);
  readonly auth = inject(AuthService);
  readonly data = inject(DataService);
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly titre = input.required<string>();
  readonly ouvert = signal<'notifs' | 'compte' | null>(null);

  readonly initiales = computed(() => {
    const u = this.auth.user();
    return u ? `${u.prenom[0] ?? ''}${u.nom[0] ?? ''}`.toUpperCase() : 'ZB';
  });

  basculer(p: 'notifs' | 'compte'): void {
    this.ouvert.update(o => (o === p ? null : p));
  }

  clicDehors(e: Event): void {
    if (this.ouvert() && !this.el.nativeElement.contains(e.target as Node)) this.ouvert.set(null);
  }
}
