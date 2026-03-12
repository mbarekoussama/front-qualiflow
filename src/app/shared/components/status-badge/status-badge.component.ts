import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusBadgeVariant =
  | 'Conforme' | 'À surveiller' | 'Non conforme'
  | 'Active' | 'En révision' | 'Archivée'
  | 'Approuvé' | 'Périmé' | 'Brouillon'
  | 'Ouverte' | 'En cours' | 'Clôturée' | 'Rejetée'
  | 'Planifiée' | 'Réalisée' | 'Efficace' | 'Inefficace'
  // Backend NC enum values
  | 'OUVERTE' | 'ANALYSE' | 'ACTION_EN_COURS' | 'CLOTUREE'
  // Backend action enum values
  | 'PLANIFIEE' | 'EN_COURS' | 'REALISEE' | 'VERIFIEE';

// Maps backend enum → display label
const LABEL_MAP: Record<string, string> = {
  'OUVERTE':        'Ouverte',
  'ANALYSE':        'Analyse',
  'ACTION_EN_COURS':'En cours',
  'CLOTUREE':       'Clôturée',
  'PLANIFIEE':      'Planifiée',
  'EN_COURS':       'En cours',
  'REALISEE':       'Réalisée',
  'VERIFIEE':       'Vérifiée',
};

const CLASS_MAP: Record<string, string> = {
  // French (legacy)
  'Conforme':    'border-green-500 text-green-700 bg-white',
  'Active':      'border-green-500 text-green-700 bg-white',
  'Approuvé':    'border-green-500 text-green-700 bg-white',
  'Clôturée':    'border-green-500 text-green-700 bg-white',
  'Efficace':    'border-green-500 text-green-700 bg-white',
  'Réalisée':    'border-green-500 text-green-700 bg-white',
  'Vérifiée':    'border-green-500 text-green-700 bg-white',
  'À surveiller':'border-amber-500 text-amber-600 bg-white',
  'En révision': 'border-amber-500 text-amber-600 bg-white',
  'En cours':    'border-amber-500 text-amber-600 bg-white',
  'Planifiée':   'border-amber-500 text-amber-600 bg-white',
  'Non conforme':'border-red-500 text-red-600 bg-white',
  'Archivée':    'border-slate-400 text-slate-500 bg-white',
  'Périmé':      'border-slate-400 text-slate-500 bg-white',
  'Brouillon':   'border-slate-300 text-slate-400 bg-white',
  'Ouverte':     'border-red-400 text-red-600 bg-white',
  'Rejetée':     'border-slate-400 text-slate-500 bg-white',
  'Inefficace':  'border-red-400 text-red-600 bg-white',
  // Backend enum keys → same styles
  'OUVERTE':        'border-red-400 text-red-600 bg-white',
  'ANALYSE':        'border-amber-500 text-amber-600 bg-white',
  'ACTION_EN_COURS':'border-amber-500 text-amber-600 bg-white',
  'CLOTUREE':       'border-green-500 text-green-700 bg-white',
  'PLANIFIEE':      'border-amber-500 text-amber-600 bg-white',
  'EN_COURS':       'border-amber-500 text-amber-600 bg-white',
  'REALISEE':       'border-green-500 text-green-700 bg-white',
  'VERIFIEE':       'border-green-500 text-green-700 bg-white',
};

const ICON_MAP: Record<string, string> = {
  'Conforme': '●', 'Active': '●', 'Approuvé': '●', 'Clôturée': '●',
  'Efficace': '●', 'Réalisée': '●', 'Vérifiée': '●',
  'À surveiller': '⚠', 'En révision': '⚠', 'En cours': '⚠', 'Planifiée': '⚠',
  'Non conforme': '✕', 'Ouverte': '⊙', 'Rejetée': '✕', 'Inefficace': '✕',
  'OUVERTE': '⊙', 'ANALYSE': '⚠', 'ACTION_EN_COURS': '⚠',
  'CLOTUREE': '●', 'PLANIFIEE': '⚠', 'EN_COURS': '⚠', 'REALISEE': '●', 'VERIFIEE': '●',
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
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();

  readonly label   = computed(() => LABEL_MAP[this.status()] ?? this.status());
  readonly classes = computed(() => CLASS_MAP[this.status()] ?? 'border-slate-300 text-slate-500 bg-white');
  readonly icon    = computed(() => ICON_MAP[this.status()] ?? '●');
}
