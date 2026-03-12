import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  signal
} from '@angular/core';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-2">
      @if (label()) {
        <label class="block text-xs font-medium text-slate-600">{{ label() }}</label>
      }

      <!-- Chips -->
      <div class="flex flex-wrap gap-1.5">
        @for (tag of value(); track tag; let i = $index) {
          <span class="inline-flex items-center gap-1 rounded-md bg-[#1B5E20]/10 px-2.5 py-0.5 text-xs text-[#1B5E20] font-medium">
            {{ tag }}
            <button
              type="button"
              class="ml-0.5 text-[#1B5E20]/60 hover:text-[#1B5E20] leading-none"
              (click)="removeTag(i)"
              [attr.aria-label]="'Supprimer ' + tag"
            >×</button>
          </span>
        }
      </div>

      <!-- Input -->
      <div class="flex gap-2">
        <input
          type="text"
          class="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
          [placeholder]="placeholder()"
          [value]="inputValue()"
          (input)="inputValue.set($any($event.target).value)"
          (keydown.enter)="addTag($event)"
        />
        <button
          type="button"
          class="rounded-md bg-[#1B5E20]/10 px-3 py-1.5 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/20 transition-colors"
          (click)="addFromButton()"
        >+</button>
      </div>
    </div>
  `
})
export class TagInputComponent {
  readonly label       = input<string>('');
  readonly placeholder = input<string>('Ajouter…');
  readonly value       = model<string[]>([]);

  readonly inputValue = signal('');

  addTag(event: Event) {
    event.preventDefault();
    this._commit();
  }

  addFromButton() { this._commit(); }

  private _commit() {
    const v = this.inputValue().trim();
    if (!v) return;
    if (!this.value().includes(v)) {
      this.value.set([...this.value(), v]);
    }
    this.inputValue.set('');
  }

  removeTag(index: number) {
    const arr = [...this.value()];
    arr.splice(index, 1);
    this.value.set(arr);
  }
}
