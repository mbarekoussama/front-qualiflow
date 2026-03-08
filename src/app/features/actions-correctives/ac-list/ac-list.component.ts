import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ActionCorrective, StatutActionCorrective } from '../../../shared/models/action-corrective.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-ac-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './ac-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcListComponent {
  private readonly utilisateurs: Utilisateur[] = [
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira', initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-02', nom: 'Mrad', prenom: 'Kais', initiales: 'KM', email: 'k.mrad@qualiflow.app', role: 'Pilote', couleur: '#2d7a4f' },
    { id: 'u-03', nom: 'Ben Ali', prenom: 'Sana', initiales: 'SB', email: 's.benali@qualiflow.app', role: 'Auditeur', couleur: '#0f766e' },
    { id: 'u-04', nom: 'Haddad', prenom: 'Rami', initiales: 'RH', email: 'r.haddad@qualiflow.app', role: 'Pilote', couleur: '#475569' }
  ];

  readonly actions = signal<ActionCorrective[]>([
    { id: 'AC-11', nonConformite: 'NC-031', description: 'Planifier une session de révision documentaire urgente avec le pilote P-02', responsable: this.utilisateurs[1], dateEcheance: new Date('2026-03-20'), statut: 'Planifiée', preuves: [] },
    { id: 'AC-12', nonConformite: 'NC-030', description: 'Mettre à jour la procédure de distribution des formulaires de satisfaction', responsable: this.utilisateurs[2], dateEcheance: new Date('2026-04-01'), statut: 'En cours', preuves: [] },
    { id: 'AC-07', nonConformite: 'NC-028', description: 'Élaborer un plan de formation continue pour le personnel qualité', responsable: this.utilisateurs[0], dateEcheance: new Date('2026-03-15'), statut: 'En cours', preuves: [] },
    { id: 'AC-08', nonConformite: 'NC-028', description: 'Créer un registre de suivi des formations et certifications', responsable: this.utilisateurs[3], dateEcheance: new Date('2026-03-30'), statut: 'Planifiée', preuves: [] },
    { id: 'AC-04', nonConformite: 'NC-026', description: 'Analyser les résultats détaillés des enquêtes de satisfaction Q4 2025', responsable: this.utilisateurs[2], dateEcheance: new Date('2026-03-10'), statut: 'En cours', preuves: [] },
    { id: 'AC-05', nonConformite: 'NC-025', description: 'Former le personnel à la procédure PRO-005 d\'archivage numérique', responsable: this.utilisateurs[1], dateEcheance: new Date('2026-03-01'), statut: 'Réalisée', preuves: ['/preuves/AC-05-attestation.pdf'] },
    { id: 'AC-06', nonConformite: 'NC-025', description: 'Mettre à jour le guide d\'utilisation de la GED pour l\'archivage Q4', responsable: this.utilisateurs[1], dateEcheance: new Date('2026-03-10'), statut: 'Efficace', preuves: ['/preuves/AC-06-guide.pdf'], dateVerification: new Date('2026-03-12'), verificateur: this.utilisateurs[0], commentaireEfficacite: 'Le guide mis à jour est opérationnel, l\'archivage Q1 2026 est conforme.' },
    { id: 'AC-02', nonConformite: 'NC-024', description: 'Soumettre le plan d\'audit pour approbation immédiate', responsable: this.utilisateurs[2], dateEcheance: new Date('2026-02-15'), statut: 'Réalisée', preuves: ['/preuves/AC-02-plan.pdf'] },
    { id: 'AC-01', nonConformite: 'NC-022', description: 'Configurer des rappels automatiques pour la saisie mensuelle des KPI', responsable: this.utilisateurs[3], dateEcheance: new Date('2026-01-25'), statut: 'Efficace', preuves: ['/preuves/AC-01-config.pdf'], dateVerification: new Date('2026-02-05'), verificateur: this.utilisateurs[0], commentaireEfficacite: 'Les rappels fonctionnent. IND-04 mis à jour pour février 2026.' }
  ]);

  readonly statutFilter = signal<StatutActionCorrective | 'Tous'>('Tous');
  readonly ncFilter = signal('Tous');

  readonly filteredActions = computed(() =>
    this.actions().filter((ac) => {
      const statOk = this.statutFilter() === 'Tous' || ac.statut === this.statutFilter();
      const ncOk = this.ncFilter() === 'Tous' || ac.nonConformite === this.ncFilter();
      return statOk && ncOk;
    })
  );

  readonly ncOptions = computed(() => [
    'Tous', ...new Set(this.actions().map((a) => a.nonConformite))
  ]);

  readonly countPlanifiees = computed(() => this.actions().filter((a) => a.statut === 'Planifiée').length);
  readonly countEnCours = computed(() => this.actions().filter((a) => a.statut === 'En cours').length);
  readonly countRealisees = computed(() => this.actions().filter((a) => a.statut === 'Réalisée' || a.statut === 'Efficace').length);

  updateStatutFilter(v: string): void { this.statutFilter.set(v as StatutActionCorrective | 'Tous'); }
  updateNcFilter(v: string): void { this.ncFilter.set(v); }
}
