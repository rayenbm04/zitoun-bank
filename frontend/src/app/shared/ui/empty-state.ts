import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-empty',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <div class="illu" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="56" class="disc" />
          <path d="M28 86c18-10 36-28 62-56" class="tige" />
          <ellipse cx="46" cy="66" rx="15" ry="5.5" transform="rotate(-55 46 66)" class="f1" />
          <ellipse cx="66" cy="44" rx="15" ry="5.5" transform="rotate(-25 66 44)" class="f2" />
          <ellipse cx="74" cy="56" rx="12" ry="4.6" transform="rotate(-62 74 56)" class="f1" />
          <ellipse cx="57" cy="57" rx="11" ry="4.2" transform="rotate(15 57 57)" class="f2" />
          <ellipse cx="36" cy="84" rx="6.5" ry="8.5" class="o1" />
          <ellipse cx="52" cy="78" rx="5.5" ry="7.5" class="o2" />
        </svg>
        <span class="pastille"><app-icon [name]="icon()" /></span>
      </div>
      <h3>{{ title() }}</h3>
      @if (text()) { <p>{{ text() }}</p> }
      <div class="cta"><ng-content /></div>
    </div>
  `,
  styles: `
    .empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 40px 16px; }
    .illu { position: relative; width: 120px; height: 120px; margin-bottom: 8px; }
    .disc { fill: var(--sauge-clair); }
    html.dark .disc { fill: #2a3320; }
    .tige { fill: none; stroke: var(--olive-700); stroke-width: 2.4; stroke-linecap: round; }
    html.dark .tige { stroke: #9aab89; }
    .f1 { fill: var(--feuille); } .f2 { fill: var(--sauge); }
    .o1 { fill: var(--or); } .o2 { fill: var(--olive-700); }
    html.dark .o2 { fill: #cfd9b1; }
    .pastille {
      position: absolute; inset-block-end: 2px; inset-inline-end: 2px; width: 40px; height: 40px; border-radius: 50%;
      background: var(--surface); border: 1px solid var(--border); display: grid; place-items: center; box-shadow: var(--shadow-1);
    }
    .pastille app-icon { width: 22px; height: 22px; }
    h3 { font-size: 1.125rem; }
    p { color: var(--text-muted); max-width: 42ch; }
    .cta { margin-top: 12px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .cta:empty { display: none; }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly text = input('');
  readonly icon = input('olive');
}
