import { Injectable, effect, signal } from '@angular/core';
import { MOIS, TEXTES } from './i18n';

export type Langue = 'fr' | 'ar';

function lire(cle: string): string | null {
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
}
function ecrire(cle: string, valeur: string): void {
  try {
    localStorage.setItem(cle, valeur);
  } catch {
  }
}

@Injectable({ providedIn: 'root' })
export class PrefsService {
  readonly langue = signal<Langue>(lire('zitoun_bank_langue') === 'ar' ? 'ar' : 'fr');
  readonly sombre = signal<boolean>(
    lire('zitoun_bank_sombre') !== null
      ? lire('zitoun_bank_sombre') === '1'
      : typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
  );

  constructor() {
    effect(() => {
      const l = this.langue();
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      ecrire('zitoun_bank_langue', l);
    });
    effect(() => {
      const s = this.sombre();
      document.documentElement.classList.toggle('dark', s);
      ecrire('zitoun_bank_sombre', s ? '1' : '0');
    });
  }

  basculerLangue(): void {
    this.langue.update(l => (l === 'fr' ? 'ar' : 'fr'));
  }

  basculerTheme(): void {
    this.sombre.update(s => !s);
  }

  t(cle: string, vars?: Record<string, string | number>): string {
    let texte = TEXTES[cle]?.[this.langue()] ?? cle;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        const val = typeof v === 'string' && TEXTES[v] ? TEXTES[v][this.langue()] : String(v);
        texte = texte.replace(`{${k}}`, val);
      }
    }
    return texte;
  }

  nombre(valeur: number, decimales = 0): string {
    return new Intl.NumberFormat(this.langue() === 'ar' ? 'ar-TN' : 'fr-FR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    })
      .format(valeur)
      .replace(/\u202f/g, '\u00a0');
  }

  date(iso: string): string {
    const [a, m, j] = iso.slice(0, 10).split('-');
    return `${j}/${m}/${a}`;
  }

  mois(index: number): string {
    return MOIS[this.langue()][index];
  }
}
