import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProcedureListItem, StatutProcedure } from '../../../shared/models/procedure.model';
import { ProcedureService } from '../../../core/services/procedure.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-procedure-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './procedure-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureListComponent implements OnInit {
  private readonly svc  = inject(ProcedureService);
  private readonly auth = inject(AuthService);

  private readonly orgId = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';

  readonly loading = this.svc.loading;
  readonly error   = this.svc.error;
  readonly procedures = this.svc.items;

  readonly searchFilter    = signal('');
  readonly processusFilter = signal<string>('Tous');
  readonly statutFilter    = signal<StatutProcedure | 'Tous'>('Tous');

  readonly processusOptions = computed(() => {
    const codes = [...new Set(this.procedures().map(p => p.processusCode))];
    return ['Tous', ...codes];
  });

  readonly filteredProcedures = computed(() =>
    this.procedures().filter(p => {
      const searchOk = !this.searchFilter() ||
        p.code.toLowerCase().includes(this.searchFilter().toLowerCase()) ||
        p.titre.toLowerCase().includes(this.searchFilter().toLowerCase());
      const procOk = this.processusFilter() === 'Tous' || p.processusCode === this.processusFilter();
      const statOk = this.statutFilter() === 'Tous' || p.statut === this.statutFilter();
      return searchOk && procOk && statOk;
    })
  );

  async ngOnInit(): Promise<void> {
    await this.svc.chargerListe(this.orgId);
  }

  setSearch(v: string):           void { this.searchFilter.set(v); }
  setProcessus(v: string):        void { this.processusFilter.set(v); }
  setStatut(v: string):           void { this.statutFilter.set(v as StatutProcedure | 'Tous'); }
}
