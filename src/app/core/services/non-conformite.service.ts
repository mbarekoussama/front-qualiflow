import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  NonConformite,
  NcApiListItem,
  NcApiDetail,
  NcApiActionCorrective,
  NcApiAnalyseCause,
  NcApiHistorique,
  NcApiPagedResult,
  ActionCorrectiveItem,
  AnalyseCauseItem,
  HistoriqueNcItem,
  NcUserProfil,
  GraviteNC,
  SourceNC,
  StatutNC,
  CreateNcDto,
  AddActionCorrectiveDto,
  UpdateNcStatutDto,
  UpdateActionCorrectiveStatutDto,
} from '../../shared/models/non-conformite.model';

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NcFiltres {
  processusId?: string;
  gravite?: GraviteNC;
  statut?: StatutNC;
  page?: number;
  pageSize?: number;
}

export interface UtilisateurOptionDto {
  id: string;
  nom: string;
  prenom: string;
  initiales: string;
  email: string;
  role: string;
  couleur: string;
}

@Injectable({ providedIn: 'root' })
export class NonConformiteService {
  private readonly http  = inject(HttpClient);
  private readonly url   = `${environment.apiUrl}/non-conformites`;
  private readonly usersUrl = `${environment.apiUrl}/utilisateurs`;

  // ── State signals ──────────────────────────────────────────────────────────
  readonly loading    = signal(false);
  readonly error      = signal<string | null>(null);
  readonly result     = signal<PagedResult<NonConformite> | null>(null);
  readonly selected   = signal<NonConformite | null>(null);
  readonly utilisateurs = signal<UtilisateurOptionDto[]>([]);

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly items    = computed(() => this.result()?.items ?? []);
  readonly total    = computed(() => this.result()?.total ?? 0);
  readonly hasItems = computed(() => this.items().length > 0);

  readonly countOuvertes         = computed(() => this.items().filter(n => n.statut === 'OUVERTE').length);
  readonly countEnCours          = computed(() => this.items().filter(n => n.statut === 'ANALYSE' || n.statut === 'ACTION_EN_COURS').length);
  readonly countCloturees        = computed(() => this.items().filter(n => n.statut === 'CLOTUREE').length);

  // ── Load list ──────────────────────────────────────────────────────────────
  async chargerListe(organisationId: string, filtres: NcFiltres = {}): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams()
        .set('organisationId', organisationId)
        .set('page', String(filtres.page ?? 1))
        .set('pageSize', String(filtres.pageSize ?? 50));

      if (filtres.processusId) params = params.set('processusId', filtres.processusId);
      if (filtres.gravite)     params = params.set('gravite', filtres.gravite);
      if (filtres.statut)      params = params.set('statut', filtres.statut);

      const data = await firstValueFrom(
        this.http.get<NcApiPagedResult>(this.url, { params })
      );

