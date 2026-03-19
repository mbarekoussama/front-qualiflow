import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service.js';
import { AdminUser, AdminUserService, AssignableRole } from '../../../core/services/admin-user.service.js';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsersComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly adminUserService = inject(AdminUserService);

  readonly loading = this.adminUserService.loading;
  readonly error = this.adminUserService.error;
  readonly users = this.adminUserService.users;

  readonly search = signal('');
  readonly selectedUserId = signal<string | null>(null);
  readonly selectedRole = signal<AssignableRole>('UTILISATEUR');
  readonly selectedFonction = signal('');
  readonly saving = signal(false);
  readonly saveMessage = signal('');

  readonly isAdminScope = computed(() => this.auth.hasRole(['Admin']));

  readonly roleOptions: { value: AssignableRole; label: string }[] = [
    { value: 'RESPONSABLE_SMQ', label: 'Responsable Qualité' },
    { value: 'UTILISATEUR', label: 'Chef de service / Utilisateur' },
    { value: 'AUDITEUR', label: 'Auditeur' },
    { value: 'ADMIN_ORG', label: 'Admin' }
  ];

  readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();

    return this.users()
      .filter((u) => {
        if (!query) return true;
        return (
          `${u.prenom} ${u.nom}`.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.fonction ?? '').toLowerCase().includes(query) ||
          (u.organisationNom ?? '').toLowerCase().includes(query) ||
          (u.organisationCode ?? '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr', { sensitivity: 'base' }));
  });

  readonly selectedUser = computed(() => {
    const id = this.selectedUserId();
    return id ? this.users().find((u) => u.id === id) ?? null : null;
  });

  private readonly _syncSelection = effect(() => {
    const user = this.selectedUser();
    if (!user) return;

    this.selectedRole.set(this.normalizeRole(user.role));
    this.selectedFonction.set(user.fonction ?? '');
  });

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.saveMessage.set('');
    await this.adminUserService.loadPlatformUsers();

    const currentSelection = this.selectedUserId();
    const users = this.users();
    if (!currentSelection && users.length > 0) {
      this.selectedUserId.set(users[0].id);
      return;
    }

    if (currentSelection && !users.some((u) => u.id === currentSelection)) {
      this.selectedUserId.set(users[0]?.id ?? null);
    }
  }

  pickUser(user: AdminUser): void {
    this.saveMessage.set('');
    this.selectedUserId.set(user.id);
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setRole(value: string): void {
    this.selectedRole.set(this.normalizeRole(value));
  }

  setFonction(value: string): void {
    this.selectedFonction.set(value);
  }

  async saveRole(): Promise<void> {
    const user = this.selectedUser();
    if (!user) return;

    this.saving.set(true);
    this.saveMessage.set('');

    const ok = await this.adminUserService.updateUserRole(
      user.id,
      this.selectedRole(),
      this.selectedFonction()
    );

    if (ok) {
      this.saveMessage.set('Rôle mis à jour avec succès.');
      await this.refresh();
      this.selectedUserId.set(user.id);
    }

    this.saving.set(false);
  }

  roleLabel(role: string): string {
    if (role === 'ADMIN_ORG' || role === 'Admin') return 'Admin';
    if (role === 'RESPONSABLE_SMQ' || role === 'Responsable Qualité') return 'Responsable Qualité';
    if (role === 'AUDITEUR' || role === 'Auditeur') return 'Auditeur';
    return 'Chef de service / Utilisateur';
  }

  private normalizeRole(role: string): AssignableRole {
    if (role === 'ADMIN_ORG' || role === 'Admin') return 'ADMIN_ORG';
    if (role === 'RESPONSABLE_SMQ' || role === 'Responsable Qualité') return 'RESPONSABLE_SMQ';
    if (role === 'AUDITEUR' || role === 'Auditeur') return 'AUDITEUR';
    return 'UTILISATEUR';
  }
}
