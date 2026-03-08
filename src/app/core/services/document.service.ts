import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Document, DocumentType, StatutDocument } from '../../shared/models/document.model';

export interface DocumentFilters {
  type?: DocumentType;
  statut?: StatutDocument;
  processus?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/documents`;

  getAll(filters?: DocumentFilters): Observable<Document[]> {
    let params = new HttpParams();
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.processus) params = params.set('processus', filters.processus);
    return this.http.get<Document[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Document>): Observable<Document> {
    return this.http.post<Document>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Document>): Observable<Document> {
    return this.http.patch<Document>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
