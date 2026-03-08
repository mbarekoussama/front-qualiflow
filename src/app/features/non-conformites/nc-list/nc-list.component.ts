import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  NonConformite,
  PrioriteNonConformite,
  StatutNonConformite
} from '../../../shared/models/non-conformite.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-nc-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, ProgressBarComponent],
  templateUrl: './nc-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NcListComponent {
  private readonly utilisateurs: Utilisateur[] = [
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira', initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-02', nom: 'Mrad', prenom: 'Kais', initiales: 'KM', email: 'k.mrad@qualiflow.app', role: 'Pilote', couleur: '#2d7a4f' },
    { id: 'u-03', nom: 'Ben Ali', prenom: 'Sana', initiales: 'SB', email: 's.benali@qualiflow.app', role: 'Auditeur', couleur: '#0f766e' },
    { id: 'u-04', nom: 'Haddad', prenom: 'Rami', initiales: 'RH', email: 'r.haddad@qualiflow.app', role: 'Pilote', couleur: '#475569' }
  ];

  readonly nonConformites = signal<NonConformite[]>([
    { id: 'NC-031', description: 'Retard de mise à jour du manuel qualité', processus: 'P-02', detectePar: this.utilisateurs[2], responsable: this.utilisateurs[0], dateDetection: new Date('2026-02-12'), priorite: 'Élevée', source: 'Audit interne', statut: 'Ouverte', avancement: 25, actionsCorrectives: ['AC-11'], preuves: [], dateEcheance: new Date('2026-03-30') },
    { id: 'NC-030', description: 'Formulaire de satisfaction non distribué à la dernière promotion', processus: 'P-03', detectePar: this.utilisateurs[0], responsable: this.utilisateurs[2], dateDetection: new Date('2026-02-18'), priorite: 'Moyenne', source: 'Contrôle interne', statut: 'En cours', avancement: 40, actionsCorrectives: ['AC-12'], preuves: [], dateEcheance: new Date('2026-04-10') },
    { id: 'NC-028', description: 'Absence de preuves de formation continue', processus: 'P-01', detectePar: this.utilisateurs[1], responsable: this.utilisateurs[3], dateDetection: new Date('2026-01-28'), priorite: 'Moyenne', source: 'Contrôle interne', statut: 'En cours', avancement: 55, actionsCorrectives: ['AC-07', 'AC-08'], preuves: [], dateEcheance: new Date('2026-04-05') },
    { id: 'NC-026', description: 'Taux de satisfaction inférieur au seuil cible (< 75%)', processus: 'P-03', detectePar: this.utilisateurs[2], responsable: this.utilisateurs[2], dateDetection: new Date('2026-02-03'), priorite: 'Critique', source: 'Réclamation client', statut: 'Ouverte', avancement: 15, actionsCorrectives: ['AC-04'], preuves: [], dateEcheance: new Date('2026-03-20') },
    { id: 'NC-025', description: 'Procédure PRO-005 non appliquée pour archivage Q4', processus: 'P-02', detectePar: this.utilisateurs[0], responsable: this.utilisateurs[1], dateDetection: new Date('2026-01-15'), priorite: 'Élevée', source: 'Audit interne', statut: 'En cours', avancement: 70, actionsCorrectives: ['AC-05', 'AC-06'], preuves: [], dateEcheance: new Date('2026-03-15') },
    { id: 'NC-024', description: "Plan d'audit non approuvé pour le trimestre", processus: 'P-04', detectePar: this.utilisateurs[0], responsable: this.utilisateurs[0], dateDetection: new Date('2026-01-10'), priorite: 'Faible', source: 'Audit interne', statut: 'En cours', avancement: 60, actionsCorrectives: ['AC-02'], preuves: [], dateEcheance: new Date('2026-03-18') },
    { id: 'NC-022', description: 'Indicateur IND-04 non mis à jour depuis 3 mois', processus: 'P-05', detectePar: this.utilisateurs[2], responsable: this.utilisateurs[3], dateDetection: new Date('2025-12-20'), priorite: 'Moyenne', source: 'Audit interne', statut: 'Clôturée', avancement: 100, actionsCorrectives: ['AC-01'], preuves: ['/preuves/NC-022-1.pdf'], dateEcheance: new Date('2026-02-01') },
    { id: 'NC-019', description: "Rapport d'audit S1-2025 non diffusé", processus: 'P-04', detectePar: this.utilisateurs[2], responsable: this.utilisateurs[2], dateDetection: new Date('2025-11-08'), priorite: 'Faible', source: 'Contrôle interne', statut: 'Clôturée', avancement: 100, actionsCorrectives: [], preuves: ['/preuves/NC-019-1.pdf'], dateEcheance: new Date('2025-12-31') }
  ]);

  readonly processusFilter = signal('Tous');
  readonly prioriteFilter = signal<PrioriteNonConformite | 'Tous'>('Tous');
  readonly statutFilter = signal<StatutNonConformite | 'Tous'>('Tous');

  readonly filteredNcs = computed(() =>
    this.nonConformites().filter((nc) => {
      const procOk = this.processusFilter() === 'Tous' || nc.processus === this.processusFilter();
      const priOk = this.prioriteFilter() === 'Tous' || nc.priorite === this.prioriteFilter();
      const statOk = this.statutFilter() === 'Tous' || nc.statut === this.statutFilter();
      return procOk && priOk && statOk;
    })
  );

  readonly processusOptions = computed(() => [
    'Tous', ...new Set(this.nonConformites().map((nc) => nc.processus))
  ]);

  readonly countOuvertes = computed(() =>
    this.nonConformites().filter((nc) => nc.statut === 'Ouverte').length
  );
  readonly countEnCours = computed(() =>
    this.nonConformites().filter((nc) => nc.statut === 'En cours').length
  );
  readonly countCloturees = computed(() =>
    this.nonConformites().filter((nc) => nc.statut === 'Clôturée').length
  );

  updateProcessusFilter(v: string): void { this.processusFilter.set(v); }
  updatePrioriteFilter(v: string): void { this.prioriteFilter.set(v as PrioriteNonConformite | 'Tous'); }
  updateStatutFilter(v: string): void { this.statutFilter.set(v as StatutNonConformite | 'Tous'); }

  readonly today = new Date();

  priorityClass(p: PrioriteNonConformite): string {
    const map = { 'Critique': 'bg-red-100 text-red-700 border border-red-300', 'Élevée': 'bg-orange-100 text-orange-700 border border-orange-300', 'Moyenne': 'bg-amber-100 text-amber-700 border border-amber-300', 'Faible': 'bg-slate-100 text-slate-600 border border-slate-300' };
    return map[p] ?? 'bg-slate-100 text-slate-600';
  }
}
