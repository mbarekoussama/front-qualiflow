import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Processus, ProcessusType, StatutProcessus } from '../../../shared/models/processus.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';

@Component({
  selector: 'app-processus-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './processus-list.component.html',
  styleUrl: './processus-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessusListComponent {
  private readonly utilisateurs: Utilisateur[] = [
    {
      id: 'u-01',
      nom: 'Mansouri',
      prenom: 'Amira',
      initiales: 'AM',
      email: 'a.mansouri@qualiflow.app',
      role: 'Responsable Qualité',
      couleur: '#1a5c38'
    },
    {
      id: 'u-02',
      nom: 'Mrad',
      prenom: 'Kais',
      initiales: 'KM',
      email: 'k.mrad@qualiflow.app',
      role: 'Pilote',
      couleur: '#2d7a4f'
    },
    {
      id: 'u-03',
      nom: 'Haddad',
      prenom: 'Rami',
      initiales: 'RH',
      email: 'r.haddad@qualiflow.app',
      role: 'Pilote',
      couleur: '#475569'
    }
  ];

  readonly processus = signal<Processus[]>([
    {
      id: 'P-01',
      code: 'P-01',
      intitule: 'Pilotage stratégique',
      type: 'Pilotage',
      objectif: 'Aligner la vision et les objectifs qualité',
      perimetre: 'Gouvernance',
      pilote: this.utilisateurs[0],
      clauseISO: '5.1',
      frequenceRevue: 'Trimestrielle',
      prochaineRevue: new Date('2026-04-15'),
      tauxConformite: 92,
      statut: 'Conforme',
      indicateurs: ['IND-01', 'IND-02'],
      procedures: ['PRO-001', 'PRO-002'],
      documents: ['MQ-001', 'PR-001'],
      dateCreation: new Date('2024-10-05'),
      actif: true
    },
    {
      id: 'P-02',
      code: 'P-02',
      intitule: 'Gestion documentaire',
      type: 'Support',
      objectif: 'Maîtriser les documents du SMS',
      perimetre: 'Qualité',
      pilote: this.utilisateurs[1],
      clauseISO: '7.5',
      frequenceRevue: 'Semestrielle',
      prochaineRevue: new Date('2026-06-02'),
      tauxConformite: 78,
      statut: 'À surveiller',
      indicateurs: ['IND-03'],
      procedures: ['PRO-004'],
      documents: ['DOC-010', 'DOC-011', 'DOC-012'],
      dateCreation: new Date('2025-01-11'),
      actif: true
    },
    {
      id: 'P-03',
      code: 'P-03',
      intitule: 'Satisfaction apprenants',
      type: 'Mesure',
      objectif: 'Mesurer la satisfaction des bénéficiaires',
      perimetre: 'Pédagogie',
      pilote: this.utilisateurs[2],
      clauseISO: '9.1',
      frequenceRevue: 'Mensuelle',
      prochaineRevue: new Date('2026-03-25'),
      tauxConformite: 66,
      statut: 'À surveiller',
      indicateurs: ['IND-05'],
      procedures: ['PRO-006'],
      documents: ['ENR-022'],
      dateCreation: new Date('2025-05-02'),
      actif: true
    },
    {
      id: 'P-04',
      code: 'P-04',
      intitule: 'Audit interne',
      type: 'Mesure',
      objectif: 'Évaluer la conformité du SMS',
      perimetre: 'Contrôle',
      pilote: this.utilisateurs[0],
      clauseISO: '9.2',
      frequenceRevue: 'Annuelle',
      prochaineRevue: new Date('2026-11-08'),
      tauxConformite: 84,
      statut: 'Conforme',
      indicateurs: ['IND-06'],
      procedures: ['PRO-007'],
      documents: ['ENR-030', 'ENR-031'],
      dateCreation: new Date('2024-09-18'),
      actif: true
    },
    {
      id: 'P-05',
      code: 'P-05',
      intitule: 'Traitement des non-conformités',
      type: 'Opérationnel',
      objectif: 'Gérer les écarts et actions correctives',
      perimetre: 'Qualité',
      pilote: this.utilisateurs[2],
      clauseISO: '10.2',
      frequenceRevue: 'Trimestrielle',
      prochaineRevue: new Date('2026-05-12'),
      tauxConformite: 58,
      statut: 'Non conforme',
      indicateurs: ['IND-04'],
      procedures: ['PRO-009', 'PRO-010'],
      documents: ['NC-REG'],
      dateCreation: new Date('2025-09-09'),
      actif: true
    }
  ]);

  readonly typeFilter = signal<ProcessusType | 'Tous'>('Tous');
  readonly statusFilter = signal<StatutProcessus | 'Tous'>('Tous');
  readonly visibleCount = signal(0);

  readonly filteredProcessus = computed(() => {
    return this.processus().filter((item) => {
      const typeOk = this.typeFilter() === 'Tous' || item.type === this.typeFilter();
      const statusOk = this.statusFilter() === 'Tous' || item.statut === this.statusFilter();
      return typeOk && statusOk;
    });
  });

  private readonly _syncVisibleCount = effect(() => {
    this.visibleCount.set(this.filteredProcessus().length);
  });

  progressColor(value: number): string {
    if (value < 65) {
      return 'bg-red-500';
    }
    if (value < 80) {
      return 'bg-amber-500';
    }
    return 'bg-green-600';
  }

  statusClass(status: StatutProcessus): string {
    if (status === 'Conforme') {
      return 'border-green-600 text-green-700';
    }
    if (status === 'À surveiller') {
      return 'border-amber-500 text-amber-600';
    }
    return 'border-red-600 text-red-600';
  }

  updateTypeFilter(value: string): void {
    this.typeFilter.set(value as ProcessusType | 'Tous');
  }

  updateStatusFilter(value: string): void {
    this.statusFilter.set(value as StatutProcessus | 'Tous');
  }
}
