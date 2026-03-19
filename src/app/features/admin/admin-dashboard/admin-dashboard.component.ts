import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service.js';
import { AdminUserService } from '../../../core/services/admin-user.service.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly adminUserService = inject(AdminUserService);

  readonly loading = this.adminUserService.loading;
  readonly error = this.adminUserService.error;
  readonly users = this.adminUserService.users;
  readonly roleStats = this.adminUserService.roleStats;
  readonly total = this.adminUserService.total;
  readonly privilegedCount = this.adminUserService.privilegedCount;

  readonly roleFilter = signal('Tous');
  readonly search = signal('');

  readonly organisationId = computed(() => this.auth.organisationId() ?? '');
  readonly currentRole = computed(() => this.auth.currentUser()?.role ?? '');
  readonly isAdminScope = computed(() => this.auth.hasRole(['Admin']));

  readonly roleFilterOptions = computed(() => [
    'Tous',
    ...[...new Set(this.users().map((user) => user.role))].sort(
      (a, b) => this.rolePriority(a) - this.rolePriority(b)
    )
  ]);

  readonly filteredUsers = computed(() => {
    const roleFilter = this.roleFilter();
    const search = this.search().trim().toLowerCase();

    return this.users()
      .filter((user) => {
        const roleMatch = roleFilter === 'Tous' || user.role === roleFilter;
        const textMatch =
          !search ||
          `${user.prenom} ${user.nom}`.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          (user.fonction ?? '').toLowerCase().includes(search);

        return roleMatch && textMatch;
      })
      .sort((a, b) => {
        const byRole = this.rolePriority(a.role) - this.rolePriority(b.role);
        if (byRole !== 0) return byRole;
        return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr', {
          sensitivity: 'base'
        });
      });
  });

  readonly orderedRoleStats = computed(() =>
    [...this.roleStats()].sort((a, b) => {
      const byRole = this.rolePriority(a.role) - this.rolePriority(b.role);
      if (byRole !== 0) return byRole;
      return b.count - a.count;
    })
  );

  readonly auditorsCount = computed(() =>
    this.users().filter((u) => u.role === 'AUDITEUR' || u.role === 'Auditeur').length
  );

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const orgId = this.organisationId();
    if (!orgId) return;
    await this.adminUserService.loadUsers(orgId);
  }

  setRoleFilter(value: string): void {
    this.roleFilter.set(value);
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  roleBadgeClass(role: string): string {
    if (role === 'ADMIN_ORG' || role === 'Admin') return 'bg-emerald-100 text-emerald-700';
    if (role === 'RESPONSABLE_SMQ' || role === 'Responsable Qualité') return 'bg-teal-100 text-teal-700';
    if (role === 'AUDITEUR' || role === 'Auditeur') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-600';
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN_ORG: 'Admin',
      RESPONSABLE_SMQ: 'Responsable Qualité',
      AUDITEUR: 'Auditeur',
      UTILISATEUR: 'Utilisateur',
      Admin: 'Admin',
      'Responsable Qualité': 'Responsable Qualité',
      Auditeur: 'Auditeur',
      Pilote: 'Pilote',
      Lecteur: 'Lecteur'
    };

    return labels[role] ?? role;
  }

  private rolePriority(role: string): number {
    if (role === 'ADMIN_ORG' || role === 'Admin') return 1;
    if (role === 'RESPONSABLE_SMQ' || role === 'Responsable Qualité') return 2;
    if (role === 'AUDITEUR' || role === 'Auditeur') return 3;
    if (role === 'UTILISATEUR' || role === 'Lecteur' || role === 'Pilote') return 4;
    return 99;
  }
}
