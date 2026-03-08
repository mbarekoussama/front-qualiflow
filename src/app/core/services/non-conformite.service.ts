import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  NonConformite,
  PrioriteNonConformite,
  StatutNonConformite
} from '../../shared/models/non-conformite.model';

export interface NcFilters {
  processus?: string;
  priorite?: PrioriteNonConformite;
  statut?: StatutNonConformite;
}

@Injectable({ providedIn: 'root' })
export class NonConformiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/non-conformites`;

  getAll(filters?: NcFilters): Observable<NonConformite[]> {
    let params = new HttpParams();
    if (filters?.processus) params = params.set('processus', filters.processus);
    if (filters?.priorite) params = params.set('priorite', filters.priorite);
    if (filters?.statut) params = params.set('statut', filters.statut);
    return this.http.get<NonConformite[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<NonConformite> {
    return this.http.get<NonConformite>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<NonConformite>): Observable<NonConformite> {
    return this.http.post<NonConformite>(this.apiUrl, data);
  }

  update(id: string, data: Partial<NonConformite>): Observable<NonConformite> {
    return this.http.patch<NonConformite>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
