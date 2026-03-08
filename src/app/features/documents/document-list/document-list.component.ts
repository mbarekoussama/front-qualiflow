import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { Document, DocumentType, StatutDocument } from '../../../shared/models/document.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, FileSizePipe],
  templateUrl: './document-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentListComponent {
  private readonly utilisateurs: Utilisateur[] = [
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira', initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-02', nom: 'Mrad', prenom: 'Kais', initiales: 'KM', email: 'k.mrad@qualiflow.app', role: 'Pilote', couleur: '#2d7a4f' },
    { id: 'u-03', nom: 'Ben Ali', prenom: 'Sana', initiales: 'SB', email: 's.benali@qualiflow.app', role: 'Auditeur', couleur: '#0f766e' },
    { id: 'u-04', nom: 'Haddad', prenom: 'Rami', initiales: 'RH', email: 'r.haddad@qualiflow.app', role: 'Pilote', couleur: '#475569' }
  ];

  readonly documents = signal<Document[]>([
    { id: 'MQ-001', intitule: 'Manuel Qualité ISO 21001', type: 'Manuel', processus: 'P-01', versions: [{ numero: 'v3.2', dateCreation: new Date('2026-01-10'), auteur: this.utilisateurs[0], commentaire: 'Mise à jour clause 8.1', fichierUrl: '/docs/MQ-001-v3.2.pdf', statut: 'Actuelle' }], versionCourante: 'v3.2', statut: 'Approuvé', responsable: this.utilisateurs[0], metadonnees: { format: 'PDF', taille: 2458624, langue: 'FR', motsCles: ['qualité', 'ISO 21001', 'manuel'] }, diffusion: ['Tous'], dateCreation: new Date('2024-01-15') },
    { id: 'PR-001', intitule: 'Politique Qualité', type: 'Manuel', processus: 'P-01', versions: [{ numero: 'v2.0', dateCreation: new Date('2025-09-01'), auteur: this.utilisateurs[0], commentaire: 'Révision annuelle', fichierUrl: '/docs/PR-001-v2.0.pdf', statut: 'Actuelle' }], versionCourante: 'v2.0', statut: 'Approuvé', responsable: this.utilisateurs[0], metadonnees: { format: 'PDF', taille: 512000, langue: 'FR', motsCles: ['politique', 'qualité'] }, diffusion: ['Tous'], dateCreation: new Date('2024-03-10') },
    { id: 'DOC-010', intitule: 'Procédure de maîtrise des documents', type: 'Procédure', processus: 'P-02', procedure: 'PRO-004', versions: [{ numero: 'v4.1', dateCreation: new Date('2025-11-05'), auteur: this.utilisateurs[1], commentaire: 'Ajout du workflow numérique', fichierUrl: '/docs/DOC-010-v4.1.pdf', statut: 'Actuelle' }], versionCourante: 'v4.1', statut: 'Approuvé', responsable: this.utilisateurs[1], metadonnees: { format: 'PDF', taille: 890000, langue: 'FR', motsCles: ['documents', 'maîtrise', 'GED'] }, diffusion: ['RQ', 'Pilotes'], dateCreation: new Date('2025-01-20') },
    { id: 'DOC-011', intitule: 'Procédure de gestion des enregistrements', type: 'Procédure', processus: 'P-02', procedure: 'PRO-005', versions: [{ numero: 'v2.0', dateCreation: new Date('2025-12-01'), auteur: this.utilisateurs[1], commentaire: 'Refonte complète', fichierUrl: '/docs/DOC-011-v2.0.pdf', statut: 'Actuelle' }], versionCourante: 'v2.0', statut: 'En révision', responsable: this.utilisateurs[1], metadonnees: { format: 'DOCX', taille: 340000, langue: 'FR', motsCles: ['enregistrements', 'archivage'] }, diffusion: ['RQ'], dateCreation: new Date('2025-01-25') },
    { id: 'ENR-022', intitule: 'Formulaire enquête de satisfaction apprenants', type: 'Formulaire', processus: 'P-03', procedure: 'PRO-006', versions: [{ numero: 'v1.3', dateCreation: new Date('2025-10-15'), auteur: this.utilisateurs[2], commentaire: 'Ajout questions NPS', fichierUrl: '/docs/ENR-022-v1.3.docx', statut: 'Actuelle' }], versionCourante: 'v1.3', statut: 'Approuvé', responsable: this.utilisateurs[2], metadonnees: { format: 'DOCX', taille: 125000, langue: 'FR', motsCles: ['satisfaction', 'questionnaire', 'apprenants'] }, diffusion: ['Formation'], dateCreation: new Date('2025-05-10') },
    { id: 'DOC-012', intitule: "Modèle de rapport d'évaluation", type: 'Formulaire', processus: 'P-02', versions: [{ numero: 'v1.0', dateCreation: new Date('2025-08-01'), auteur: this.utilisateurs[1], commentaire: 'Création initiale', fichierUrl: '/docs/DOC-012-v1.0.docx', statut: 'Actuelle' }], versionCourante: 'v1.0', statut: 'Brouillon', responsable: this.utilisateurs[1], metadonnees: { format: 'DOCX', taille: 98000, langue: 'FR', motsCles: ['rapport', 'évaluation'] }, diffusion: [], dateCreation: new Date('2025-08-01') },
    { id: 'ENR-030', intitule: "Rapport d'audit interne Q4-2025", type: 'Enregistrement', processus: 'P-04', procedure: 'PRO-007', versions: [{ numero: 'v1.0', dateCreation: new Date('2026-01-08'), auteur: this.utilisateurs[2], commentaire: 'Audit Q4 2025 finalisé', fichierUrl: '/docs/ENR-030-v1.0.pdf', statut: 'Actuelle' }], versionCourante: 'v1.0', statut: 'Approuvé', responsable: this.utilisateurs[2], metadonnees: { format: 'PDF', taille: 1200000, langue: 'FR', motsCles: ['audit', 'interne', 'Q4', '2025'] }, diffusion: ['DG', 'RQ'], dateCreation: new Date('2026-01-08') },
    { id: 'ENR-031', intitule: 'Plan annuel des audits 2026', type: 'Enregistrement', processus: 'P-04', procedure: 'PRO-007', versions: [{ numero: 'v1.0', dateCreation: new Date('2026-01-20'), auteur: this.utilisateurs[2], commentaire: 'Planification 2026', fichierUrl: '/docs/ENR-031-v1.0.xlsx', statut: 'Actuelle' }], versionCourante: 'v1.0', statut: 'Approuvé', responsable: this.utilisateurs[2], metadonnees: { format: 'XLSX', taille: 58000, langue: 'FR', motsCles: ['audit', 'plan', '2026'] }, diffusion: ['DG', 'RQ', 'Pilotes'], dateCreation: new Date('2026-01-20') },
    { id: 'NC-REG', intitule: 'Registre des non-conformités 2026', type: 'Enregistrement', processus: 'P-05', versions: [{ numero: 'v1.0', dateCreation: new Date('2026-01-01'), auteur: this.utilisateurs[3], commentaire: 'Ouverture exercice 2026', fichierUrl: '/docs/NC-REG-2026.xlsx', statut: 'Actuelle' }], versionCourante: 'v1.0', statut: 'Approuvé', responsable: this.utilisateurs[3], metadonnees: { format: 'XLSX', taille: 245000, langue: 'FR', motsCles: ['NC', 'non-conformités', 'registre'] }, diffusion: ['RQ', 'Pilotes'], dateCreation: new Date('2026-01-01') },
    { id: 'ENR-001', intitule: 'Compte-rendu revue de direction S2-2025', type: 'Enregistrement', processus: 'P-01', procedure: 'PRO-002', versions: [{ numero: 'v1.0', dateCreation: new Date('2025-12-20'), auteur: this.utilisateurs[0], commentaire: 'Revue semestrielle', fichierUrl: '/docs/ENR-001-v1.0.pdf', statut: 'Actuelle' }], versionCourante: 'v1.0', statut: 'Approuvé', responsable: this.utilisateurs[0], metadonnees: { format: 'PDF', taille: 680000, langue: 'FR', motsCles: ['revue', 'direction', 'CR'] }, diffusion: ['DG', 'RQ'], dateCreation: new Date('2025-12-20') }
  ]);

  readonly typeFilter = signal<DocumentType | 'Tous'>('Tous');
  readonly statutFilter = signal<StatutDocument | 'Tous'>('Tous');
  readonly searchQuery = signal('');

  readonly filteredDocuments = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.documents().filter((d) => {
      const typeOk = this.typeFilter() === 'Tous' || d.type === this.typeFilter();
      const statOk = this.statutFilter() === 'Tous' || d.statut === this.statutFilter();
      const searchOk = !query || d.intitule.toLowerCase().includes(query) || d.id.toLowerCase().includes(query);
      return typeOk && statOk && searchOk;
    });
  });

  updateTypeFilter(v: string): void { this.typeFilter.set(v as DocumentType | 'Tous'); }
  updateStatutFilter(v: string): void { this.statutFilter.set(v as StatutDocument | 'Tous'); }
  updateSearch(v: string): void { this.searchQuery.set(v); }

  typeClass(type: DocumentType): string {
    const map: Record<DocumentType, string> = {
      'Manuel': 'bg-purple-100 text-purple-700',
      'Procédure': 'bg-blue-100 text-blue-700',
      'Enregistrement': 'bg-amber-100 text-amber-700',
      'Formulaire': 'bg-teal-100 text-teal-700'
    };
    return map[type] ?? 'bg-slate-100 text-slate-600';
  }
}
