import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  FREQUENCE_LABEL,
  Indicateur,
  TendanceIndicateur
} from '../../../shared/models/indicateur.model';
import { IndicateurService } from '../../../core/services/indicateur.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-indicateur-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './indicateur-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndicateurListComponent implements OnInit {
  private readonly svc = inject(IndicateurService);
  private readonly auth = inject(AuthService);

  readonly frequenceLabel = FREQUENCE_LABEL;
  readonly loading = this.svc.loading;
  readonly error = this.svc.error;
  readonly indicateurs = this.svc.items;

  readonly processusFilter = signal('Tous');

  readonly filteredIndicateurs = computed(() =>
    this.indicateurs().filter((i) =>
      this.processusFilter() === 'Tous' || i.processusNom === this.processusFilter()
    )
  );

  readonly processusOptions = computed(() => [
    'Tous', ...new Set(this.indicateurs().map((i) => i.processusNom))
  ]);

  readonly total = computed(() => this.indicateurs().length);
  readonly countAtteints = computed(() =>
    this.indicateurs().filter((i) => {
      const v = this.latestValeur(i);
      return v !== null && v >= i.valeurCible;
    }).length
  );
  readonly countAlerte = computed(() =>
    this.indicateurs().filter((i) => {
      const v = this.latestValeur(i);
      return v !== null && v < i.seuilAlerte;
    }).length
  );

  readonly performanceMoyenne = computed(() => {
    const list = this.indicateurs();
    if (list.length === 0) return 0;
    const percents = list.map((i) => this.conformityPercent(i));
    const avg = percents.reduce((a, b) => a + b, 0) / percents.length;
    return Math.round(avg);
  });

  async ngOnInit(): Promise<void> {
    const orgId = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';
    await this.svc.chargerListe(orgId);
  }

  updateProcessusFilter(v: string): void { this.processusFilter.set(v); }

  latestValeur(ind: Indicateur): number | null {
    return ind.valeurs.length > 0 ? ind.valeurs[ind.valeurs.length - 1].valeur : null;
  }

  conformityPercent(ind: Indicateur): number {
    const val = this.latestValeur(ind);
    if (val === null || ind.valeurCible === 0) return 0;
    return Math.min(100, Math.round((val / ind.valeurCible) * 100));
  }

  valueClass(ind: Indicateur): string {
    const val = this.latestValeur(ind);
    if (val === null) return 'text-slate-400';
    if (val < ind.seuilAlerte) return 'text-red-600';
    if (val < ind.valeurCible) return 'text-amber-600';
    return 'text-green-700';
  }

  tendance(ind: Indicateur): TendanceIndicateur {
    if (ind.valeurs.length < 2) return 'Stable';
    const last = ind.valeurs[ind.valeurs.length - 1].valeur;
    const prev = ind.valeurs[ind.valeurs.length - 2].valeur;
    if (last > prev) return 'Hausse';
    if (last < prev) return 'Baisse';
    return 'Stable';
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
    if (cible <= 0) return 0;
    return Math.min(100, Math.round((val / (cible * 1.3)) * 100));
  }

  barColor(ind: Indicateur): string {
    const val = this.latestValeur(ind);
    if (val === null) return 'bg-slate-200';
    if (val < ind.seuilAlerte) return 'bg-red-500';
    if (val < ind.valeurCible) return 'bg-amber-500';
    return 'bg-green-600';
  }

  async supprimer(id: string): Promise<void> {
    if (!confirm('Supprimer cet indicateur ?')) return;
    const ok = await this.svc.supprimer(id);
    if (ok) {
      const orgId = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';
      await this.svc.chargerListe(orgId);
    }
  }
}
