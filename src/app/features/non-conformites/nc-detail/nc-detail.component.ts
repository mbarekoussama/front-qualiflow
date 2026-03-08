import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';

import { NonConformite } from '../../../shared/models/non-conformite.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-nc-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, ProgressBarComponent],
  templateUrl: './nc-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NcDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly ncId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  private readonly utilisateurs: Utilisateur[] = [
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira', initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-03', nom: 'Ben Ali', prenom: 'Sana', initiales: 'SB', email: 's.benali@qualiflow.app', role: 'Auditeur', couleur: '#0f766e' }
  ];

  readonly nc = signal<NonConformite>({
    id: this.ncId(),
    description: 'Retard de mise à jour du manuel qualité',
    processus: 'P-02',
    detectePar: this.utilisateurs[1],
    responsable: this.utilisateurs[0],
    dateDetection: new Date('2026-02-12'),
    priorite: 'Élevée',
    source: 'Audit interne',
    causeRacine: "Charge de travail trop importante sur la période de révision documentaire, absence de rappel automatisé",
    statut: 'Ouverte',
    avancement: 25,
    actionsCorrectives: ['AC-11'],
    preuves: [],
    dateEcheance: new Date('2026-03-30')
  });

  readonly activeTab = signal<'details' | 'actions' | 'preuves' | 'historique'>('details');

  setTab(tab: 'details' | 'actions' | 'preuves' | 'historique'): void {
    this.activeTab.set(tab);
  }
}
