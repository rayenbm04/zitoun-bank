import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from './icon';

const ICONES = { info: 'info', ok: 'succes', warn: 'attention', danger: 'erreur' } as const;

@Component({
  selector: 'app-alert',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.role]': "tone() === 'danger' ? 'alert' : null" },
  template: `
    <div [class]="'alert alert-' + tone()" [class.stacked]="stacked()">
      <app-icon [name]="icone()" />
      <div class="alert-body">
        @if (title()) { <strong>{{ title() }}</strong> }
        <ng-content />
      </div>
      <div class="alert-action"><ng-content select="[slot=action]" /></div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .alert-action:empty { display: none; }
    .stacked { flex-wrap: wrap; row-gap: 4px; }
    .stacked .alert-action { flex-basis: 100%; margin-inline-start: 32px; }
  `,
})
export class Alert {
  readonly tone = input<'info' | 'ok' | 'warn' | 'danger'>('info');
  readonly title = input('');
  readonly icon = input<string | null>(null);
  readonly stacked = input(false);
  readonly icone = computed(() => this.icon() ?? ICONES[this.tone()]);
}
