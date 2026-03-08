import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <div class="h-2 flex-1 rounded-full bg-slate-200">
        <div
          class="h-2 rounded-full transition-all"
          [ngClass]="barClass()"
          [style.width.%]="value()"
        ></div>
      </div>
      @if (showLabel()) {
        <span class="w-9 text-right text-xs font-semibold" [ngClass]="labelClass()">
          {{ value() }}%
        </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  readonly value = input.required<number>();
  readonly showLabel = input(true);

  readonly barClass = computed(() => {
    const v = this.value();
    if (v < 65) return 'bg-red-500';
    if (v < 80) return 'bg-amber-500';
    return 'bg-green-600';
  });

  readonly labelClass = computed(() => {
    const v = this.value();
    if (v < 65) return 'text-red-600';
    if (v < 80) return 'text-amber-600';
    return 'text-green-700';
  });
}
