import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ProcessusService } from '../../../core/services/processus.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  ProcessusListItem,
  TypeProcessus,
  StatutProcessus
} from '../../../shared/models/processus.model';

@Component({
  selector: 'app-processus-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './processus-list.component.html',
  styleUrl: './processus-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessusListComponent implements OnInit {
  readonly svc    = inject(ProcessusService);
  private  router = inject(Router);
  private readonly auth  = inject(AuthService);

  readonly orgId = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';

  readonly searchTerm   = signal('');
  readonly typeFilter   = signal<TypeProcessus | ''>('');
  readonly statutFilter = signal<StatutProcessus | ''>('');

  readonly filteredItems = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const type   = this.typeFilter();
    const statut = this.statutFilter();
    return this.svc.items().filter(p => {
      const matchSearch = !search ||
        p.nom.toLowerCase().includes(search) ||
        p.code.toLowerCase().includes(search);
      const matchType   = !type   || p.type === type;
      const matchStatut = !statut || p.statut === statut;
      return matchSearch && matchType && matchStatut;
    });
  });

  readonly stats = this.svc.statsByType;

  async ngOnInit() {
    await this.svc.chargerListe(this.orgId);
  }

  setSearchTerm(value: string) { this.searchTerm.set(value); }
  setTypeFilter(value: string)  { this.typeFilter.set(value as TypeProcessus | ''); }
  setStatutFilter(value: string){ this.statutFilter.set(value as StatutProcessus | ''); }

  async supprimer(item: ProcessusListItem) {
    if (!confirm(`Supprimer « ${item.nom} » ?`)) return;
    await this.svc.supprimer(item.id);
    await this.svc.chargerListe(this.orgId);
  }

  voirDetail(id: string) { this.router.navigate(['/processus', id]); }
  editer(id: string)     { this.router.navigate(['/processus', id, 'edition']); }

  typeBadgeClass(type: TypeProcessus): string {
    return ({
      PILOTAGE   : 'bg-slate-100 text-slate-700',
      REALISATION: 'bg-blue-100 text-blue-700',
      SUPPORT    : 'bg-orange-100 text-orange-700',
    })[type] ?? 'bg-slate-100 text-slate-700';
  }

  typeBadgeLabel(type: TypeProcessus): string {
    return ({ PILOTAGE: 'Pilotage', REALISATION: 'Réalisation', SUPPORT: 'Support' })[type] ?? type;
  }

  statutClass(statut: StatutProcessus): string {
    return statut === 'ACTIF'
      ? 'border-green-600 bg-green-50 text-green-700'
      : 'border-slate-400 bg-slate-50 text-slate-500';
  }

  piloteColor(initiales: string): string {
    const colors = ['#1B5E20','#1565C0','#C62828','#6A1B9A','#00695C','#E65100'];
    const idx = ((initiales.charCodeAt(0) || 0) + (initiales.charCodeAt(1) || 0)) % colors.length;
    return colors[idx];
  }
}
