import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.inverse]': 'inverse()', '[class.compact]': 'compact()' },
  template: `
    <svg viewBox="0 0 40 40" aria-hidden="true" class="mark">
      <path d="M7 33C14 26 22 17 33 7" class="tige" />
      <ellipse cx="16" cy="22" rx="9" ry="3.6" transform="rotate(-52 16 22)" class="f1" />
      <ellipse cx="26" cy="12" rx="8" ry="3.2" transform="rotate(-18 26 12)" class="f2" />
      <ellipse cx="11" cy="30.5" rx="4.6" ry="5.8" class="olive" />
    </svg>
    @if (!compact()) { <span class="nom">Zitoun Bank</span> }
  `,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 10px; color: var(--olive-900); }
    :host-context(html.dark) { color: #f6f1e4; }
    :host(.inverse) { color: #f6f1e4; }
    .mark { width: 36px; height: 36px; flex: none; }
    .tige { fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
    .f1 { fill: var(--feuille); }
    .f2 { fill: var(--sauge); }
    .olive { fill: var(--or); }
    .nom { font-family: var(--font-display); font-weight: 700; font-size: 1.375rem; letter-spacing: -0.01em; white-space: nowrap; }
  `,
})
export class Logo {
  readonly inverse = input(false);
  readonly compact = input(false);
}

function prng(graine: number) {
  return () => {
    graine = (graine + 0x6d2b79f5) | 0;
    let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Feuille { x: number; y: number; rx: number; ry: number; a: number; c: string; }
interface Olive { x: number; y: number; r: number; c: string; }

@Component({
  selector: 'app-olive-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 480 440" role="img" aria-label="Illustration d’un olivier chargé d’olives">
      <ellipse cx="240" cy="414" rx="168" ry="14" class="ombre" />
      <path d="M150 416c30-8 60-10 90-10s62 3 92 10" class="sol" />
      <path class="tronc" d="M192 416c12-22 20-44 16-70-4-26-18-44-12-70 6-24 22-34 28-54h22c4 22 16 36 22 58 6 26-2 48 4 72 6 24 18 44 26 64z" />
      <g class="bois">
        <path d="M222 262c-24-20-44-36-64-72" stroke-width="15" />
        <path d="M262 262c24-18 46-30 74-66" stroke-width="14" />
        <path d="M232 214c2-34 6-62 18-92" stroke-width="12" />
        <path d="M168 210c-18-6-34-6-52-18" stroke-width="7" />
        <path d="M318 210c18-2 32 2 50-6" stroke-width="7" />
      </g>
      <g class="ecorce">
        <path d="M214 404c8-24 8-48 2-72" /><path d="M262 400c-4-22-2-42 4-62" />
        <path d="M208 300c-4-16-2-30 6-44" /><path d="M240 384c4-20 2-40-4-58 6-18 4-34-2-50" /><path d="M252 276c-2-14 0-26 4-38" />
      </g>
      <g class="feuillage">
        @for (f of feuilles; track $index) {
          <ellipse [attr.cx]="f.x" [attr.cy]="f.y" [attr.rx]="f.rx" [attr.ry]="f.ry"
                   [attr.transform]="'rotate(' + f.a + ' ' + f.x + ' ' + f.y + ')'" [attr.fill]="f.c" />
        }
      </g>
      <g>
        @for (o of olives; track $index) {
          <ellipse [attr.cx]="o.x" [attr.cy]="o.y" [attr.rx]="o.r * 0.8" [attr.ry]="o.r" [attr.fill]="o.c" />
        }
      </g>
    </svg>
  `,
  styles: `
    svg { width: 100%; height: auto; overflow: visible; }
    .ombre { fill: rgba(0, 0, 0, 0.22); }
    .sol { fill: none; stroke: #7c8b4f; stroke-width: 3; stroke-linecap: round; opacity: 0.6; }
    .tronc { fill: #8b7d5a; }
    .bois path { fill: none; stroke: #8b7d5a; stroke-linecap: round; stroke-linejoin: round; }
    .ecorce path { fill: none; stroke: #5f5338; stroke-width: 3; stroke-linecap: round; opacity: 0.7; }
  `,
})
export class OliveTree {
  readonly feuilles: Feuille[] = [];
  readonly olives: Olive[] = [];

  constructor() {
    const r = prng(11);
    const masses = [
      [150, 168, 92, 62], [250, 112, 104, 70], [346, 166, 88, 60],
      [200, 214, 78, 44], [300, 220, 76, 42], [112, 206, 50, 34], [384, 206, 46, 30],
    ];
    const teintes = ['#9aab89', '#9aab89', '#7c8b4f', '#7c8b4f', '#c5d1ae', '#b5c49c', '#5f6e35'];
    for (const [cx, cy, rx, ry] of masses) {
      const n = Math.round((rx * ry) / 95);
      for (let i = 0; i < n; i++) {
        const t = r() * Math.PI * 2;
        const d = Math.sqrt(r());
        const x = cx + Math.cos(t) * rx * d;
        const y = cy + Math.sin(t) * ry * d;
        const a = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + (r() * 50 - 25);
        this.feuilles.push({ x, y, rx: 11 + r() * 8, ry: 3.6 + r() * 1.8, a, c: teintes[Math.floor(r() * teintes.length)] });
      }
    }
    for (let i = 0; i < 26; i++) {
      const [cx, cy, rx, ry] = masses[Math.floor(r() * masses.length)];
      const t = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 0.85;
      this.olives.push({
        x: cx + Math.cos(t) * rx * d,
        y: cy + Math.sin(t) * ry * d,
        r: 5 + r() * 2.5,
        c: r() > 0.45 ? '#c9a227' : '#1f270f',
      });
    }
  }
}

@Component({
  selector: 'app-branche',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 400 400">
      <path d="M30 380C120 300 220 190 380 30" class="tige" />
      @for (f of feuilles; track $index) {
        <ellipse [attr.cx]="f[0]" [attr.cy]="f[1]" rx="46" ry="14" [attr.transform]="'rotate(' + f[2] + ' ' + f[0] + ' ' + f[1] + ')'" [class]="f[3]" />
      }
      <ellipse cx="86" cy="338" rx="17" ry="22" class="o1" />
      <ellipse cx="128" cy="318" rx="15" ry="20" class="o2" />
      <ellipse cx="236" cy="208" rx="14" ry="19" class="o1" />
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; }
    .tige { fill: none; stroke: var(--sauge); stroke-width: 5; stroke-linecap: round; }
    .a { fill: var(--sauge-clair); } .b { fill: color-mix(in srgb, var(--sauge) 45%, var(--bg)); }
    .o1 { fill: color-mix(in srgb, var(--or) 55%, var(--bg)); } .o2 { fill: color-mix(in srgb, var(--feuille) 50%, var(--bg)); }
  `,
})
export class Branche {
  readonly feuilles: [number, number, number, string][] = [
    [110, 290, -70, 'a'], [150, 300, 25, 'b'], [170, 236, -75, 'b'], [210, 250, 30, 'a'],
    [232, 172, -70, 'a'], [270, 190, 28, 'b'], [292, 112, -68, 'b'], [330, 128, 24, 'a'], [352, 64, -40, 'a'],
  ];
}
