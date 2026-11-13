import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-field',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'field', '[class.invalid]': '!!error()' },
  template: `
    <label [attr.for]="for()">{{ label() }}@if (optional()) {<span class="opt"> (facultatif)</span>}</label>
    <ng-content />
    @if (error()) {
      <span class="error" [id]="for() + '-msg'"><app-icon name="erreur" />{{ error() }}</span>
    } @else if (hint()) {
      <span class="hint" [id]="for() + '-msg'">{{ hint() }}</span>
    }
  `,
  styles: `.opt { font-weight: 400; color: var(--text-muted); }`,
})
export class Field {
  readonly label = input.required<string>();
  readonly for = input.required<string>();
  readonly hint = input('');
  readonly error = input<string | null>(null);
  readonly optional = input(false);
}
