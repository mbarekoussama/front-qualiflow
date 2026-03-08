import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Procedure, StatutProcedure } from '../../../shared/models/procedure.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-procedure-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './procedure-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureListComponent {
  private readonly utilisateurs: Utilisateur[] = [
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira', initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-02', nom: 'Mrad', prenom: 'Kais', initiales: 'KM', email: 'k.mrad@qualiflow.app', role: 'Pilote', couleur: '#2d7a4f' },
    { id: 'u-03', nom: 'Ben Ali', prenom: 'Sana', initiales: 'SB', email: 's.benali@qualiflow.app', role: 'Auditeur', couleur: '#0f766e' },
    { id: 'u-04', nom: 'Haddad', prenom: 'Rami', initiales: 'RH', email: 'r.haddad@qualiflow.app', role: 'Pilote', couleur: '#475569' }
  ];

  readonly procedures = signal<Procedure[]>([
    { id: 'PRO-001', intitule: 'Élaboration du plan stratégique', processusParent: 'P-01', description: 'Définir la vision et les objectifs qualité annuels', responsable: this.utilisateurs[0], etapes: [{ ordre: 1, description: 'Analyse de contexte', responsable: 'DG', delai: '1 semaine' }, { ordre: 2, description: 'Définition des axes stratégiques', responsable: 'RQ', delai: '2 semaines' }], ressources: ['Rapport annuel', 'Données ISO 21001'], documents: ['MQ-001'], statut: 'Active', dateCreation: new Date('2024-10-10'), dateMiseAJour: new Date('2026-01-15') },
    { id: 'PRO-002', intitule: 'Revue de direction', processusParent: 'P-01', description: 'Évaluation semestrielle du système de management', responsable: this.utilisateurs[0], etapes: [{ ordre: 1, description: 'Collecte des données d\'entrée', responsable: 'RQ', delai: '2 semaines' }, { ordre: 2, description: 'Réunion de revue', responsable: 'DG', delai: '1 jour' }, { ordre: 3, description: 'Rédaction du compte-rendu', responsable: 'RQ', delai: '3 jours' }], ressources: ['Indicateurs KPI', 'Rapports NC'], documents: ['ENR-001'], statut: 'Active', dateCreation: new Date('2024-10-12'), dateMiseAJour: new Date('2026-02-10') },
    { id: 'PRO-004', intitule: 'Maîtrise des documents', processusParent: 'P-02', description: 'Créer, approuver, diffuser et archiver les documents qualité', responsable: this.utilisateurs[1], etapes: [{ ordre: 1, description: 'Rédaction', responsable: 'Auteur', delai: '1 à 2 semaines' }, { ordre: 2, description: 'Vérification', responsable: 'Responsable', delai: '3 jours' }, { ordre: 3, description: 'Approbation', responsable: 'DG ou RQ', delai: '2 jours' }, { ordre: 4, description: 'Diffusion', responsable: 'RQ', delai: '1 jour' }], ressources: ['GED QualiFlow', 'Modèles de documents'], documents: ['DOC-010'], statut: 'Active', dateCreation: new Date('2025-01-15'), dateMiseAJour: new Date('2026-01-20') },
    { id: 'PRO-005', intitule: 'Gestion des enregistrements', processusParent: 'P-02', description: 'Identifier, stocker et protéger les preuves qualité', responsable: this.utilisateurs[1], etapes: [{ ordre: 1, description: 'Identification des enregistrements', responsable: 'RQ', delai: 'Continu' }, { ordre: 2, description: 'Archivage structuré', responsable: 'RQ', delai: 'Continu' }], ressources: ['GED QualiFlow', 'Classeurs numérotés'], documents: ['DOC-011'], statut: 'En révision', dateCreation: new Date('2025-01-18'), dateMiseAJour: new Date('2026-02-28') },
    { id: 'PRO-006', intitule: "Enquête de satisfaction", processusParent: 'P-03', description: 'Recueillir et analyser la satisfaction des apprenants', responsable: this.utilisateurs[2], etapes: [{ ordre: 1, description: 'Élaboration questionnaire', responsable: 'RQ', delai: '1 semaine' }, { ordre: 2, description: 'Déploiement enquête', responsable: 'Formation', delai: '2 semaines' }, { ordre: 3, description: 'Analyse des résultats', responsable: 'RQ', delai: '1 semaine' }], ressources: ['Questionnaire type', 'Outil statistique'], documents: ['ENR-022'], statut: 'Active', dateCreation: new Date('2025-05-05'), dateMiseAJour: new Date('2025-12-01') },
    { id: 'PRO-007', intitule: "Plan et programme d'audit", processusParent: 'P-04', description: "Planifier et réaliser les audits internes du SMS", responsable: this.utilisateurs[2], etapes: [{ ordre: 1, description: 'Élaboration programme annuel', responsable: 'Auditeur', delai: '1 mois' }, { ordre: 2, description: 'Notification des audités', responsable: 'Auditeur', delai: '15 jours avant' }, { ordre: 3, description: "Réalisation de l'audit", responsable: 'Auditeur', delai: '1 à 3 jours' }, { ordre: 4, description: "Rédaction rapport d'audit", responsable: 'Auditeur', delai: '1 semaine' }], ressources: ["Guide d'audit", 'Liste de vérification'], documents: ['ENR-030'], statut: 'Active', dateCreation: new Date('2024-09-20'), dateMiseAJour: new Date('2026-01-05') },
    { id: 'PRO-009', intitule: 'Traitement des non-conformités', processusParent: 'P-05', description: 'Détecter, analyser et corriger les non-conformités', responsable: this.utilisateurs[3], etapes: [{ ordre: 1, description: 'Détection et enregistrement', responsable: 'Tout personnel', delai: 'Immédiat' }, { ordre: 2, description: 'Analyse cause racine', responsable: 'Pilote', delai: '5 jours' }, { ordre: 3, description: 'Planification actions correctives', responsable: 'RQ', delai: '10 jours' }, { ordre: 4, description: 'Vérification efficacité', responsable: 'RQ', delai: 'Selon échéance' }], ressources: ['Formulaire NC', 'Guide 5 Pourquoi'], documents: ['NC-REG'], statut: 'Active', dateCreation: new Date('2025-09-12'), dateMiseAJour: new Date('2026-02-20') },
    { id: 'PRO-010', intitule: 'Actions correctives et préventives', processusParent: 'P-05', description: 'Planifier, suivre et évaluer les actions correctives', responsable: this.utilisateurs[3], etapes: [{ ordre: 1, description: 'Identification action', responsable: 'Pilote', delai: 'Selon NC' }, { ordre: 2, description: 'Mise en œuvre', responsable: 'Responsable désigné', delai: 'Selon plan' }, { ordre: 3, description: 'Vérification efficacité', responsable: 'RQ', delai: 'Après réalisation' }], ressources: ['Formulaire AC', 'QualiFlow'], documents: [], statut: 'Active', dateCreation: new Date('2025-09-15'), dateMiseAJour: new Date('2026-01-30') }
  ]);

  readonly processusFilter = signal<string>('Tous');
  readonly statutFilter = signal<StatutProcedure | 'Tous'>('Tous');

  readonly processusOptions = computed(() => {
    const values = [...new Set(this.procedures().map((p) => p.processusParent))];
    return ['Tous', ...values];
  });

  readonly filteredProcedures = computed(() =>
    this.procedures().filter((p) => {
      const procOk = this.processusFilter() === 'Tous' || p.processusParent === this.processusFilter();
      const statOk = this.statutFilter() === 'Tous' || p.statut === this.statutFilter();
      return procOk && statOk;
    })
  );

  updateProcessusFilter(v: string): void { this.processusFilter.set(v); }
  updateStatutFilter(v: string): void { this.statutFilter.set(v as StatutProcedure | 'Tous'); }
}
