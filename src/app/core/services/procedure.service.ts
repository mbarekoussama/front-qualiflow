import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Procedure, CreateProcedureDto } from '../../shared/models/procedure.model';

export interface ProcedureFilters {
  processusParent?: string;
  statut?: string;
}

@Injectable({ providedIn: 'root' })
export class ProcedureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/procedures`;

  getAll(filters?: ProcedureFilters): Observable<Procedure[]> {
    let params = new HttpParams();
    if (filters?.processusParent) params = params.set('processusParent', filters.processusParent);
    if (filters?.statut) params = params.set('statut', filters.statut);
    return this.http.get<Procedure[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Procedure> {
    return this.http.get<Procedure>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateProcedureDto): Observable<Procedure> {
    return this.http.post<Procedure>(this.apiUrl, data);
  }

  update(id: string, data: Partial<CreateProcedureDto>): Observable<Procedure> {
    return this.http.patch<Procedure>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
