import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../auth/auth.service.js';
import {
  NotificationItem,
  NotificationService,
  NotificationType
} from '../../services/notification.service.js';

interface NavItem {
  label: string;
  route: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  readonly notifications = this.notificationService.items;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly notificationBadge = computed(() => {
    const c = this.unreadCount();
    return c > 9 ? '9+' : String(c);
  });

  readonly showNotifications = signal(false);
  readonly showProfile = signal(false);
  readonly showMobileNav = signal(false);
  readonly globalSearchQuery = signal('');

  readonly navSections = computed<NavSection[]>(() => {
    const isAdmin = this.authService.hasRole(['Admin']);

    if (isAdmin) {
      return [
        {
          title: 'ADMINISTRATION',
          items: [
            { label: 'Notifications', route: '/notifications' },
            { label: 'Utilisateurs', route: '/admin/utilisateurs' },
            { label: 'Auth & Rôles', route: '/admin/auth-roles' }
          ]
        }
      ];
    }

    const sections: NavSection[] = [
      {
        title: 'GÉNÉRAL',
        items: [
          { label: 'Dashboard', route: '/dashboard' },
          { label: 'Notifications', route: '/notifications' },
          { label: 'Recherche', route: '/recherche' }
        ]
      },
      {
        title: 'GESTION QUALITÉ',
        items: [
          { label: 'Processus', route: '/processus' },
          { label: 'Procédures', route: '/procedures' },
          { label: 'Documents', route: '/documents' },
          { label: 'Non-Conformités', route: '/non-conformites', badge: 4 },
          { label: 'Actions correctives', route: '/actions-correctives' }
        ]
      },
      {
        title: 'PILOTAGE',
        items: [
          { label: 'Indicateurs', route: '/indicateurs' },
        ]
      }
    ];

    return sections;
  });

  readonly userLabel = computed(() => {
    const u = this.currentUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  });

  readonly roleLabel = computed(() => this.currentUser()?.role ?? '');

  async ngOnInit(): Promise<void> {
    await this.notificationService.loadUnreadCount();
  }

  async toggleNotifications(event: Event): Promise<void> {
    event.stopPropagation();
    this.showNotifications.update((v) => !v);
    this.showProfile.set(false);

    if (this.showNotifications()) {
      await this.notificationService.load({ read: false, pageSize: 8 });
      await this.notificationService.loadUnreadCount();
    }
  }

  toggleProfile(event: Event): void {
    event.stopPropagation();
    this.showProfile.update((v) => !v);
    this.showNotifications.set(false);
  }

  toggleMobileNav(): void {
    this.showMobileNav.update((v) => !v);
  }

  closeMobileNav(): void {
    this.showMobileNav.set(false);
  }

  closeDropdowns(): void {
    this.showNotifications.set(false);
    this.showProfile.set(false);
  }

  async markAllRead(): Promise<void> {
    await this.notificationService.markAllAsRead();
  }

  async dismissNotification(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    await this.notificationService.markAsRead(id);
  }

  notifIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      NON_CONFORMITE: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
      ACTION_CORRECTIVE: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      DOCUMENT: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      PROCESSUS: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01',
      PROCEDURE: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01',
      SYSTEM: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      ROLE_CHANGE: 'M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2m12 0H7m5-8a4 4 0 100-8 4 4 0 000 8z',
      INDICATEUR: 'M3 3v18h18M7 15l3-3 2 2 4-6'
    };
    return icons[type];
  }

  notifColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      NON_CONFORMITE: 'bg-red-100 text-red-600',
      ACTION_CORRECTIVE: 'bg-amber-100 text-amber-600',
      DOCUMENT: 'bg-blue-100 text-blue-600',
      PROCESSUS: 'bg-purple-100 text-purple-600',
      PROCEDURE: 'bg-indigo-100 text-indigo-600',
      SYSTEM: 'bg-slate-100 text-slate-500',
      ROLE_CHANGE: 'bg-cyan-100 text-cyan-600',
      INDICATEUR: 'bg-emerald-100 text-emerald-600'
    };
    return colors[type];
  }

  async openNotification(notif: NotificationItem): Promise<void> {
    if (!notif.isRead) {
      await this.notificationService.markAsRead(notif.id);
    }

    this.closeDropdowns();
    if (notif.route) {
      await this.router.navigateByUrl(notif.route);
    }
  }

  notificationTime(isoDate: string): string {
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

  logout(): void {
    this.authService.logout();
  }

  setGlobalSearch(value: string): void {
    this.globalSearchQuery.set(value);
  }

  goToSearch(): void {
    const q = this.globalSearchQuery().trim();

    this.router.navigate(['/recherche'], {
      queryParams: q ? { q } : {},
    });
  }
}
