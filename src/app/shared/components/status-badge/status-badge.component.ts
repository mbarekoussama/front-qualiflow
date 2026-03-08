import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusBadgeVariant =
  | 'Conforme'
  | 'À surveiller'
  | 'Non conforme'
  | 'Active'
  | 'En révision'
  | 'Archivée'
  | 'Approuvé'
  | 'Périmé'
  | 'Brouillon'
  | 'Ouverte'
  | 'En cours'
  | 'Clôturée'
  | 'Rejetée'
  | 'Planifiée'
  | 'Réalisée'
  | 'Efficace'
  | 'Inefficace';

const CLASS_MAP: Record<string, string> = {
  'Conforme': 'border-green-500 text-green-700 bg-white',
  'Active': 'border-green-500 text-green-700 bg-white',
  'Approuvé': 'border-green-500 text-green-700 bg-white',
  'Clôturée': 'border-green-500 text-green-700 bg-white',
  'Efficace': 'border-green-500 text-green-700 bg-white',
  'Réalisée': 'border-green-500 text-green-700 bg-white',

  'À surveiller': 'border-amber-500 text-amber-600 bg-white',
  'En révision': 'border-amber-500 text-amber-600 bg-white',
  'En cours': 'border-amber-500 text-amber-600 bg-white',
  'Planifiée': 'border-amber-500 text-amber-600 bg-white',

  'Non conforme': 'border-red-500 text-red-600 bg-white',
  'Archivée': 'border-slate-400 text-slate-500 bg-white',
  'Périmé': 'border-slate-400 text-slate-500 bg-white',
  'Brouillon': 'border-slate-300 text-slate-400 bg-white',
  'Ouverte': 'border-red-400 text-red-600 bg-white',
  'Rejetée': 'border-slate-400 text-slate-500 bg-white',
  'Inefficace': 'border-red-400 text-red-600 bg-white',
};

const ICON_MAP: Record<string, string> = {
  'Conforme': '●',
  'Active': '●',
  'Approuvé': '●',
  'Clôturée': '●',
  'Efficace': '●',
  'Réalisée': '●',
  'À surveiller': '⚠',
  'En révision': '⚠',
  'En cours': '⚠',
  'Planifiée': '⚠',
  'Non conforme': '✕',
  'Ouverte': '⊙',
  'Rejetée': '✕',
  'Inefficace': '✕',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
      [ngClass]="classes()"
    >
      <span class="text-[9px]">{{ icon() }}</span>
      {{ status() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();

  readonly classes = computed(
    () => CLASS_MAP[this.status()] ?? 'border-slate-300 text-slate-500 bg-white'
  );

  readonly icon = computed(() => ICON_MAP[this.status()] ?? '●');
}
