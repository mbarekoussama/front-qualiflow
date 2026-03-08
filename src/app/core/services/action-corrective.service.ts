import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ActionCorrective, StatutActionCorrective } from '../../shared/models/action-corrective.model';

export interface AcFilters {
  nonConformite?: string;
  statut?: StatutActionCorrective;
}

@Injectable({ providedIn: 'root' })
export class ActionCorrectiveService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/actions-correctives`;

  getAll(filters?: AcFilters): Observable<ActionCorrective[]> {
    let params = new HttpParams();
    if (filters?.nonConformite) params = params.set('nonConformite', filters.nonConformite);
    if (filters?.statut) params = params.set('statut', filters.statut);
    return this.http.get<ActionCorrective[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ActionCorrective> {
    return this.http.get<ActionCorrective>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<ActionCorrective>): Observable<ActionCorrective> {
    return this.http.post<ActionCorrective>(this.apiUrl, data);
  }

  update(id: string, data: Partial<ActionCorrective>): Observable<ActionCorrective> {
    return this.http.patch<ActionCorrective>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
