import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const METIER: Record<string, string> = {
  olive:
    '<path class="s" d="M4 20C9 15 14 9.5 20 4" fill="none" stroke-width="1.6" stroke-linecap="round"/>' +
    '<ellipse class="p1" cx="9" cy="12" rx="4.2" ry="1.7" transform="rotate(-60 9 12)"/>' +
    '<ellipse class="p3" cx="15" cy="6.5" rx="4.2" ry="1.7" transform="rotate(-10 15 6.5)"/>' +
    '<ellipse class="p1" cx="16.6" cy="10.6" rx="3.6" ry="1.5" transform="rotate(-55 16.6 10.6)"/>' +
    '<ellipse class="p2" cx="7" cy="17.6" rx="2" ry="2.6"/><ellipse class="p4" cx="11.6" cy="15.6" rx="1.8" ry="2.3"/>',
  goutte:
    '<path class="p2" d="M12 2.5C9.6 6.4 5.5 10.5 5.5 14.6a6.5 6.5 0 0 0 13 0c0-4.1-4.1-8.2-6.5-12.1z"/>' +
    '<path class="hl" d="M9 15a3 3 0 0 0 3 3" fill="none" stroke-width="1.7" stroke-linecap="round"/>',
  caisse:
    '<path class="p3" d="M12 2.5 21 7l-9 4.5L3 7z"/><path class="p1" d="M3 7l9 4.5V22l-9-4.5z"/><path class="p4" d="M21 7l-9 4.5V22l9-4.5z"/>',
  etiquette:
    '<path class="p2" d="M13.6 2.5H21v7.4L10.4 20.5a1.5 1.5 0 0 1-2.1 0l-4.8-4.8a1.5 1.5 0 0 1 0-2.1z"/>' +
    '<circle class="hole" cx="17" cy="7" r="1.6"/>',
  barres:
    '<rect class="p4" x="3" y="20" width="18" height="1.8" rx=".9"/><rect class="p3" x="4.5" y="12" width="4" height="7" rx="1"/>' +
    '<rect class="p1" x="10" y="8" width="4" height="11" rx="1"/><rect class="p2" x="15.5" y="3.5" width="4" height="15.5" rx="1"/>',
  arbre:
    '<path class="p4" d="M11 21.5c.4-2.6.2-4.6-1.2-6.4l1.5-.6c.8 1 1.2 2 1.3 3 .4-1.4 1.2-2.6 2.4-3.4l1 1.1c-1.6 1.2-2.3 3.2-2.2 6.3z"/>' +
    '<path class="p1" d="M12 2.5c2.3 0 3.9 1.3 4.4 2.9 2.3.2 4.1 1.9 4.1 4.1 0 2.4-2 4.2-4.5 4.2-.8 1-2.3 1.6-4 1.6s-3.2-.6-4-1.6C5.5 13.7 3.5 11.9 3.5 9.5c0-2.2 1.8-3.9 4.1-4.1.5-1.6 2.1-2.9 4.4-2.9z"/>' +
    '<circle class="p2" cx="9" cy="9" r="1.15"/><circle class="p2" cx="14.6" cy="10.4" r="1.15"/><circle class="p2" cx="12.4" cy="6.4" r="1.15"/>',
  panier:
    '<ellipse class="p1" cx="8.4" cy="7.8" rx="2.2" ry="2.7"/><ellipse class="p2" cx="12.4" cy="7" rx="2.2" ry="2.7"/>' +
    '<ellipse class="p3" cx="16.2" cy="8" rx="2" ry="2.5"/>' +
    '<path class="p4" d="M3 10.5h18l-1.8 8.8a2 2 0 0 1-2 1.7H6.8a2 2 0 0 1-2-1.7z"/>' +
    '<path class="hl" d="M8.5 13.5v4.5M12 13.5v4.5M15.5 13.5v4.5" fill="none" stroke-width="1.5" stroke-linecap="round"/>',
  bouteille:
    '<path class="p4" d="M10 2.5h4v2.2l.9 1.6c.7.6 1.1 1.5 1.1 2.4v11.3a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 20V8.7c0-.9.4-1.8 1.1-2.4l.9-1.6z"/>' +
    '<path class="p2" d="M8 11.5h8v6.5H8z"/>',
  billet:
    '<rect class="p1" x="2" y="6" width="20" height="12" rx="2.5"/><circle class="p2" cx="12" cy="12" r="3.2"/>' +
    '<circle class="hole" cx="5.6" cy="12" r="1.1"/><circle class="hole" cx="18.4" cy="12" r="1.1"/>',
  grille:
    '<rect class="p1" x="3" y="3" width="8" height="10" rx="2"/><rect class="p2" x="13" y="3" width="8" height="6" rx="2"/>' +
    '<rect class="p4" x="13" y="11" width="8" height="10" rx="2"/><rect class="p3" x="3" y="15" width="8" height="6" rx="2"/>',
  profil: '<circle class="p1" cx="12" cy="8" r="4.5"/><path class="p4" d="M3.5 21a8.5 8.5 0 0 1 17 0z"/>',
};

