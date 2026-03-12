import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TypeDocument, StatutVersion } from '../../../shared/models/document.model';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './document-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentListComponent implements OnInit {
  readonly svc  = inject(DocumentService);
  private readonly auth = inject(AuthService);

  readonly orgId = this.auth.organisationId() ?? '00000000-0000-0000-0000-000000000001';

  readonly typeFilter   = signal<TypeDocument | 'Tous'>('Tous');
  readonly statutFilter = signal<StatutVersion | 'Tous'>('Tous');
  readonly searchQuery  = signal('');

  readonly filteredDocuments = computed(() => {
    const query  = this.searchQuery().toLowerCase();
    const type   = this.typeFilter();
    const statut = this.statutFilter();
    return this.svc.items().filter((d) => {
      const typeOk   = type   === 'Tous' || d.typeDocument === type;
      const statOk   = statut === 'Tous' || d.statutDerniereVersion === statut;
      const searchOk = !query  || d.titre.toLowerCase().includes(query) || d.code.toLowerCase().includes(query);
      return typeOk && statOk && searchOk;
    });
  });

  async ngOnInit() {
    await this.svc.chargerListe(this.orgId);
  }

  updateTypeFilter(v: string): void   { this.typeFilter.set(v as TypeDocument | 'Tous'); }
  updateStatutFilter(v: string): void { this.statutFilter.set(v as StatutVersion | 'Tous'); }
  updateSearch(v: string): void       { this.searchQuery.set(v); }

  typeClass(type: TypeDocument): string {
    const map: Record<TypeDocument, string> = {
      'REFERENCE': 'bg-purple-100 text-purple-700',
      'TRAVAIL':   'bg-blue-100 text-blue-700',
    };
    return map[type] ?? 'bg-slate-100 text-slate-600';
  }

  typeLabel(type: TypeDocument): string {
    return type === 'REFERENCE' ? 'Référence' : 'Travail';
  }

  statutClass(statut: StatutVersion): string {
    const map: Record<StatutVersion, string> = {
      BROUILLON:   'bg-amber-100 text-amber-700',
      EN_REVISION: 'bg-blue-100 text-blue-700',
      VALIDE:      'bg-emerald-100 text-emerald-700',
      OBSOLETE:    'bg-slate-100 text-slate-500',
    };
    return map[statut] ?? 'bg-slate-100 text-slate-500';
  }
}
