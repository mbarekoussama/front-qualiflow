import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service.js';
import {
  NotificationFrequency,
  NotificationItem,
  NotificationPriority,
  NotificationService,
  NotificationType
} from '../../core/services/notification.service.js';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  private readonly auth = inject(AuthService);
  readonly notificationService = inject(NotificationService);

  readonly loading = this.notificationService.loading;
  readonly error = this.notificationService.error;
  readonly notifications = this.notificationService.items;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly preferences = this.notificationService.preferences;
  readonly savingPreferences = this.notificationService.savingPreferences;
  readonly sendingSystemUpdate = this.notificationService.sendingSystemUpdate;

  readonly readFilter = signal<'all' | 'read' | 'unread'>('all');
  readonly typeFilter = signal<'ALL' | NotificationType>('ALL');
  readonly priorityFilter = signal<'ALL' | NotificationPriority>('ALL');

  readonly prefModel = signal({
    receiveSystem: true,
    receiveRoleChange: true,
    receiveNonConformite: true,
    receiveActionCorrective: true,
    receiveIndicateur: true,
    receiveDocument: true,
    receiveProcedure: true,
    receiveProcessus: true,
    onlyHighPriority: false,
    frequency: 'IMMEDIATE' as NotificationFrequency
  });

  readonly systemUpdateTitle = signal('');
  readonly systemUpdateMessage = signal('');
  readonly systemUpdatePriority = signal<NotificationPriority>('INFO');
  readonly feedback = signal('');

  readonly isAdmin = computed(() => this.auth.hasRole(['Admin']));

  readonly filteredNotifications = computed(() => {
    const read = this.readFilter();
    const type = this.typeFilter();
    const priority = this.priorityFilter();

    return this.notifications().filter((item) => {
      const readOk =
        read === 'all' || (read === 'read' ? item.isRead : !item.isRead);
      const typeOk = type === 'ALL' || item.type === type;
      const priorityOk = priority === 'ALL' || item.priority === priority;

      return readOk && typeOk && priorityOk;
    });
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.notificationService.load(),
      this.notificationService.loadUnreadCount(),
      this.notificationService.loadPreferences()
    ]);

    const pref = this.preferences();
    if (pref) {
      this.prefModel.set({
        receiveSystem: pref.receiveSystem,
        receiveRoleChange: pref.receiveRoleChange,
        receiveNonConformite: pref.receiveNonConformite,
        receiveActionCorrective: pref.receiveActionCorrective,
        receiveIndicateur: pref.receiveIndicateur,
        receiveDocument: pref.receiveDocument,
        receiveProcedure: pref.receiveProcedure,
        receiveProcessus: pref.receiveProcessus,
        onlyHighPriority: pref.onlyHighPriority,
        frequency: pref.frequency
      });
    }
  }

  async applyFilters(): Promise<void> {
    const type = this.typeFilter();
    const priority = this.priorityFilter();

    await this.notificationService.load({
      read: this.readFilter() === 'all' ? undefined : this.readFilter() === 'read',
      type: type === 'ALL' ? undefined : type,
      priority: priority === 'ALL' ? undefined : priority
    });
  }

  setReadFilter(value: string): void {
    this.readFilter.set((value as 'all' | 'read' | 'unread') || 'all');
  }

  setTypeFilter(value: string): void {
    this.typeFilter.set((value as 'ALL' | NotificationType) || 'ALL');
  }

  setPriorityFilter(value: string): void {
    this.priorityFilter.set((value as 'ALL' | NotificationPriority) || 'ALL');
  }

  setPrefBoolean(key: keyof ReturnType<typeof this.prefModel>, value: boolean): void {
    this.prefModel.update((curr) => ({ ...curr, [key]: value }));
  }

  setPrefFrequency(value: string): void {
    this.prefModel.update((curr) => ({
      ...curr,
      frequency: (value as NotificationFrequency) || 'IMMEDIATE'
    }));
  }

  async savePreferences(): Promise<void> {
    const ok = await this.notificationService.savePreferences(this.prefModel());
    this.feedback.set(ok ? 'Préférences enregistrées.' : 'Échec de sauvegarde.');
  }

  async markAsRead(notification: NotificationItem): Promise<void> {
    if (notification.isRead) return;
    await this.notificationService.markAsRead(notification.id);
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationService.markAllAsRead();
  }

  async sendSystemUpdate(): Promise<void> {
    const title = this.systemUpdateTitle().trim();
    const message = this.systemUpdateMessage().trim();
    if (!title || !message) {
      this.feedback.set('Titre et message sont obligatoires.');
      return;
    }

    const ok = await this.notificationService.sendSystemUpdate({
      title,
      message,
      priority: this.systemUpdatePriority(),
      route: '/dashboard'
    });

    this.feedback.set(ok ? 'Notification système envoyée.' : 'Échec d’envoi.');

    if (ok) {
      this.systemUpdateTitle.set('');
      this.systemUpdateMessage.set('');
    }
  }

  setSystemUpdateTitle(value: string): void {
    this.systemUpdateTitle.set(value);
  }

  setSystemUpdateMessage(value: string): void {
    this.systemUpdateMessage.set(value);
  }

  setSystemUpdatePriority(value: string): void {
    this.systemUpdatePriority.set((value as NotificationPriority) || 'INFO');
  }

  typeLabel(type: NotificationType): string {
    switch (type) {
      case 'SYSTEM':
        return 'Système';
      case 'ROLE_CHANGE':
        return 'Rôle';
      case 'NON_CONFORMITE':
        return 'Non-conformité';
      case 'ACTION_CORRECTIVE':
        return 'Action corrective';
      case 'INDICATEUR':
        return 'Indicateur';
      case 'DOCUMENT':
        return 'Document';
      case 'PROCEDURE':
        return 'Procédure';
      case 'PROCESSUS':
        return 'Processus';
      default:
        return type;
    }
  }

  relativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'À l’instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days} j`;

    return date.toLocaleDateString('fr-FR');
  }
}
