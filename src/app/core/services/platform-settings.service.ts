import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment.js';

export type DashboardDefaultPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface PlatformSettings {
  id?: string;
  platformName: string;
  platformDescription?: string | null;
  defaultLanguage: string;
  timezone: string;
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
  enableMaintenanceMode: boolean;
  dashboardDefaultPeriod: DashboardDefaultPeriod;
  dashboardRefreshIntervalSeconds: number;
  dashboardShowKpis: boolean;
  dashboardShowRecentActivities: boolean;
  dashboardShowNotificationsWidget: boolean;
  supportEmail?: string | null;
  supportPhone?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PlatformSettingsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/platform-settings`;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly settings = signal<PlatformSettings | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(
        this.http.get<PlatformSettings>(`${this.url}/`)
      );
      this.settings.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement des paramètres plateforme');
    } finally {
      this.loading.set(false);
    }
  }

  async save(data: PlatformSettings): Promise<boolean> {
    this.saving.set(true);
    this.error.set(null);

    try {
      const payload = {
        platformName: data.platformName,
        platformDescription: data.platformDescription,
        defaultLanguage: data.defaultLanguage,
        timezone: data.timezone,
        enableEmailNotifications: data.enableEmailNotifications,
        enableInAppNotifications: data.enableInAppNotifications,
        enableMaintenanceMode: data.enableMaintenanceMode,
        dashboardDefaultPeriod: data.dashboardDefaultPeriod,
        dashboardRefreshIntervalSeconds: data.dashboardRefreshIntervalSeconds,
        dashboardShowKpis: data.dashboardShowKpis,
        dashboardShowRecentActivities: data.dashboardShowRecentActivities,
        dashboardShowNotificationsWidget: data.dashboardShowNotificationsWidget,
        supportEmail: data.supportEmail,
        supportPhone: data.supportPhone,
        websiteUrl: data.websiteUrl,
        logoUrl: data.logoUrl
      };

      const res = await firstValueFrom(
        this.http.put<{ message: string; settings: PlatformSettings }>(`${this.url}/`, payload)
      );

      this.settings.set(res.settings);
      return true;
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de sauvegarde des paramètres plateforme');
      return false;
    } finally {
      this.saving.set(false);
    }
  }
}
