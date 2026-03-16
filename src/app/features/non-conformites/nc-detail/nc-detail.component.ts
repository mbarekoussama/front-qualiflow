import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  GRAVITE_LABEL,
  SOURCE_NC_LABEL,
  STATUT_ACTION_LABEL,
  METHODE_LABEL,
  StatutAction,
} from '../../../shared/models/non-conformite.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { NonConformiteService } from '../../../core/services/non-conformite.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-nc-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, StatusBadgeComponent, ProgressBarComponent],
  templateUrl: './nc-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NcDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc   = inject(NonConformiteService);
  private readonly auth  = inject(AuthService);
  private readonly fb    = inject(FormBuilder);

  readonly loading = this.svc.loading;
  readonly error   = this.svc.error;
  readonly nc      = computed(() => this.svc.selected());
  readonly responsables = this.svc.utilisateurs;
  readonly actionLoading = signal(false);

  readonly GRAVITE_LABEL       = GRAVITE_LABEL;
  readonly SOURCE_NC_LABEL     = SOURCE_NC_LABEL;
  readonly STATUT_ACTION_LABEL = STATUT_ACTION_LABEL;
  readonly METHODE_LABEL       = METHODE_LABEL;

  readonly activeTab = signal<'details' | 'actions' | 'analyses' | 'historique'>('details');

  readonly actionForm = this.fb.nonNullable.group({
    type: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
    responsableId: ['', [Validators.required]],
    dateEcheance: ['', [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    const organisationId = this.auth.organisationId() ?? '';
    if (organisationId) {
      await this.svc.chargerUtilisateurs(organisationId);
      if (this.responsables().length > 0) {
        this.actionForm.controls.responsableId.setValue(this.responsables()[0].id);
      }
    }
    if (id) await this.svc.chargerDetail(id);
  }

  setTab(tab: 'details' | 'actions' | 'analyses' | 'historique'): void {
    this.activeTab.set(tab);
  }

  nextActionStatut(statut: StatutAction): StatutAction | null {
    if (statut === 'PLANIFIEE') return 'EN_COURS';
    if (statut === 'EN_COURS') return 'REALISEE';
    if (statut === 'REALISEE') return 'VERIFIEE';
    return null;
  }

  async ajouterAction(): Promise<void> {
    const currentNc = this.nc();
    if (!currentNc) return;
    if (this.actionForm.invalid) {
      this.actionForm.markAllAsTouched();
      return;
    }

    this.actionLoading.set(true);
    const value = this.actionForm.getRawValue();
    const actionId = await this.svc.ajouterAction({
      ncId: currentNc.id,
      type: value.type,
      description: value.description,
      responsableId: value.responsableId,
      dateEcheance: value.dateEcheance,
    });

    if (actionId) {
      this.actionForm.reset({
        type: '',
        description: '',
        responsableId: this.responsables()[0]?.id ?? '',
        dateEcheance: '',
      });
      await this.svc.chargerDetail(currentNc.id);
    }
    this.actionLoading.set(false);
  }

  async avancerAction(actionId: string, statutActuel: StatutAction): Promise<void> {
    const next = this.nextActionStatut(statutActuel);
    const currentNc = this.nc();
    if (!next || !currentNc) return;

    this.actionLoading.set(true);
    const ok = await this.svc.mettreAJourStatutAction({
      actionId,
      nouveauStatut: next,
    });

    if (ok) {
      await this.svc.chargerDetail(currentNc.id);
    }
    this.actionLoading.set(false);
  }
}
