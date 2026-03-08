import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Indicateur, ValeurIndicateur } from '../../shared/models/indicateur.model';

export interface IndicateurFilters {
  processus?: string;
}

@Injectable({ providedIn: 'root' })
export class IndicateurService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/indicateurs`;

  getAll(filters?: IndicateurFilters): Observable<Indicateur[]> {
    let params = new HttpParams();
    if (filters?.processus) params = params.set('processus', filters.processus);
    return this.http.get<Indicateur[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Indicateur> {
    return this.http.get<Indicateur>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Indicateur>): Observable<Indicateur> {
    return this.http.post<Indicateur>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Indicateur>): Observable<Indicateur> {
    return this.http.patch<Indicateur>(`${this.apiUrl}/${id}`, data);
  }

  addValeur(id: string, valeur: Partial<ValeurIndicateur>): Observable<Indicateur> {
    return this.http.post<Indicateur>(`${this.apiUrl}/${id}/valeurs`, valeur);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
