import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

import { StatutAction, STATUT_ACTION_LABELS } from '../../../shared/models/action-corrective.model.js';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component.js';
import { ActionCorrectiveService } from '../../../core/services/action-corrective.service.js';

@Component({
  selector: 'app-ac-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './ac-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcDetailComponent implements OnInit {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc    = inject(ActionCorrectiveService);

  readonly loading = this.svc.loading;
  readonly error   = this.svc.error;
  readonly ac      = computed(() => this.svc.selected());

  readonly STATUT_LABELS = STATUT_ACTION_LABELS;
  readonly statutLoading = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) await this.svc.chargerDetail(id);
  }

  nextStatut(current: StatutAction): StatutAction | null {
    if (current === 'PLANIFIEE') return 'EN_COURS';
    if (current === 'EN_COURS')  return 'REALISEE';
    if (current === 'REALISEE')  return 'VERIFIEE';
    return null;
  }

  async changerStatut(nouveauStatut: StatutAction): Promise<void> {
    const a = this.ac();
    if (!a) return;
    this.statutLoading.set(true);
    try {
      await this.svc.changerStatut(a.id, nouveauStatut);
      await this.svc.chargerDetail(a.id);
    } finally {
      this.statutLoading.set(false);
    }
  }

  async supprimer(): Promise<void> {
    const a = this.ac();
    if (!a) return;
    if (!confirm(`Supprimer l'action corrective ? Cette action est irréversible.`)) return;
    await this.svc.supprimer(a.id);
    this.router.navigate(['/actions-correctives']);
  }
}
