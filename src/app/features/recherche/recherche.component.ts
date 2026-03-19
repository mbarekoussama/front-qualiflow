import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service.js';
import { ActionCorrectiveService } from '../../core/services/action-corrective.service.js';
import { DocumentService } from '../../core/services/document.service.js';
import { IndicateurService } from '../../core/services/indicateur.service.js';
import { NonConformiteService } from '../../core/services/non-conformite.service.js';
import { ProcedureService } from '../../core/services/procedure.service.js';
import { ProcessusService } from '../../core/services/processus.service.js';

export type SearchModule =
  | 'Tous'
  | 'Processus'
  | 'Procédures'
  | 'Documents'
  | 'Non-conformités'
  | 'Indicateurs'
  | 'Actions correctives';

interface SearchResultItem {
  id: string;
  module: Exclude<SearchModule, 'Tous'>;
  titre: string;
  description: string;
  statut: string;
  date: Date | null;
  tags: string[];
  route: string;
  gravite?: string;
  typeProcessus?: string;
}

@Component({
  selector: 'app-recherche',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recherche.component.html',
  styleUrl: './recherche.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RechercheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly processusService = inject(ProcessusService);
  private readonly procedureService = inject(ProcedureService);
  private readonly documentService = inject(DocumentService);
  private readonly ncService = inject(NonConformiteService);
  private readonly indicateurService = inject(IndicateurService);
  private readonly actionCorrectiveService = inject(ActionCorrectiveService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly loaded = signal(false);

  readonly query = signal('');
  readonly moduleFilter = signal<SearchModule>('Tous');
  readonly statutFilter = signal('Tous');
  readonly graviteFilter = signal('Tous');
  readonly typeProcessusFilter = signal('Tous');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  readonly allResults = signal<SearchResultItem[]>([]);

  readonly modules: SearchModule[] = [
    'Tous',
    'Processus',
    'Procédures',
    'Documents',
    'Non-conformités',
    'Indicateurs',
    'Actions correctives'
  ];

  readonly statuts = computed(() => [
    'Tous',
    ...new Set(this.allResults().map((r) => r.statut).filter(Boolean))
  ]);

  readonly gravites = computed(() => [
    'Tous',
    ...new Set(this.allResults().map((r) => r.gravite).filter(Boolean) as string[])
  ]);

  readonly typesProcessus = computed(() => [
    'Tous',
    ...new Set(this.allResults().map((r) => r.typeProcessus).filter(Boolean) as string[])
  ]);

  readonly filteredResults = computed(() => {
    const query = this.query().trim().toLowerCase();
    const moduleFilter = this.moduleFilter();
    const statutFilter = this.statutFilter();
    const graviteFilter = this.graviteFilter();
    const typeProcessusFilter = this.typeProcessusFilter();
    const from = this.dateFrom() ? new Date(this.dateFrom()) : null;
    const to = this.dateTo() ? new Date(this.dateTo()) : null;

    return this.allResults().filter((item) => {
      const queryOk =
        !query ||
        item.titre.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query));

      const moduleOk = moduleFilter === 'Tous' || item.module === moduleFilter;
      const statutOk = statutFilter === 'Tous' || item.statut === statutFilter;
      const graviteOk = graviteFilter === 'Tous' || item.gravite === graviteFilter;
      const typeProcessusOk =
        typeProcessusFilter === 'Tous' || item.typeProcessus === typeProcessusFilter;

      const dateOk = (() => {
        if (!item.date) return !from && !to;
        if (from && item.date < from) return false;
        if (to) {
          const toEnd = new Date(to);
          toEnd.setHours(23, 59, 59, 999);
          if (item.date > toEnd) return false;
        }
        return true;
      })();

      return queryOk && moduleOk && statutOk && graviteOk && typeProcessusOk && dateOk;
    });
  });

  readonly summary = computed(() => {
    const all = this.filteredResults();
    return {
      total: all.length,
      processus: all.filter((r) => r.module === 'Processus').length,
      procedures: all.filter((r) => r.module === 'Procédures').length,
      documents: all.filter((r) => r.module === 'Documents').length,
      nc: all.filter((r) => r.module === 'Non-conformités').length,
      indicateurs: all.filter((r) => r.module === 'Indicateurs').length,
      actions: all.filter((r) => r.module === 'Actions correctives').length
    };
  });

  async ngOnInit(): Promise<void> {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const q = params.get('q') ?? '';
        this.query.set(q);
      });

    await this.loadAll();
  }

  async loadAll(): Promise<void> {
    const orgId = this.auth.organisationId() ?? '';
    if (!orgId) {
      this.error.set('Organisation introuvable pour la recherche.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await Promise.all([
        this.processusService.chargerListe(orgId, { page: 1, pageSize: 200 }),
        this.procedureService.chargerListe(orgId, { page: 1, pageSize: 200 }),
        this.documentService.chargerListe(orgId, { page: 1, pageSize: 200 }),
        this.ncService.chargerListe(orgId, { page: 1, pageSize: 200 }),
        this.indicateurService.chargerListe(orgId),
        this.actionCorrectiveService.chargerListe(orgId, { page: 1, pageSize: 200 })
      ]);

      const results: SearchResultItem[] = [
        ...this.processusService.items().map((p) => ({
          id: p.id,
          module: 'Processus' as const,
          titre: `${p.code} · ${p.nom}`,
          description: p.description ?? '',
          statut: p.statut,
          date: null,
          tags: [p.type, p.piloteNomComplet],
          route: `/processus/${p.id}`,
          typeProcessus: p.type
        })),
        ...this.procedureService.items().map((p: { id: any; code: any; titre: any; objectif: any; statut: any; dateCreation: string | number | Date; processusCode: any; processusNom: any; responsableNom: any; }) => ({
          id: p.id,
          module: 'Procédures' as const,
          titre: `${p.code} · ${p.titre}`,
          description: p.objectif ?? '',
          statut: p.statut,
          date: p.dateCreation ? new Date(p.dateCreation) : null,
          tags: [p.processusCode, p.processusNom, p.responsableNom],
          route: `/procedures/${p.id}`
        })),
        ...this.documentService.items().map((d) => ({
          id: d.id,
          module: 'Documents' as const,
          titre: `${d.code} · ${d.titre}`,
          description: d.typeDocument,
          statut: d.statutDerniereVersion,
          date: d.dateCreation ? new Date(d.dateCreation) : null,
          tags: [d.typeDocument, d.processusCode ?? '', d.etabliParNom],
          route: `/documents/${d.id}`
        })),
        ...this.ncService.items().map((n) => ({
          id: n.id,
          module: 'Non-conformités' as const,
          titre: n.reference,
          description: n.description,
          statut: n.statut,
          date: n.dateDetection,
          tags: [n.processus, n.source],
          route: `/non-conformites/${n.id}`,
          gravite: n.priorite
        })),
        ...this.indicateurService.items().map((i) => ({
          id: i.id,
          module: 'Indicateurs' as const,
          titre: `${i.code} · ${i.nom}`,
          description: i.description ?? '',
          statut: i.statut,
          date: i.dateCreation,
          tags: [i.processusNom, i.frequenceMesure, i.responsable.prenom + ' ' + i.responsable.nom],
          route: `/indicateurs/${i.id}`
        })),
        ...this.actionCorrectiveService.items().map((a) => ({
          id: a.id,
          module: 'Actions correctives' as const,
          titre: `${a.ncReference} · ${a.type}`,
          description: a.description,
          statut: a.statut,
          date: a.dateEcheance ? new Date(a.dateEcheance) : null,
          tags: [a.responsableNom, a.ncDescription],
          route: '/actions-correctives'
        }))
      ];

      this.allResults.set(results);
      this.loaded.set(true);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement du module de recherche.');
    } finally {
      this.loading.set(false);
    }
  }

  setQuery(value: string): void {
    this.query.set(value);
    const q = value.trim();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: q ? { q } : { q: null },
      queryParamsHandling: 'merge'
    });
  }

  setModuleFilter(value: string): void {
    this.moduleFilter.set((value as SearchModule) || 'Tous');
  }

  setStatutFilter(value: string): void {
    this.statutFilter.set(value || 'Tous');
  }

  setGraviteFilter(value: string): void {
    this.graviteFilter.set(value || 'Tous');
  }

  setTypeProcessusFilter(value: string): void {
    this.typeProcessusFilter.set(value || 'Tous');
  }

  setDateFrom(value: string): void {
    this.dateFrom.set(value);
  }

  setDateTo(value: string): void {
    this.dateTo.set(value);
  }

  resetFilters(): void {
    this.query.set('');
    this.moduleFilter.set('Tous');
    this.statutFilter.set('Tous');
    this.graviteFilter.set('Tous');
    this.typeProcessusFilter.set('Tous');
    this.dateFrom.set('');
    this.dateTo.set('');
  }
}