const TRAIT: Record<string, string> = {
  cloche: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  soleil: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  lune: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  langue: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  fermer: '<path d="M18 6 6 18M6 6l12 12"/>',
  valide: '<path d="M20 6 9 17l-5-5"/>',
  succes: '<circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  attention: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  erreur: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  corbeille: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
  crayon: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  recherche: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  filtre: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  sortie: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  'chevron-bas': '<path d="m6 9 6 6 6-6"/>',
  'chevron-fin': '<path d="m9 18 6-6-6-6"/>',
  retour: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  oeil: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'oeil-barre': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  cadenas: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  telephone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  lieu: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  calendrier: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  hausse: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  baisse: '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
  entree: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  sortie2: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  etoile: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  horloge: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  envoyer: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  reglages: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  camion: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
};

const MIROIR = new Set(['chevron-fin', 'retour', 'sortie', 'hausse', 'baisse']);

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class.mono]': "tone() === 'mono'",
    '[class.mirror]': 'mirror()',
    '[innerHTML]': 'svg()',
  },
  template: '',
  styles: `
    :host {
      --ic1: var(--feuille); --ic2: var(--or); --ic3: var(--sauge); --ic4: var(--olive-700); --ic-cut: var(--surface);
      display: inline-flex; width: 24px; height: 24px; flex: none; line-height: 0;
    }
    :host-context(html.dark) { --ic1: #9aab89; --ic3: #6f7f4b; --ic4: #cfd9b1; }
    :host ::ng-deep svg { width: 100%; height: 100%; overflow: visible; }
    :host ::ng-deep .p1 { fill: var(--ic1); }
    :host ::ng-deep .p2 { fill: var(--ic2); }
    :host ::ng-deep .p3 { fill: var(--ic3); }
    :host ::ng-deep .p4 { fill: var(--ic4); }
    :host ::ng-deep .s { stroke: var(--ic4); }
    :host ::ng-deep .hl { stroke: var(--ic-cut); }
    :host ::ng-deep .hole { fill: var(--ic-cut); }
    :host(.mono) ::ng-deep .p1, :host(.mono) ::ng-deep .p2, :host(.mono) ::ng-deep .p3, :host(.mono) ::ng-deep .p4 { fill: currentColor; }
    :host(.mono) ::ng-deep .p1 { opacity: 0.7; }
    :host(.mono) ::ng-deep .p3 { opacity: 0.45; }
    :host(.mono) ::ng-deep .s { stroke: currentColor; }
    :host(.mono) ::ng-deep .hl, :host(.mono) ::ng-deep .hole { opacity: 0; }
  `,
})
export class Icon {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<string>();
  readonly tone = input<'color' | 'mono'>('color');

  readonly mirror = computed(() => MIROIR.has(this.name()));

  readonly svg = computed<SafeHtml>(() => {
    const n = this.name();
    const metier = METIER[n];
    const markup = metier
      ? `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${metier}</svg>`
      : `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${TRAIT[n] ?? TRAIT['info']}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}

export const ICONES_METIER = Object.keys(METIER);
export const ICONES_TRAIT = Object.keys(TRAIT);
