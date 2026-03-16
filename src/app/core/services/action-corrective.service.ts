import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ActionCorrectiveListItemDto,
  ActionCorrectiveDetailDto,
  AddActionCorrectiveDto,
  UpdateActionCorrectiveDto,
  UpdateActionCorrectiveStatutDto,
  PagedResultAc,
  StatutAction,
} from '../../shared/models/action-corrective.model';

export interface AcFiltres {
  statut?: StatutAction;
  ncId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ActionCorrectiveService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/actions-correctives`;
  private readonly ncUrl = `${environment.apiUrl}/non-conformites`;

  // ── State ────────────────────────────────────────────────────────────────────
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  readonly result   = signal<PagedResultAc | null>(null);
  readonly selected = signal<ActionCorrectiveDetailDto | null>(null);

  // ── Computed ─────────────────────────────────────────────────────────────────
  readonly items      = computed(() => this.result()?.items ?? []);
  readonly total      = computed(() => this.result()?.total ?? 0);
  readonly hasItems   = computed(() => this.items().length > 0);

  readonly countPlanifiees = computed(() =>
    this.items().filter(a => a.statut === 'PLANIFIEE').length);
  readonly countEnCours    = computed(() =>
    this.items().filter(a => a.statut === 'EN_COURS').length);
  readonly countRealisees  = computed(() =>
    this.items().filter(a => a.statut === 'REALISEE' || a.statut === 'VERIFIEE').length);

  // ── List ─────────────────────────────────────────────────────────────────────
  async chargerListe(organisationId: string, filtres: AcFiltres = {}): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams().set('organisationId', organisationId);
      if (filtres.statut)   params = params.set('statut',   filtres.statut);
      if (filtres.ncId)     params = params.set('ncId',     filtres.ncId);
      if (filtres.page)     params = params.set('page',     filtres.page);
      if (filtres.pageSize) params = params.set('pageSize', filtres.pageSize);

      const res = await firstValueFrom(
        this.http.get<PagedResultAc>(this.url, { params })
      );
      this.result.set(res);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur lors du chargement');
    } finally {
      this.loading.set(false);
    }
  }

  // ── Detail ────────────────────────────────────────────────────────────────────
  async chargerDetail(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const dto = await firstValueFrom(
        this.http.get<ActionCorrectiveDetailDto>(`${this.url}/${id}`)
      );
      this.selected.set(dto);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erreur');
    } finally {
      this.loading.set(false);
    }
  }

  // ── Create (via NC) ───────────────────────────────────────────────────────────
  async creer(ncId: string, dto: Omit<AddActionCorrectiveDto, 'ncId'>): Promise<string> {
    const body: AddActionCorrectiveDto = { ncId, ...dto };
    const res = await firstValueFrom(
      this.http.post<{ id: string }>(`${this.ncUrl}/${ncId}/actions`, body)
    );
    return res.id;
  }

  // ── Update ────────────────────────────────────────────────────────────────────
  async modifier(id: string, dto: Omit<UpdateActionCorrectiveDto, 'id'>): Promise<void> {
    await firstValueFrom(
      this.http.put<void>(`${this.url}/${id}`, { id, ...dto })
    );
    // refresh list item
    await this.chargerDetail(id);
  }

  // ── Update Statut ─────────────────────────────────────────────────────────────
  async changerStatut(actionId: string, nouveauStatut: StatutAction): Promise<void> {
    const body: UpdateActionCorrectiveStatutDto = { actionId, nouveauStatut };
    await firstValueFrom(
      this.http.patch<void>(`${this.url}/${actionId}/statut`, body)
    );
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  async supprimer(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
    // Remove from local list
    const current = this.result();
    if (current) {
      this.result.set({
        ...current,
        items: current.items.filter(a => a.id !== id),
        total: current.total - 1,
      });
    }
  }
}

