import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

// ── Dashboard-local view models (self-contained mock data) ────────────────────

interface DashboardUser {
  id: string; nom: string; prenom: string; initiales: string;
  email: string; role: string; couleur: string;
}

interface DashboardProcessus {
  id: string; code: string; nom: string; type: string;
  statut: 'Conforme' | 'À surveiller' | 'Non conforme';
  tauxConformite: number; pilote: DashboardUser; dateCreation: Date;
}

interface DashboardNC {
  id: string; description: string; processus: string;
  detectePar: DashboardUser; responsable: DashboardUser;
  dateDetection: Date; priorite: 'Critique' | 'Élevée' | 'Moyenne' | 'Faible';
  statut: 'Ouverte' | 'En cours' | 'Clôturée';
  avancement: number; dateEcheance: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly utilisateurs: DashboardUser[] = [
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira',  initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-02', nom: 'Mrad',     prenom: 'Kais',   initiales: 'KM', email: 'k.mrad@qualiflow.app',     role: 'Pilote',              couleur: '#2d7a4f' },
    { id: 'u-03', nom: 'Ben Ali',  prenom: 'Sana',   initiales: 'SB', email: 's.benali@qualiflow.app',   role: 'Auditeur',            couleur: '#0f766e' },
    { id: 'u-04', nom: 'Haddad',   prenom: 'Rami',   initiales: 'RH', email: 'r.haddad@qualiflow.app',   role: 'Pilote',              couleur: '#475569' },
  ];

  readonly processus = signal<DashboardProcessus[]>([
    { id: 'P-01', code: 'P-01', nom: 'Pilotage stratégique',          type: 'PILOTAGE',    statut: 'Conforme',      tauxConformite: 92, pilote: this.utilisateurs[0], dateCreation: new Date('2024-10-05') },
    { id: 'P-02', code: 'P-02', nom: 'Gestion documentaire',          type: 'SUPPORT',     statut: 'À surveiller',  tauxConformite: 78, pilote: this.utilisateurs[1], dateCreation: new Date('2025-01-11') },
    { id: 'P-03', code: 'P-03', nom: 'Satisfaction apprenants',       type: 'REALISATION', statut: 'À surveiller',  tauxConformite: 66, pilote: this.utilisateurs[2], dateCreation: new Date('2025-05-02') },
    { id: 'P-04', code: 'P-04', nom: 'Audit interne',                 type: 'SUPPORT',     statut: 'Conforme',      tauxConformite: 84, pilote: this.utilisateurs[0], dateCreation: new Date('2024-09-18') },
    { id: 'P-05', code: 'P-05', nom: 'Traitement des non-conformités',type: 'SUPPORT',     statut: 'Non conforme',  tauxConformite: 58, pilote: this.utilisateurs[3], dateCreation: new Date('2025-09-09') },
  ]);

  readonly nonConformites = signal<DashboardNC[]>([
    { id: 'NC-031', description: 'Retard de mise à jour du manuel qualité',       processus: 'Gestion documentaire',    detectePar: this.utilisateurs[2], responsable: this.utilisateurs[0], dateDetection: new Date('2026-02-12'), priorite: 'Élevée',   statut: 'Ouverte',   avancement: 25, dateEcheance: new Date('2026-03-30') },
    { id: 'NC-028', description: 'Absence de preuves de formation continue',      processus: 'Pilotage stratégique',    detectePar: this.utilisateurs[1], responsable: this.utilisateurs[3], dateDetection: new Date('2026-01-28'), priorite: 'Moyenne',  statut: 'En cours',  avancement: 55, dateEcheance: new Date('2026-04-05') },
    { id: 'NC-026', description: 'Taux de satisfaction inférieur au seuil cible', processus: 'Satisfaction apprenants', detectePar: this.utilisateurs[2], responsable: this.utilisateurs[2], dateDetection: new Date('2026-02-03'), priorite: 'Critique', statut: 'Ouverte',   avancement: 15, dateEcheance: new Date('2026-03-20') },
    { id: 'NC-024', description: "Plan d'audit non approuvé pour le trimestre",   processus: 'Audit interne',           detectePar: this.utilisateurs[0], responsable: this.utilisateurs[0], dateDetection: new Date('2026-01-10'), priorite: 'Faible',   statut: 'En cours',  avancement: 60, dateEcheance: new Date('2026-03-18') },
  ]);

  readonly documentsActifs = signal(58);
  readonly lastUpdated = signal(new Date());

  readonly totalProcessus = computed(() => this.processus().length);
  readonly ncOuvertes = computed(() =>
    this.nonConformites().filter((nc) => nc.statut === 'Ouverte' || nc.statut === 'En cours').length
  );
  readonly tauxConformiteGlobal = computed(() => {
    const values = this.processus().map((p) => p.tauxConformite);
    if (!values.length) return 0;
    return Math.round(values.reduce((acc, v) => acc + v, 0) / values.length);
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

  statusClass(status: DashboardProcessus['statut']): string {
    if (status === 'Conforme') {
      return 'border-green-600 text-green-700';
    }
    if (status === 'À surveiller') {
      return 'border-amber-500 text-amber-600';
    }
    return 'border-red-600 text-red-600';
  }

  priorityClass(priority: DashboardNC['priorite']): string {
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
