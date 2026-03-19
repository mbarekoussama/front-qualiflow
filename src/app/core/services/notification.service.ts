import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

export type NotificationType =
  | 'SYSTEM'
  | 'ROLE_CHANGE'
  | 'NON_CONFORMITE'
  | 'ACTION_CORRECTIVE'
  | 'INDICATEUR'
  | 'DOCUMENT'
  | 'PROCEDURE'
  | 'PROCESSUS';

export type NotificationPriority = 'INFO' | 'WARNING' | 'CRITICAL';
export type NotificationFrequency = 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  route?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NotificationPreference {
  receiveSystem: boolean;
  receiveRoleChange: boolean;
  receiveNonConformite: boolean;
  receiveActionCorrective: boolean;
  receiveIndicateur: boolean;
  receiveDocument: boolean;
  receiveProcedure: boolean;
  receiveProcessus: boolean;
  onlyHighPriority: boolean;
  frequency: NotificationFrequency;
  updatedAt?: string;
}

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notifications`;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly items = signal<NotificationItem[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly unreadCount = signal(0);
  readonly preferences = signal<NotificationPreference | null>(null);
  readonly savingPreferences = signal(false);
  readonly sendingSystemUpdate = signal(false);

  async load(filters: NotificationFilters = {}): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      let params = new HttpParams()
        .set('page', String(filters.page ?? 1))
        .set('pageSize', String(filters.pageSize ?? 20));

      if (typeof filters.read === 'boolean') {
        params = params.set('read', String(filters.read));
      }
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.priority) {
        params = params.set('priority', filters.priority);
      }

      const data = await firstValueFrom(
        this.http.get<NotificationListResponse>(`${this.url}/`, { params })
      );

      this.items.set(data.items);
      this.total.set(data.total);
      this.page.set(data.page);
      this.pageSize.set(data.pageSize);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement des notifications');
    } finally {
      this.loading.set(false);
    }
  }

  async loadUnreadCount(): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<{ unreadCount: number }>(`${this.url}/unread-count`));
      this.unreadCount.set(res.unreadCount);
    } catch {
      // silent
    }
  }

  async markAsRead(id: string): Promise<void> {
    await firstValueFrom(this.http.patch<void>(`${this.url}/${id}/read`, {}));

    this.items.update((list) =>
      list.map((item) =>
        item.id === id
          ? { ...item, isRead: true, readAt: new Date().toISOString() }
          : item
      )
    );

    this.unreadCount.update((v) => (v > 0 ? v - 1 : 0));
  }

  async markAllAsRead(): Promise<void> {
    await firstValueFrom(this.http.patch<void>(`${this.url}/read-all`, {}));

    this.items.update((list) =>
      list.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() }))
    );
    this.unreadCount.set(0);
  }

  async loadPreferences(): Promise<void> {
    try {
      const pref = await firstValueFrom(
        this.http.get<NotificationPreference>(`${this.url}/preferences`)
      );
      this.preferences.set(pref);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement des préférences');
    }
  }

  async savePreferences(pref: NotificationPreference): Promise<boolean> {
    this.savingPreferences.set(true);
    this.error.set(null);

    try {
      const saved = await firstValueFrom(
        this.http.put<NotificationPreference>(`${this.url}/preferences`, pref)
      );
      this.preferences.set(saved);
      return true;
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de sauvegarde des préférences');
      return false;
    } finally {
      this.savingPreferences.set(false);
    }
  }

  async sendSystemUpdate(payload: {
    title: string;
    message: string;
    priority: NotificationPriority;
    route?: string;
  }): Promise<boolean> {
    this.sendingSystemUpdate.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.http.post(`${this.url}/system-update`, payload));
      return true;
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la notification système');
      return false;
    } finally {
      this.sendingSystemUpdate.set(false);
    }
  }
}
