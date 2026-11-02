import { Component, computed, input } from '@angular/core';
import { PointPrix } from '../core/models';

/** Petit graphique en courbe (SVG), sans bibliothèque externe */
@Component({
  selector: 'app-line-chart',
  template: `
    <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" [attr.aria-label]="label()">
      @for (g of grille(); track g.y) {
        <line [attr.x1]="P" [attr.x2]="W - P" [attr.y1]="g.y" [attr.y2]="g.y" class="grid-line" />
        <text [attr.x]="P - 8" [attr.y]="g.y + 4" text-anchor="end" class="axis">{{ g.v }}</text>
      }
      <polyline [attr.points]="ligne()" class="courbe" />
      @for (p of points(); track p.x) {
        <circle [attr.cx]="p.x" [attr.cy]="p.y" r="6" class="point" />
        <text [attr.x]="p.x" [attr.y]="H - 6" text-anchor="middle" class="axis">{{ p.mois }}</text>
        <text [attr.x]="p.x" [attr.y]="p.y - 10" text-anchor="middle" class="val">{{ p.prix }}</text>
      }
    </svg>
  `,
  styles: `
    svg { width: 100%; height: auto; display: block; }
    .grid-line { stroke: var(--bordure); stroke-width: 1; }
    .axis { fill: var(--texte-doux); font-size: 18px; }
    .val { fill: var(--texte); font-size: 18px; font-weight: 700; }
    .courbe { fill: none; stroke: var(--or); stroke-width: 4; stroke-linejoin: round; }
    .point { fill: var(--olive-700); }
  `,
})
export class LineChart {
  readonly data = input.required<PointPrix[]>();
  readonly label = input('Graphique');

  readonly W = 900;
  readonly H = 240;
  readonly P = 56;

  private readonly bornes = computed(() => {
    const v = this.data().map(d => d.prix);
    const min = Math.floor(Math.min(...v) - 1);
    const max = Math.ceil(Math.max(...v) + 1);
    return { min, max };
  });

  private y(v: number): number {
    const { min, max } = this.bornes();
    return this.P / 2 + (1 - (v - min) / (max - min)) * (this.H - this.P * 1.5);
  }

  readonly points = computed(() => {
    const d = this.data();
    const pas = d.length > 1 ? (this.W - this.P * 2) / (d.length - 1) : 0;
    return d.map((p, i) => ({ ...p, x: this.P + i * pas, y: this.y(p.prix) }));
  });

  readonly ligne = computed(() => this.points().map(p => `${p.x},${p.y}`).join(' '));

  readonly grille = computed(() => {
    const { min, max } = this.bornes();
    const pas = Math.max(1, Math.round((max - min) / 4));
    const res: { v: number; y: number }[] = [];
    for (let v = min; v <= max; v += pas) res.push({ v, y: this.y(v) });
    return res;
  });
}
