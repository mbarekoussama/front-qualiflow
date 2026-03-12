import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateProcedureDto,
  PagedResult,
  ProcedureDetail,
  ProcedureFiltres,
  ProcedureListItem,
  UpdateProcedureDto,
} from '../../shared/models/procedure.model';

@Injectable({ providedIn: 'root' })
export class ProcedureService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/procedures`;

  // ── State signals ──────────────────────────────────────────
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  readonly result   = signal<PagedResult<ProcedureListItem> | null>(null);
  readonly selected = signal<ProcedureDetail | null>(null);

  // ── Computed ───────────────────────────────────────────────
  readonly items    = computed(() => this.result()?.items ?? []);
  readonly total    = computed(() => this.result()?.total ?? 0);
  readonly hasItems = computed(() => this.items().length > 0);

  // ── API methods ────────────────────────────────────────────

  async chargerListe(
    organisationId: string,
    filtres: ProcedureFiltres = {}
  ): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams()
        .set('organisationId', organisationId)
        .set('page',     String(filtres.page     ?? 1))
        .set('pageSize', String(filtres.pageSize ?? 20));

      if (filtres.search)      params = params.set('search',      filtres.search);
      if (filtres.processusId) params = params.set('processusId', filtres.processusId);
      if (filtres.statut)      params = params.set('statut',      filtres.statut);

      const data = await firstValueFrom(
        this.http.get<PagedResult<ProcedureListItem>>(this.url, { params })
      );
      this.result.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  async chargerParId(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<ProcedureDetail>(`${this.url}/${id}`)
      );
      this.selected.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  async creer(dto: CreateProcedureDto): Promise<string> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(this.url, dto)
      );
      return res.id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de création';
      this.error.set(msg);
      throw new Error(msg);
    } finally {
      this.loading.set(false);
    }
  }

  async modifier(dto: UpdateProcedureDto): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.put(`${this.url}/${dto.id}`, dto)
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de modification';
      this.error.set(msg);
      throw new Error(msg);
    } finally {
      this.loading.set(false);
    }
  }

  async supprimer(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.http.delete(`${this.url}/${id}`));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de suppression';
      this.error.set(msg);
      throw new Error(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
