import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NonConformite } from '../../shared/models/non-conformite.model';
import { Processus } from '../../shared/models/processus.model';
import { Utilisateur } from '../../shared/models/utilisateur.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
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
      nom: 'Ben Ali',
      prenom: 'Sana',
      initiales: 'SB',
      email: 's.benali@qualiflow.app',
      role: 'Auditeur',
      couleur: '#0f766e'
    },
    {
      id: 'u-04',
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
      documents: ['DOC-010', 'DOC-011'],
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
      documents: ['ENR-030'],
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
      pilote: this.utilisateurs[3],
      clauseISO: '10.2',
      frequenceRevue: 'Trimestrielle',
      prochaineRevue: new Date('2026-05-12'),
      tauxConformite: 58,
      statut: 'Non conforme',
      indicateurs: ['IND-04'],
      procedures: ['PRO-009'],
      documents: ['NC-REG'],
      dateCreation: new Date('2025-09-09'),
      actif: true
    }
  ]);

  readonly nonConformites = signal<NonConformite[]>([
    {
      id: 'NC-031',
      description: 'Retard de mise à jour du manuel qualité',
      processus: 'Gestion documentaire',
      detectePar: this.utilisateurs[2],
      responsable: this.utilisateurs[0],
      dateDetection: new Date('2026-02-12'),
      priorite: 'Élevée',
      source: 'Audit interne',
      statut: 'Ouverte',
      avancement: 25,
      actionsCorrectives: ['AC-11'],
      preuves: [],
      dateEcheance: new Date('2026-03-30')
    },
    {
      id: 'NC-028',
      description: 'Absence de preuves de formation continue',
      processus: 'Pilotage stratégique',
      detectePar: this.utilisateurs[1],
      responsable: this.utilisateurs[3],
      dateDetection: new Date('2026-01-28'),
      priorite: 'Moyenne',
      source: 'Contrôle interne',
      statut: 'En cours',
      avancement: 55,
      actionsCorrectives: ['AC-07', 'AC-08'],
      preuves: [],
      dateEcheance: new Date('2026-04-05')
    },
    {
      id: 'NC-026',
      description: 'Taux de satisfaction inférieur au seuil cible',
      processus: 'Satisfaction apprenants',
      detectePar: this.utilisateurs[2],
      responsable: this.utilisateurs[2],
      dateDetection: new Date('2026-02-03'),
      priorite: 'Critique',
      source: 'Réclamation client',
      statut: 'Ouverte',
      avancement: 15,
      actionsCorrectives: ['AC-04'],
      preuves: [],
      dateEcheance: new Date('2026-03-20')
    },
    {
      id: 'NC-024',
      description: "Plan d'audit non approuvé pour le trimestre",
      processus: 'Audit interne',
      detectePar: this.utilisateurs[0],
      responsable: this.utilisateurs[0],
      dateDetection: new Date('2026-01-10'),
      priorite: 'Faible',
      source: 'Audit interne',
      statut: 'En cours',
      avancement: 60,
      actionsCorrectives: ['AC-02'],
      preuves: [],
      dateEcheance: new Date('2026-03-18')
    }
  ]);

  readonly documentsActifs = signal(58);
  readonly lastUpdated = signal(new Date());

  readonly totalProcessus = computed(() => this.processus().length);
  readonly ncOuvertes = computed(() =>
    this.nonConformites().filter((nc) => nc.statut === 'Ouverte' || nc.statut === 'En cours').length
  );
  readonly tauxConformiteGlobal = computed(() => {
    const values = this.processus().map((p) => p.tauxConformite);
    if (!values.length) {
      return 0;
    }
    const total = values.reduce((acc, value) => acc + value, 0);
    return Math.round(total / values.length);
  });

  private readonly _touchUpdated = effect(() => {
    this.processus();
    this.nonConformites();
    this.lastUpdated.set(new Date());
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

  statusClass(status: Processus['statut']): string {
    if (status === 'Conforme') {
      return 'border-green-600 text-green-700';
    }
    if (status === 'À surveiller') {
      return 'border-amber-500 text-amber-600';
    }
    return 'border-red-600 text-red-600';
  }

  priorityClass(priority: NonConformite['priorite']): string {
    switch (priority) {
      case 'Critique':
        return 'bg-red-600 text-white';
      case 'Élevée':
        return 'bg-red-100 text-red-700';
      case 'Moyenne':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  }
}
