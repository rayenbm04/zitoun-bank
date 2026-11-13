import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal,
} from '@angular/core';

function largeurSuivie(defaut: number) {
  const el = inject(ElementRef<HTMLElement>);
  const largeur = signal(defaut);
  let ro: ResizeObserver | undefined;
  afterNextRender(() => {
    ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      if (w > 0) largeur.set(w);
    });
    ro.observe(el.nativeElement);
  });
  inject(DestroyRef).onDestroy(() => ro?.disconnect());
  return largeur;
}

export interface Serie {
  nom: string;
  valeurs: number[];
  couleur: 'or' | 'olive' | 'sauge';
}

function graduations(min: number, max: number, n = 4): number[] {
  const brut = (max - min) / n || 1;
  const pas = [0.5, 1, 2, 2.5, 5, 10, 20, 50, 100, 250, 500, 1000, 2000, 5000].find(p => p >= brut) ?? brut;
  const debut = Math.floor(min / pas) * pas;
  const res: number[] = [];
  for (let v = debut; v <= max + pas * 0.001; v += pas) res.push(+v.toFixed(2));
  if (res[res.length - 1] < max) res.push(+(res[res.length - 1] + pas).toFixed(2));
  return res;
}

const fmt = (v: number, d: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

@Component({
  selector: 'app-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure>
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" [attr.aria-label]="label()" dir="ltr"
           (mouseleave)="survol.set(null)">
        <defs>
          <linearGradient [attr.id]="gid" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" class="g0" /><stop offset="100%" class="g1" />
          </linearGradient>
        </defs>
        @for (g of grille(); track g.v) {
          <line [attr.x1]="PG" [attr.x2]="W - PD" [attr.y1]="g.y" [attr.y2]="g.y" class="grid" />
          <text [attr.x]="PG - 10" [attr.y]="g.y + 4" text-anchor="end" class="axe">{{ g.txt }}</text>
        }
        @for (l of etiquettes(); track $index) {
          <text [attr.x]="x($index)" [attr.y]="H - 8" text-anchor="middle" class="axe">{{ l }}</text>
        }
        @if (aire(); as a) { <path [attr.d]="a" [attr.fill]="'url(#' + gid + ')'" /> }
        @for (s of traces(); track s.nom) {
          <path [attr.d]="s.d" [class]="'ligne c-' + s.couleur" />
          @for (p of s.points; track $index) {
            <circle [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="$last || survol() === $index ? 6 : 0" [class]="'pt c-' + s.couleur" />
          }
        }
        @if (dernier(); as d) {
          <g class="tag" [attr.transform]="'translate(' + d.x + ',' + (d.y - 30) + ')'">
            <rect x="-34" y="-14" width="68" height="26" rx="13" />
            <text text-anchor="middle" y="4">{{ d.txt }}</text>
          </g>
        }
        @if (survol() !== null) {
          <line [attr.x1]="x(survol()!)" [attr.x2]="x(survol()!)" [attr.y1]="PH" [attr.y2]="H - PB" class="curseur" />
          <g [attr.transform]="'translate(' + bulleX() + ',' + PH + ')'" class="bulle">
            <rect width="150" [attr.height]="22 + traces().length * 20" rx="10" />
            <text x="12" y="18" class="b-titre">{{ etiquettes()[survol()!] }}</text>
            @for (s of traces(); track s.nom) {
              <circle cx="16" [attr.cy]="34 + $index * 20" r="4" [class]="'c-' + s.couleur + ' pt'" />
              <text x="26" [attr.y]="38 + $index * 20">{{ s.nom }} : {{ fmtV(series()[$index].valeurs[survol()!]) }}</text>
            }
          </g>
        }
        @for (l of etiquettes(); track $index) {
          <rect [attr.x]="x($index) - pasX() / 2" [attr.y]="0" [attr.width]="pasX()" [attr.height]="H" fill="transparent"
                (mouseenter)="survol.set($index)" />
        }
      </svg>
      @if (series().length > 1) {
        <figcaption class="legende">
          @for (s of series(); track s.nom) { <span><i [class]="'c-' + s.couleur"></i>{{ s.nom }}</span> }
        </figcaption>
      }
      <table class="sr-only">
        <caption>{{ label() }}</caption>
        <tr><th>Période</th>@for (s of series(); track s.nom) { <th>{{ s.nom }}</th> }</tr>
        @for (l of etiquettes(); track $index; let i = $index) {
          <tr><td>{{ l }}</td>@for (s of series(); track s.nom) { <td>{{ fmtV(s.valeurs[i]) }} {{ unite() }}</td> }</tr>
        }
      </table>
    </figure>
  `,
  styles: `
    :host { display: block; }
    figure { margin: 0; }
    svg { width: 100%; height: auto; overflow: visible; }
    .grid { stroke: var(--border); stroke-dasharray: 3 5; }
    .axe { fill: var(--text-muted); font-size: 12px; font-family: var(--font-body); }
    .g0 { stop-color: var(--or); stop-opacity: 0.28; } .g1 { stop-color: var(--or); stop-opacity: 0; }
    .ligne { fill: none; stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }
    .ligne.c-or { stroke: var(--or); } .ligne.c-olive { stroke: var(--olive-700); } .ligne.c-sauge { stroke: var(--sauge); stroke-dasharray: 6 6; }
    :host-context(html.dark) .ligne.c-olive { stroke: #cfd9b1; }
    .pt { stroke: var(--surface); stroke-width: 3; transition: r 120ms ease; }
    .pt.c-or { fill: var(--or); } .pt.c-olive { fill: var(--olive-700); } .pt.c-sauge { fill: var(--sauge); }
    :host-context(html.dark) .pt.c-olive { fill: #cfd9b1; }
    .tag rect { fill: var(--olive-900); }
    :host-context(html.dark) .tag rect { fill: var(--or); }
    .tag text { fill: #fdfbf5; font-size: 13px; font-weight: 700; font-family: var(--font-body); }
    :host-context(html.dark) .tag text { fill: #2f3a17; }
    .curseur { stroke: var(--sauge); stroke-width: 1.5; }
    .bulle rect { fill: var(--surface); stroke: var(--border-strong); filter: drop-shadow(0 4px 10px rgba(47, 58, 23, 0.15)); }
    .bulle text { fill: var(--text-strong); font-size: 12px; font-family: var(--font-body); }
    .bulle .b-titre { font-weight: 700; }
    .legende { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 8px; font-size: 0.8125rem; color: var(--text-muted); }
    .legende span { display: inline-flex; align-items: center; gap: 6px; }
    .legende i { width: 14px; height: 4px; border-radius: 2px; display: inline-block; }
    .legende i.c-or { background: var(--or); } .legende i.c-olive { background: var(--olive-700); } .legende i.c-sauge { background: var(--sauge); }
    :host-context(html.dark) .legende i.c-olive { background: #cfd9b1; }
  `,
})
export class LineChart {
  private static n = 0;
  readonly gid = `lc-grad-${++LineChart.n}`;

  readonly etiquettes = input.required<string[]>();
  readonly series = input.required<Serie[]>();
  readonly label = input('Graphique');
  readonly unite = input('');
  readonly decimales = input(1);
  readonly hauteur = input(260);

  private readonly largeur = largeurSuivie(720);
  get W() { return this.largeur(); }
  get H() { return this.hauteur(); }
  readonly PG = 44; readonly PD = 24; readonly PH = 28; readonly PB = 34;

  readonly survol = signal<number | null>(null);

  private readonly bornes = computed(() => {
    const v = this.series().flatMap(s => s.valeurs);
    const min = Math.min(...v), max = Math.max(...v);
    const marge = (max - min) * 0.15 || 1;
    const g = graduations(min - marge, max + marge);
    return { min: g[0], max: g[g.length - 1], g };
  });

  readonly pasX = computed(() => {
    const n = this.etiquettes().length;
    return n > 1 ? (this.W - this.PG - this.PD) / (n - 1) : 0;
  });

  x(i: number): number { return this.PG + i * this.pasX(); }
  private y(v: number): number {
    const { min, max } = this.bornes();
    return this.PH + (1 - (v - min) / (max - min || 1)) * (this.H - this.PH - this.PB);
  }

  fmtV(v: number): string { return fmt(v, this.decimales()); }

  readonly grille = computed(() => this.bornes().g.map(v => ({ v, y: this.y(v), txt: fmt(v, v % 1 ? 1 : 0) })));

  readonly traces = computed(() =>
    this.series().map(s => {
      const points = s.valeurs.map((v, i) => ({ x: this.x(i), y: this.y(v) }));
      let d = `M${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] ?? p2;
        const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
      }
      return { nom: s.nom, couleur: s.couleur, points, d };
    })
  );

  readonly aire = computed(() => {
    const t = this.traces()[0];
    if (!t || t.points.length < 2) return null;
    const bas = this.H - this.PB;
    return `${t.d} L${t.points.at(-1)!.x},${bas} L${t.points[0].x},${bas} Z`;
  });

  readonly dernier = computed(() => {
    const t = this.traces()[0];
    const s = this.series()[0];
    if (!t || this.survol() !== null) return null;
    const p = t.points.at(-1)!;
    return { x: Math.min(p.x, this.W - 40), y: p.y, txt: fmt(s.valeurs.at(-1)!, this.decimales()) };
  });

  readonly bulleX = computed(() => {
    const i = this.survol() ?? 0;
    const x = this.x(i) + 12;
    return x + 150 > this.W ? this.x(i) - 162 : x;
  });
}

@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure>
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" [attr.aria-label]="label()" dir="ltr">
        @for (g of grille(); track g.v) {
          <line [attr.x1]="PG" [attr.x2]="W - 8" [attr.y1]="g.y" [attr.y2]="g.y" class="grid" />
          <text [attr.x]="PG - 10" [attr.y]="g.y + 4" text-anchor="end" class="axe">{{ g.txt }}</text>
        }
        @for (b of barres(); track b.label) {
          <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" rx="10" [class.max]="b.max" class="barre">
            <title>{{ b.label }} : {{ b.txt }} {{ unite() }}</title>
          </rect>
          <text [attr.x]="b.x + b.w / 2" [attr.y]="b.y - 10" text-anchor="middle" class="val">{{ b.txt }}</text>
          <text [attr.x]="b.x + b.w / 2" [attr.y]="H - 10" text-anchor="middle" class="axe nom">{{ b.label }}</text>
        }
      </svg>
      <table class="sr-only">
        <caption>{{ label() }}</caption>
        @for (b of barres(); track b.label) { <tr><th>{{ b.label }}</th><td>{{ b.txt }} {{ unite() }}</td></tr> }
      </table>
    </figure>
  `,
  styles: `
    :host { display: block; }
    figure { margin: 0; }
    svg { width: 100%; height: auto; }
    .grid { stroke: var(--border); stroke-dasharray: 3 5; }
    .axe { fill: var(--text-muted); font-size: 12px; font-family: var(--font-body); }
    .nom { font-size: 13px; fill: var(--text-strong); font-weight: 600; }
    .barre { fill: var(--feuille); }
    .barre.max { fill: var(--or); }
    .val { fill: var(--text-strong); font-size: 13px; font-weight: 700; font-family: var(--font-body); }
  `,
})
export class BarChart {
  readonly donnees = input.required<{ label: string; valeur: number }[]>();
  readonly label = input('Histogramme');
  readonly unite = input('');

  private readonly largeur = largeurSuivie(560);
  get W() { return this.largeur(); }
  readonly H = 260; readonly PG = 48; readonly PH = 28; readonly PB = 36;

  private readonly max = computed(() => {
    const m = Math.max(...this.donnees().map(d => d.valeur), 1);
    const g = graduations(0, m * 1.1);
    return { m, g, top: g[g.length - 1] };
  });

  private y(v: number): number {
    return this.PH + (1 - v / this.max().top) * (this.H - this.PH - this.PB);
  }

  readonly grille = computed(() => this.max().g.map(v => ({ v, y: this.y(v), txt: fmt(v, 0) })));

  readonly barres = computed(() => {
    const d = this.donnees();
    const zone = this.W - this.PG - 8;
    const pas = zone / Math.max(d.length, 1);
    const w = Math.min(84, pas * 0.56);
    return d.map((b, i) => ({
      label: b.label,
      txt: fmt(b.valeur, 0),
      x: this.PG + i * pas + (pas - w) / 2,
      w,
      y: this.y(b.valeur),
      h: Math.max(this.H - this.PB - this.y(b.valeur), 2),
      max: b.valeur === this.max().m,
    }));
  });
}
