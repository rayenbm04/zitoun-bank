import {
  ChangeDetectionStrategy, Component, ElementRef, effect, input, model, output, viewChild,
} from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-modal',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dlg [attr.aria-labelledby]="id + '-t'" [class.danger]="tone() === 'danger'"
            (close)="open.set(false)" (click)="clicFond($event)">
      <div class="panel">
        <header>
          @if (tone() === 'danger') { <span class="ic"><app-icon name="attention" /></span> }
          <div class="titres">
            <h2 [id]="id + '-t'">{{ title() }}</h2>
            @if (description()) { <p>{{ description() }}</p> }
          </div>
          <button type="button" class="x" (click)="open.set(false)" aria-label="Fermer la fenêtre">
            <app-icon name="fermer" />
          </button>
        </header>
        <div class="body"><ng-content /></div>
        <footer><ng-content select="[slot=footer]" /></footer>
      </div>
    </dialog>
  `,
  styles: `
    dialog {
      padding: 0; border: none; background: transparent; max-width: min(560px, calc(100vw - 32px)); width: 100%;
      color: var(--text);
    }
    dialog::backdrop { background: rgba(23, 28, 14, 0.55); backdrop-filter: blur(2px); }
    dialog[open] .panel { animation: pop 220ms var(--ease-out); }
    .panel { background: var(--surface); border-radius: var(--r-xl); box-shadow: var(--shadow-3); border: 1px solid var(--border); }
    header { display: flex; gap: 14px; align-items: flex-start; padding: 24px 24px 0; }
    .ic { width: 44px; height: 44px; flex: none; border-radius: 14px; display: grid; place-items: center; background: var(--danger-bg); color: var(--danger-fg); }
    .ic app-icon { width: 22px; height: 22px; }
    .titres { flex: 1; min-width: 0; }
    h2 { font-size: 1.375rem; }
    .titres p { color: var(--text-muted); margin-top: 6px; }
    .x { width: 40px; height: 40px; flex: none; border: none; border-radius: 10px; background: transparent; color: var(--text-muted); display: grid; place-items: center; cursor: pointer; }
    .x:hover { background: var(--surface-2); color: var(--text-strong); }
    .x app-icon { width: 20px; height: 20px; }
    .body { padding: 20px 24px; }
    .body:empty { padding: 8px; }
    footer ::ng-deep > [slot=footer] { display: contents; }
    footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px 24px; flex-wrap: wrap; }
    @keyframes pop { from { opacity: 0; transform: translateY(8px) scale(0.98); } }
    @media (max-width: 720px) {
      footer { flex-direction: column-reverse; }
      footer ::ng-deep .btn { width: 100%; }
    }
  `,
})
export class Modal {
  private static compteur = 0;
  readonly id = `modal-${++Modal.compteur}`;

  readonly open = model(false);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly tone = input<'default' | 'danger'>('default');
  readonly closed = output<void>();

  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const d = this.dlg().nativeElement;
      if (this.open() && !d.open) d.showModal();
      if (!this.open() && d.open) {
        d.close();
        this.closed.emit();
      }
    });
  }

  clicFond(e: MouseEvent): void {
    if (e.target === this.dlg().nativeElement) this.open.set(false);
  }
}
