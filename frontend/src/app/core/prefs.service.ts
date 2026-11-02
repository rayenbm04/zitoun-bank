import { Injectable, effect, signal } from '@angular/core';

export type Langue = 'fr' | 'ar';

/** Petit dictionnaire bilingue pour la navigation et les titres */
const TEXTES: Record<string, { fr: string; ar: string }> = {
  dashboard: { fr: 'Tableau de bord', ar: 'لوحة القيادة' },
  verger: { fr: 'Verger', ar: 'البستان' },
  recoltes: { fr: 'Récoltes', ar: 'الجني' },
  production: { fr: 'Production d’huile', ar: 'إنتاج الزيت' },
  stocks: { fr: 'Stocks', ar: 'المخزون' },
  marche: { fr: 'Marché et prix', ar: 'السوق والأسعار' },
  ventes: { fr: 'Ventes', ar: 'المبيعات' },
  profil: { fr: 'Profil et paramètres', ar: 'الملف والإعدادات' },
  deconnexion: { fr: 'Déconnexion', ar: 'تسجيل الخروج' },
  bonjour: { fr: 'Bonjour', ar: 'مرحبا' },
};

/** Préférences de l'utilisateur : langue (FR/AR) et mode sombre */
@Injectable({ providedIn: 'root' })
export class PrefsService {
  readonly langue = signal<Langue>((localStorage.getItem('zb_langue') as Langue) || 'fr');
  readonly sombre = signal<boolean>(localStorage.getItem('zb_sombre') === '1');

  constructor() {
    effect(() => {
      const l = this.langue();
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('zb_langue', l);
    });
    effect(() => {
      const s = this.sombre();
      document.documentElement.classList.toggle('dark', s);
      localStorage.setItem('zb_sombre', s ? '1' : '0');
    });
  }

  t(cle: string): string {
    return TEXTES[cle]?.[this.langue()] ?? cle;
  }
}
