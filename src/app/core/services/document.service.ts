import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AjouterVersionDto,
  ChangerStatutVersionDto,
  CreateDocumentDto,
  DocumentDetail,
  DocumentFiltres,
  DocumentListItem,
  PagedResult,
  UpdateDocumentDto,
} from '../../shared/models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/documents`;

  // ── State signals ──────────────────────────────────────────
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  readonly result   = signal<PagedResult<DocumentListItem> | null>(null);
  readonly selected = signal<DocumentDetail | null>(null);

  // ── Computed ───────────────────────────────────────────────
  readonly items    = computed(() => this.result()?.items ?? []);
  readonly total    = computed(() => this.result()?.total ?? 0);
  readonly hasItems = computed(() => this.items().length > 0);

  // ── API methods ────────────────────────────────────────────

  async chargerListe(
    organisationId: string,
    filtres: DocumentFiltres = {}
  ): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams()
        .set('organisationId', organisationId)
        .set('page', String(filtres.page ?? 1))
        .set('pageSize', String(filtres.pageSize ?? 20));

      if (filtres.search)      params = params.set('search', filtres.search);
      if (filtres.type)        params = params.set('type', filtres.type);
      if (filtres.statut)      params = params.set('statut', filtres.statut);
      if (filtres.processusId) params = params.set('processusId', filtres.processusId);

      const data = await firstValueFrom(
        this.http.get<PagedResult<DocumentListItem>>(this.url, { params })
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
        this.http.get<DocumentDetail>(`${this.url}/${id}`)
      );
      this.selected.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  async creer(dto: CreateDocumentDto): Promise<string> {
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

  async modifier(id: string, dto: UpdateDocumentDto): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.http.put(`${this.url}/${id}`, dto));
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
      await firstValueFrom(this.http.delete(`${this.url}/${id}`));
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de suppression');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async ajouterVersion(dto: AjouterVersionDto): Promise<string> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.url}/${dto.documentId}/versions`, dto)
      );
      return res.id;
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur ajout version');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async changerStatutVersion(versionId: string, dto: ChangerStatutVersionDto): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.put(`${this.url}/versions/${versionId}/statut`, dto)
      );
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur changement statut');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }
}
