import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

interface NavItem {
  label: string;
  route: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export interface AppNotification {
  id: string;
  type: 'nc' | 'action' | 'document' | 'audit' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  route?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  readonly notifications = signal<AppNotification[]>([
    {
      id: 'n-01',
      type: 'nc',
      title: 'Nouvelle non-conformité',
      message: 'NC-2026-008 — Critères d\'évaluation non communiqués aux apprenants',
      time: 'Il y a 15 min',
      read: false,
      route: '/non-conformites'
    },
    {
      id: 'n-02',
      type: 'action',
      title: 'Action corrective en retard',
      message: 'AC-2025-033-01 dépasse son échéance du 31/03/2025',
      time: 'Il y a 2 h',
      read: false,
      route: '/actions-correctives'
    },
    {
      id: 'n-03',
      type: 'document',
      title: 'Document à réviser',
      message: 'PRO-003 — La prochaine révision était prévue le 01/09/2025',
      time: 'Il y a 4 h',
      read: false,
      route: '/documents'
    },
    {
      id: 'n-04',
      type: 'audit',
      title: 'Plan d\'audit S1-2026',
      message: 'Le programme d\'audit semestriel est disponible pour validation',
      time: 'Hier',
      read: true,
      route: '/processus'
    },
    {
      id: 'n-05',
      type: 'system',
      title: 'Mise à jour système',
      message: 'QualiFlow v0.2 déployée — nouvelles fonctionnalités disponibles',
      time: 'Il y a 2 jours',
      read: true
    }
  ]);

  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);
  readonly notificationBadge = computed(() => {
    const c = this.unreadCount();
    return c > 9 ? '9+' : String(c);
  });

  readonly showNotifications = signal(false);
  readonly showProfile = signal(false);
  readonly showMobileNav = signal(false);

  readonly navSections = signal<NavSection[]>([
    {
      title: 'GÉNÉRAL',
      items: [{ label: 'Dashboard', route: '/dashboard' }]
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
        { label: 'Tableau de bord', route: '/tableau-de-bord' }
      ]
    }
  ]);

  readonly userLabel = computed(() => {
    const u = this.currentUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  });

  readonly roleLabel = computed(() => this.currentUser()?.role ?? '');

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications.update((v) => !v);
    this.showProfile.set(false);
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

  markAllRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  dismissNotification(id: string, event: Event): void {
    event.stopPropagation();
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  notifIcon(type: AppNotification['type']): string {
    const icons: Record<AppNotification['type'], string> = {
      nc: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
      action: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      audit: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01',
      system: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    };
    return icons[type];
  }

  notifColor(type: AppNotification['type']): string {
    const colors: Record<AppNotification['type'], string> = {
      nc: 'bg-red-100 text-red-600',
      action: 'bg-amber-100 text-amber-600',
      document: 'bg-blue-100 text-blue-600',
      audit: 'bg-purple-100 text-purple-600',
      system: 'bg-slate-100 text-slate-500'
    };
    return colors[type];
  }

  logout(): void {
    this.authService.logout();
  }
}
