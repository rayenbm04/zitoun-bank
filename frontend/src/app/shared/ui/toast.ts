import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Icon } from './icon';

export interface Toast {
  id: number;
  ton: 'ok' | 'danger' | 'info';
  titre: string;
  texte?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  afficher(titre: string, texte?: string, ton: Toast['ton'] = 'ok'): void {
    const id = this.nextId++;
    this.toasts.update(l => [...l, { id, ton, titre, texte }]);
    setTimeout(() => this.fermer(id), 5000);
  }

  fermer(id: number): void {
    this.toasts.update(l => l.filter(t => t.id !== id));
  }
}

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="zone" role="status" aria-live="polite">
      @for (t of service.toasts(); track t.id) {
        <div class="toast" [class]="'toast t-' + t.ton">
          <app-icon [name]="t.ton === 'ok' ? 'succes' : t.ton === 'danger' ? 'erreur' : 'info'" />
          <div class="txt">
            <strong>{{ t.titre }}</strong>
            @if (t.texte) { <span>{{ t.texte }}</span> }
          </div>
          <button type="button" class="x" (click)="service.fermer(t.id)" aria-label="Fermer le message">
            <app-icon name="fermer" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .zone {
      position: fixed; z-index: 90; inset-block-end: 24px; inset-inline-end: 24px;
      display: flex; flex-direction: column; gap: 10px; width: min(380px, calc(100vw - 32px));
    }
    .toast {
      display: flex; gap: 12px; align-items: flex-start; padding: 14px 12px 14px 16px;
      background: var(--olive-900); color: #f6f1e4; border-radius: 14px; box-shadow: var(--shadow-3);
      animation: entree 260ms var(--ease-out);
    }
    html.dark .toast { background: #f6f1e4; color: #2f3a17; }
    .toast > app-icon { width: 22px; height: 22px; color: var(--or-clair); margin-top: 1px; }
    html.dark .toast > app-icon { color: #3f4a1e; }
    .t-danger > app-icon { color: #f2b8b1; }
    html.dark .t-danger > app-icon { color: #b3261e; }
    .txt { flex: 1; display: flex; flex-direction: column; gap: 2px; font-size: 0.9375rem; }
    .txt span { opacity: 0.85; font-size: 0.875rem; }
    .x {
      width: 32px; height: 32px; border: none; background: transparent; color: inherit; border-radius: 8px;
      display: grid; place-items: center; cursor: pointer; opacity: 0.8;
    }
    .x:hover { opacity: 1; background: rgba(255, 255, 255, 0.1); }
    .x app-icon { width: 18px; height: 18px; }
    @keyframes entree { from { opacity: 0; transform: translateY(12px); } }
    @media (max-width: 720px) { .zone { inset-block-end: 88px; inset-inline-end: 16px; } }
  `,
})
export class Toasts {
  readonly service = inject(ToastService);
}
