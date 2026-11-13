import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-kpi',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi" [class.featured]="featured()">
      @if (loading()) {
        <span class="skeleton ic"></span>
        <span class="skeleton" style="width: 55%; height: 14px"></span>
        <span class="skeleton" style="width: 70%; height: 34px; margin-top: 6px"></span>
        <span class="skeleton" style="width: 45%; height: 12px"></span>
      } @else {
        <span class="ic"><app-icon [name]="icon()" /></span>
        <span class="label">{{ label() }}</span>
        <span class="value kpi-value">{{ value() }}<small>{{ unit() }}</small></span>
        @if (hint() || trend()) {
          <span class="hint">
            @if (trend()) {
              <span class="trend" [class.down]="trend() === 'down'">
                <app-icon [name]="trend() === 'down' ? 'baisse' : 'hausse'" />{{ trendLabel() }}
              </span>
            }
            {{ hint() }}
          </span>
        }
      }
    </div>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .kpi {
      height: 100%; display: flex; flex-direction: column; gap: 4px; position: relative;
      background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg);
      padding: var(--sp-5) var(--sp-5) var(--sp-4); box-shadow: var(--shadow-1);
    }
    .ic {
      width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center;
      background: var(--icon-bg); margin-bottom: var(--sp-3);
    }
    .ic app-icon { width: 26px; height: 26px; }
    .label { color: var(--text-muted); font-size: var(--fs-sm); font-weight: 600; }
    .value {
      font-size: 2rem; font-weight: 700; line-height: 1.1; color: var(--text-strong);
      letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .value small { font-size: 1rem; font-weight: 600; color: var(--text-muted); margin-inline-start: 6px; letter-spacing: 0; }
    .featured .value { color: var(--accent-text); }
    .hint { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; color: var(--text-muted); font-size: var(--fs-sm); margin-top: 2px; }
    .trend {
      display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: var(--ok-fg);
      background: var(--ok-bg); padding: 1px 8px 1px 6px; border-radius: 999px;
    }
    .trend.down { color: var(--danger-fg); background: var(--danger-bg); }
    .trend app-icon { width: 14px; height: 14px; }
    @media (max-width: 720px) {
      .kpi { padding: var(--sp-4); border-radius: 16px; }
      .ic { width: 36px; height: 36px; border-radius: 11px; margin-bottom: var(--sp-2); }
      .ic app-icon { width: 22px; height: 22px; }
      .value { font-size: 1.5rem; }
      .value small { font-size: 0.875rem; margin-inline-start: 4px; }
    }
  `,
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input('');
  readonly hint = input('');
  readonly icon = input('barres');
  readonly trend = input<'up' | 'down' | null>(null);
  readonly trendLabel = input('');
  readonly featured = input(false);
  readonly loading = input(false);
}
