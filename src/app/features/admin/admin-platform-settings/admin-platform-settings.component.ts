import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import {
  DashboardDefaultPeriod,
  PlatformSettings,
  PlatformSettingsService
} from '../../../core/services/platform-settings.service.js';

@Component({
  selector: 'app-admin-platform-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-platform-settings.component.html',
  styleUrl: './admin-platform-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPlatformSettingsComponent implements OnInit {
  private readonly platformSettingsService = inject(PlatformSettingsService);

  readonly loading = this.platformSettingsService.loading;
  readonly saving = this.platformSettingsService.saving;
  readonly error = this.platformSettingsService.error;
  readonly feedback = signal('');

  readonly periodOptions: { value: DashboardDefaultPeriod; label: string }[] = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Année' }
  ];

  readonly form = signal<PlatformSettings>({
    platformName: 'QualiFlow',
    platformDescription: '',
    defaultLanguage: 'fr',
    timezone: 'Africa/Casablanca',
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    enableMaintenanceMode: false,
    dashboardDefaultPeriod: 'month',
    dashboardRefreshIntervalSeconds: 60,
    dashboardShowKpis: true,
    dashboardShowRecentActivities: true,
    dashboardShowNotificationsWidget: true,
    supportEmail: '',
    supportPhone: '',
    websiteUrl: '',
    logoUrl: ''
  });

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.feedback.set('');
    await this.platformSettingsService.load();

    const settings = this.platformSettingsService.settings();
    if (!settings) return;

    this.form.set({
      ...settings,
      platformDescription: settings.platformDescription ?? '',
      supportEmail: settings.supportEmail ?? '',
      supportPhone: settings.supportPhone ?? '',
      websiteUrl: settings.websiteUrl ?? '',
      logoUrl: settings.logoUrl ?? ''
    });
  }

  setTextField(
    field:
      | 'platformName'
      | 'platformDescription'
      | 'defaultLanguage'
      | 'timezone'
      | 'supportEmail'
      | 'supportPhone'
      | 'websiteUrl'
      | 'logoUrl',
    value: string
  ): void {
    this.form.update((curr) => ({ ...curr, [field]: value }));
  }

  setBoolField(
    field:
      | 'enableEmailNotifications'
      | 'enableInAppNotifications'
      | 'enableMaintenanceMode'
      | 'dashboardShowKpis'
      | 'dashboardShowRecentActivities'
      | 'dashboardShowNotificationsWidget',
    value: boolean
  ): void {
    this.form.update((curr) => ({ ...curr, [field]: value }));
  }

  setDashboardPeriod(value: string): void {
    const normalized: DashboardDefaultPeriod =
      value === 'day' || value === 'week' || value === 'month' || value === 'quarter' || value === 'year'
        ? value
        : 'month';

    this.form.update((curr) => ({ ...curr, dashboardDefaultPeriod: normalized }));
  }

  setRefreshInterval(value: string): void {
    const parsed = Number.parseInt(value, 10);
    const interval = Number.isFinite(parsed) ? Math.min(3600, Math.max(10, parsed)) : 60;

    this.form.update((curr) => ({ ...curr, dashboardRefreshIntervalSeconds: interval }));
  }

  async save(): Promise<void> {
    this.feedback.set('');
    const ok = await this.platformSettingsService.save(this.form());
    this.feedback.set(ok ? 'Paramètres enregistrés avec succès.' : 'Échec de sauvegarde des paramètres.');
  }
}
