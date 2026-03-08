import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { Indicateur, TendanceIndicateur } from '../../../shared/models/indicateur.model';
import { Utilisateur } from '../../../shared/models/utilisateur.model';

@Component({
  selector: 'app-indicateur-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicateur-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndicateurListComponent {
  private readonly utilisateurs: Utilisateur[] = [
    { id: 'u-01', nom: 'Mansouri', prenom: 'Amira', initiales: 'AM', email: 'a.mansouri@qualiflow.app', role: 'Responsable Qualité', couleur: '#1a5c38' },
    { id: 'u-02', nom: 'Mrad', prenom: 'Kais', initiales: 'KM', email: 'k.mrad@qualiflow.app', role: 'Pilote', couleur: '#2d7a4f' },
    { id: 'u-03', nom: 'Ben Ali', prenom: 'Sana', initiales: 'SB', email: 's.benali@qualiflow.app', role: 'Auditeur', couleur: '#0f766e' },
    { id: 'u-04', nom: 'Haddad', prenom: 'Rami', initiales: 'RH', email: 'r.haddad@qualiflow.app', role: 'Pilote', couleur: '#475569' }
  ];

  readonly indicateurs = signal<Indicateur[]>([
    {
      id: 'IND-01', intitule: 'Taux de conformité global du SMS', processus: 'P-01', formule: '(NC clôturées / Total NC) × 100', unite: '%', cible: 85, seuilAlerte: 70, frequence: 'Trimestrielle', responsable: this.utilisateurs[0], tendance: 'Hausse',
      valeurs: [
        { periode: '2025-Q1', valeur: 72, saisiePar: this.utilisateurs[0], dateSaisie: new Date('2025-04-05') },
        { periode: '2025-Q2', valeur: 75, saisiePar: this.utilisateurs[0], dateSaisie: new Date('2025-07-05') },
        { periode: '2025-Q3', valeur: 78, saisiePar: this.utilisateurs[0], dateSaisie: new Date('2025-10-05') },
        { periode: '2025-Q4', valeur: 82, saisiePar: this.utilisateurs[0], dateSaisie: new Date('2026-01-05') }
      ]
    },
    {
      id: 'IND-02', intitule: 'Nombre de processus actifs conformes', processus: 'P-01', formule: 'Count(processus.statut = "Conforme")', unite: 'nb', cible: 4, seuilAlerte: 3, frequence: 'Mensuelle', responsable: this.utilisateurs[0], tendance: 'Stable',
      valeurs: [
        { periode: '2026-01', valeur: 2, saisiePar: this.utilisateurs[0], dateSaisie: new Date('2026-02-01') },
        { periode: '2026-02', valeur: 2, saisiePar: this.utilisateurs[0], dateSaisie: new Date('2026-03-01') }
      ]
    },
    {
      id: 'IND-03', intitule: 'Taux de documents approuvés', processus: 'P-02', formule: '(Documents approuvés / Total documents) × 100', unite: '%', cible: 90, seuilAlerte: 75, frequence: 'Mensuelle', responsable: this.utilisateurs[1], tendance: 'Hausse',
      valeurs: [
        { periode: '2025-10', valeur: 82, saisiePar: this.utilisateurs[1], dateSaisie: new Date('2025-11-01') },
        { periode: '2025-11', valeur: 85, saisiePar: this.utilisateurs[1], dateSaisie: new Date('2025-12-01') },
        { periode: '2025-12', valeur: 81, saisiePar: this.utilisateurs[1], dateSaisie: new Date('2026-01-01') },
        { periode: '2026-01', valeur: 83, saisiePar: this.utilisateurs[1], dateSaisie: new Date('2026-02-01') },
        { periode: '2026-02', valeur: 78, saisiePar: this.utilisateurs[1], dateSaisie: new Date('2026-03-01') }
      ]
    },
    {
      id: 'IND-04', intitule: 'Délai moyen de traitement des NC', processus: 'P-05', formule: 'Moy(dateClôture - dateDétection)', unite: 'jours', cible: 30, seuilAlerte: 45, frequence: 'Mensuelle', responsable: this.utilisateurs[3], tendance: 'Baisse',
      valeurs: [
        { periode: '2025-10', valeur: 52, saisiePar: this.utilisateurs[3], dateSaisie: new Date('2025-11-01') },
        { periode: '2025-11', valeur: 48, saisiePar: this.utilisateurs[3], dateSaisie: new Date('2025-12-01') },
        { periode: '2025-12', valeur: 41, saisiePar: this.utilisateurs[3], dateSaisie: new Date('2026-01-01') },
        { periode: '2026-01', valeur: 38, saisiePar: this.utilisateurs[3], dateSaisie: new Date('2026-02-01') }
      ]
    },
    {
      id: 'IND-05', intitule: 'Taux de satisfaction apprenants', processus: 'P-03', formule: '(Note moy enquête / 5) × 100', unite: '%', cible: 80, seuilAlerte: 70, frequence: 'Trimestrielle', responsable: this.utilisateurs[2], tendance: 'Baisse',
      valeurs: [
        { periode: '2025-Q1', valeur: 79, saisiePar: this.utilisateurs[2], dateSaisie: new Date('2025-04-10') },
        { periode: '2025-Q2', valeur: 81, saisiePar: this.utilisateurs[2], dateSaisie: new Date('2025-07-10') },
        { periode: '2025-Q3', valeur: 77, saisiePar: this.utilisateurs[2], dateSaisie: new Date('2025-10-10') },
        { periode: '2025-Q4', valeur: 69, saisiePar: this.utilisateurs[2], dateSaisie: new Date('2026-01-10') }
      ]
    },
    {
      id: 'IND-06', intitule: "Taux d'exécution du plan d'audit", processus: 'P-04', formule: '(Audits réalisés / Audits planifiés) × 100', unite: '%', cible: 100, seuilAlerte: 85, frequence: 'Semestrielle', responsable: this.utilisateurs[2], tendance: 'Stable',
      valeurs: [
        { periode: '2025-S1', valeur: 85, saisiePar: this.utilisateurs[2], dateSaisie: new Date('2025-07-15') },
        { periode: '2025-S2', valeur: 90, saisiePar: this.utilisateurs[2], dateSaisie: new Date('2026-01-15') }
      ]
    }
  ]);

  readonly processusFilter = signal('Tous');

  readonly filteredIndicateurs = computed(() =>
    this.indicateurs().filter((i) =>
      this.processusFilter() === 'Tous' || i.processus === this.processusFilter()
    )
  );

  readonly processusOptions = computed(() => [
    'Tous', ...new Set(this.indicateurs().map((i) => i.processus))
  ]);

  updateProcessusFilter(v: string): void { this.processusFilter.set(v); }

  latestValeur(ind: Indicateur): number | null {
    return ind.valeurs.length > 0 ? ind.valeurs[ind.valeurs.length - 1].valeur : null;
  }

  conformityPercent(ind: Indicateur): number {
    const val = this.latestValeur(ind);
    if (val === null) return 0;
    return Math.min(100, Math.round((val / ind.cible) * 100));
  }

  valueClass(ind: Indicateur): string {
    const val = this.latestValeur(ind);
    if (val === null) return 'text-slate-400';
    if (val < ind.seuilAlerte) return 'text-red-600';
    if (val < ind.cible) return 'text-amber-600';
    return 'text-green-700';
  }

  tendanceIcon(t: TendanceIndicateur): string {
    if (t === 'Hausse') return '↑';
    if (t === 'Baisse') return '↓';
    return '→';
  }

  tendanceClass(t: TendanceIndicateur): string {
    if (t === 'Hausse') return 'text-green-600';
    if (t === 'Baisse') return 'text-red-500';
    return 'text-slate-400';
  }

  barHeight(val: number, cible: number): number {
    return Math.min(100, Math.round((val / (cible * 1.3)) * 100));
  }

  barColor(ind: Indicateur): string {
    const val = this.latestValeur(ind);
    if (val === null) return 'bg-slate-200';
    if (val < ind.seuilAlerte) return 'bg-red-500';
    if (val < ind.cible) return 'bg-amber-500';
    return 'bg-green-600';
  }
}
