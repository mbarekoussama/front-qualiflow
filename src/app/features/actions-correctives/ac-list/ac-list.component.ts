import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { StatutAction, STATUT_ACTION_LABELS } from '../../../shared/models/action-corrective.model.js';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component.js';
import { ActionCorrectiveService } from '../../../core/services/action-corrective.service.js';
import { AuthService } from '../../../core/auth/auth.service.js';

@Component({
  selector: 'app-ac-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './ac-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcListComponent implements OnInit {
  private readonly svc  = inject(ActionCorrectiveService);
  private readonly auth = inject(AuthService);

  readonly loading = this.svc.loading;
  readonly error   = this.svc.error;

  readonly statutFilter = signal<StatutAction | 'Tous'>('Tous');
  readonly ncFilter     = signal('Tous');

  readonly filteredActions = computed(() =>
    this.svc.items().filter((ac: { statut: string; ncReference: string; }) => {
      const statOk = this.statutFilter() === 'Tous' || ac.statut === this.statutFilter();
      const ncOk   = this.ncFilter()     === 'Tous' || ac.ncReference === this.ncFilter();
      return statOk && ncOk;
    })
  );

  readonly ncOptions = computed(() => [
    'Tous', ...new Set(this.svc.items().map((a: { ncReference: any; }) => a.ncReference))
  ]);

  readonly countPlanifiees = this.svc.countPlanifiees;
  readonly countEnCours    = this.svc.countEnCours;
  readonly countRealisees  = this.svc.countRealisees;

  readonly STATUT_LABELS = STATUT_ACTION_LABELS;

  ngOnInit(): void {
    const orgId = this.auth.organisationId();
    if (orgId) this.svc.chargerListe(orgId);
  }

  updateStatutFilter(v: string): void { this.statutFilter.set(v as StatutAction | 'Tous'); }
  updateNcFilter(v: string): void     { this.ncFilter.set(v); }
}
