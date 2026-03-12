import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ActeurInfo,
  CreateProcessusDto,
  PagedResult,
  Processus,
  ProcessusFiltres,
  ProcessusListItem,
  TypeActeur,
  UpdateProcessusDto
} from '../../shared/models/processus.model';

@Injectable({ providedIn: 'root' })
export class ProcessusService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/processus`;

  // ── State signals ──────────────────────────────────────────
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  readonly result   = signal<PagedResult<ProcessusListItem> | null>(null);
  readonly selected = signal<Processus | null>(null);

  // ── Computed ───────────────────────────────────────────────
  readonly items    = computed(() => this.result()?.items ?? []);
  readonly total    = computed(() => this.result()?.total ?? 0);
  readonly hasItems = computed(() => this.items().length > 0);

  readonly statsByType = computed(() => ({
    pilotage   : this.items().filter(p => p.type === 'PILOTAGE').length,
    realisation: this.items().filter(p => p.type === 'REALISATION').length,
    support    : this.items().filter(p => p.type === 'SUPPORT').length,
    actifs     : this.items().filter(p => p.statut === 'ACTIF').length,
  }));

  // ── API methods ────────────────────────────────────────────

  async chargerListe(
    organisationId: string,
    filtres: ProcessusFiltres = {}
  ): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams()
        .set('organisationId', organisationId)
        .set('page', String(filtres.page ?? 1))
        .set('pageSize', String(filtres.pageSize ?? 20));

      if (filtres.search)  params = params.set('search', filtres.search);
      if (filtres.type)    params = params.set('type', filtres.type);
      if (filtres.statut)  params = params.set('statut', filtres.statut);

      const data = await firstValueFrom(
        this.http.get<PagedResult<ProcessusListItem>>(this.url, { params })
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
        this.http.get<Processus>(`${this.url}/${id}`)
      );
      this.selected.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  async creer(dto: CreateProcessusDto): Promise<string> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(this.url, dto)
      );
      return res.id;
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de création');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async modifier(id: string, dto: UpdateProcessusDto): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.put<void>(`${this.url}/${id}`, { ...dto, id })
      );
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de modification');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async supprimer(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de suppression');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async ajouterActeur(
    processusId: string,
    utilisateurId: string,
    typeActeur: TypeActeur,
    organisationId: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.post<{ acteurId: string }>(
        `${this.url}/${processusId}/acteurs`,
        { processusId, organisationId, utilisateurId, typeActeur }
      )
    );
  }

  async retirerActeur(
    processusId: string,
    utilisateurId: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(
        `${this.url}/${processusId}/acteurs/${utilisateurId}`
      )
    );
  }

  async chargerActeurs(processusId: string): Promise<ActeurInfo[]> {
    return firstValueFrom(
      this.http.get<ActeurInfo[]>(`${this.url}/${processusId}/acteurs`)
    );
  }
}
