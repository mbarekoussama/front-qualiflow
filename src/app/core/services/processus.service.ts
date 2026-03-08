import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Processus } from '../../shared/models/processus.model';

export interface ProcessusFilters {
  type?: string;
  statut?: string;
  actif?: boolean;
}

export interface CreateProcessusDto {
  code: string;
  intitule: string;
  type: string;
  clauseISO: string;
  objectif: string;
  perimetre?: string;
  piloteId: string;
  frequenceRevue: string;
  dateCreation?: string;
  prochaineRevue?: string;
  tauxConformite: number;
  indicateurs?: string[];
}

@Injectable({ providedIn: 'root' })
export class ProcessusService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/processus`;

  getAll(filters?: ProcessusFilters): Observable<Processus[]> {
    let params = new HttpParams();
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.actif !== undefined) params = params.set('actif', String(filters.actif));
    return this.http.get<Processus[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Processus> {
    return this.http.get<Processus>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateProcessusDto): Observable<Processus> {
    return this.http.post<Processus>(this.apiUrl, data);
  }

  update(id: string, data: Partial<CreateProcessusDto>): Observable<Processus> {
    return this.http.patch<Processus>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
