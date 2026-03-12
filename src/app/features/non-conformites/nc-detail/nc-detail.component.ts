import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

import {
  GRAVITE_LABEL,
  SOURCE_NC_LABEL,
  STATUT_ACTION_LABEL,
  METHODE_LABEL,
} from '../../../shared/models/non-conformite.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { NonConformiteService } from '../../../core/services/non-conformite.service';

@Component({
  selector: 'app-nc-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, ProgressBarComponent],
  templateUrl: './nc-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NcDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc   = inject(NonConformiteService);

  readonly loading = this.svc.loading;
  readonly error   = this.svc.error;
  readonly nc      = computed(() => this.svc.selected());

  readonly GRAVITE_LABEL       = GRAVITE_LABEL;
  readonly SOURCE_NC_LABEL     = SOURCE_NC_LABEL;
  readonly STATUT_ACTION_LABEL = STATUT_ACTION_LABEL;
  readonly METHODE_LABEL       = METHODE_LABEL;

  readonly activeTab = signal<'details' | 'actions' | 'analyses' | 'historique'>('details');

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) await this.svc.chargerDetail(id);
  }

  setTab(tab: 'details' | 'actions' | 'analyses' | 'historique'): void {
    this.activeTab.set(tab);
  }
}
