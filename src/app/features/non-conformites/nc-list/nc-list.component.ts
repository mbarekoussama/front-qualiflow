import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  GraviteNC,
  SourceNC,
  StatutNC,
  GRAVITE_LABEL,
  STATUT_NC_LABEL,
  SOURCE_NC_LABEL,
} from '../../../shared/models/non-conformite.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { NonConformiteService } from '../../../core/services/non-conformite.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-nc-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, ProgressBarComponent],
  templateUrl: './nc-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NcListComponent implements OnInit {
  private readonly svc  = inject(NonConformiteService);
  private readonly auth = inject(AuthService);

  readonly loading = this.svc.loading;
  readonly error   = this.svc.error;

  readonly processusFilter = signal('Tous');
  readonly graviteFilter   = signal<GraviteNC | 'Tous'>('Tous');
  readonly statutFilter    = signal<StatutNC | 'Tous'>('Tous');

  readonly filteredNcs = computed(() =>
    this.svc.items().filter((nc) => {
      const procOk  = this.processusFilter() === 'Tous' || nc.processus === this.processusFilter();
      const gravOk  = this.graviteFilter()   === 'Tous' || nc.priorite  === this.graviteFilter();
      const statOk  = this.statutFilter()    === 'Tous' || nc.statut    === this.statutFilter();
      return procOk && gravOk && statOk;
    })
  );

  readonly processusOptions = computed(() => [
    'Tous', ...new Set(this.svc.items().map((nc) => nc.processus))
  ]);

  readonly countOuvertes  = this.svc.countOuvertes;
  readonly countEnCours   = this.svc.countEnCours;
  readonly countCloturees = this.svc.countCloturees;

  readonly today = new Date();

  // label helpers
  graviteLabel(g: GraviteNC): string { return GRAVITE_LABEL[g] ?? g; }
  sourceLabel(s: string): string     { return SOURCE_NC_LABEL[s as SourceNC] ?? s; }

  graviteClass(g: GraviteNC): string {
    const map: Record<GraviteNC, string> = {
      CRITIQUE: 'bg-red-100 text-red-700 border border-red-300',
      MAJEURE:  'bg-orange-100 text-orange-700 border border-orange-300',
      MINEURE:  'bg-amber-100 text-amber-700 border border-amber-300',
    };
    return map[g] ?? 'bg-slate-100 text-slate-600 border border-slate-300';
  }

  updateProcessusFilter(v: string): void { this.processusFilter.set(v); }
  updateGraviteFilter(v: string): void   { this.graviteFilter.set(v as GraviteNC | 'Tous'); }
  updateStatutFilter(v: string): void    { this.statutFilter.set(v as StatutNC | 'Tous'); }

  ngOnInit(): void {
    const orgId = this.auth.organisationId() ?? '';
    if (orgId) this.svc.chargerListe(orgId);
  }
}