      this.result.set({
        items:    data.items.map(item => this.mapListItem(item)),
        total:    data.total,
        page:     data.page,
        pageSize: data.pageSize,
      });
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur lors du chargement des non-conformités.');
    } finally {
      this.loading.set(false);
    }
  }

  // ── Load detail ────────────────────────────────────────────────────────────
  async chargerDetail(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<NcApiDetail>(`${this.url}/${id}`)
      );
      this.selected.set(this.mapDetail(data));
    } catch (e: any) {
      this.error.set(e?.message ?? 'Non-conformité introuvable.');
    } finally {
      this.loading.set(false);
    }
  }

  // ── Create ─────────────────────────────────────────────────────────────────
  async creer(dto: CreateNcDto): Promise<string | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(this.url, dto)
      );
      return res.id;
    } catch (e: any) {
      this.error.set(e?.error?.errors?.[0]?.message ?? e?.message ?? 'Erreur de création.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  // ── Update statut ──────────────────────────────────────────────────────────
  async mettreAJourStatut(dto: UpdateNcStatutDto): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.patch(`${this.url}/${dto.id}/statut`, dto)
      );
      return true;
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur de mise à jour.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  // ── Add action corrective ──────────────────────────────────────────────────
  async ajouterAction(dto: AddActionCorrectiveDto): Promise<string | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.url}/${dto.ncId}/actions`, dto)
      );
      return res.id;
    } catch (e: any) {
      this.error.set(e?.error?.errors?.[0]?.message ?? e?.message ?? 'Erreur.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async mettreAJourStatutAction(dto: UpdateActionCorrectiveStatutDto): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.patch(`${this.url}/actions/${dto.actionId}/statut`, dto)
      );
      return true;
    } catch (e: any) {
      this.error.set(e?.error?.errors?.[0]?.message ?? e?.message ?? 'Erreur de mise à jour du statut de l\'action.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  // ── Load users ─────────────────────────────────────────────────────────────
  async chargerUtilisateurs(organisationId: string): Promise<void> {
    try {
      const users = await firstValueFrom(
        this.http.get<UtilisateurOptionDto[]>(this.usersUrl, {
          params: new HttpParams().set('organisationId', organisationId)
        })
      );
      this.utilisateurs.set(users);
    } catch { /* silent */ }
  }

  // ── Mapping helpers ────────────────────────────────────────────────────────
  private mapListItem(item: NcApiListItem): NonConformite {
    const responsable = this.buildUserProfil(
      item.responsableId,
      item.responsableNom,
      item.responsableInitiales,
      item.responsableCouleur
    );
    return {
      id:                item.id,
      reference:         item.reference,
      description:       item.description,
      processus:         item.processusNom,
      detectePar:        responsable, // not in list DTO; use responsable as placeholder
      responsable:       responsable,
      dateDetection:     new Date(item.dateDetection),
      priorite:          item.gravite,
      source:            item.source,
      statut:            item.statut,
      avancement:        item.avancement,
      actionsCorrectives: [],
      preuves:           [],
      dateEcheance:      new Date(item.dateEcheance),
      nature:            item.nature,
      type:              item.type,
    };
  }

  private mapDetail(dto: NcApiDetail): NonConformite {
    const detectePar = this.buildUserProfil(
      dto.detecteParId,
      dto.detecteParNom,
      dto.detecteParInitiales,
      dto.detecteParCouleur
    );
    const responsable = this.buildUserProfil(
      dto.responsableId,
      dto.responsableNom,
      dto.responsableInitiales,
      dto.responsableCouleur
    );

    const actions: ActionCorrectiveItem[] = dto.actionsCorrectives.map(a => ({
      id:          a.id,
      type:        a.type,
      description: a.description,
      responsable: this.buildUserProfil(a.responsableId, a.responsableNom, a.responsableInitiales, a.responsableCouleur),
      dateEcheance: new Date(a.dateEcheance),
      statut:      a.statut,
      dateRealisation: a.dateRealisation ? new Date(a.dateRealisation) : null,
    }));

    const analyses: AnalyseCauseItem[] = dto.analysesCauses.map(a => ({
      id:             a.id,
      methodeAnalyse: a.methodeAnalyse,
      description:    a.description,
      dateAnalyse:    new Date(a.dateAnalyse),
      analysePar:     this.buildUserProfil(a.analyseParId, a.analyseParNom, a.analyseParInitiales, ''),
    }));

    const historique: HistoriqueNcItem[] = dto.historique.map(h => ({
      id:              h.id,
      ancienStatut:    h.ancienStatut,
      nouveauStatut:   h.nouveauStatut,
      dateChangement:  new Date(h.dateChangement),
      changeParNom:    h.changeParNom,
      commentaire:     h.commentaire,
    }));

    return {
      id:                dto.id,
      reference:         dto.reference,
      description:       dto.description,
      processus:         dto.processusNom,
      detectePar,
      responsable,
      dateDetection:     new Date(dto.dateDetection),
      priorite:          dto.gravite,
      source:            dto.source,
      causeRacine:       analyses[0]?.description,
      statut:            dto.statut,
      avancement:        dto.avancement,
      actionsCorrectives: actions,
      preuves:           [],
      dateEcheance:      new Date(dto.dateEcheance),
      nature:            dto.nature,
      type:              dto.type,
      analysesCauses:    analyses,
      historique,
    };
  }

  private buildUserProfil(
    id: string, fullNom: string, initiales: string, couleur: string
  ): NcUserProfil {
    const parts = fullNom.trim().split(' ');
    return {
      id,
      prenom:    parts[0] ?? '',
      nom:       parts.slice(1).join(' '),
      initiales: initiales || (fullNom.length > 0
        ? (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
        : ''),
      email:     '',
      role:      '',
      couleur:   couleur || '#2d7a4f',
    };
  }
}

