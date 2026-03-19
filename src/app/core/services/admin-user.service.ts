import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  fonction?: string;
  role: string;
  roleLabel?: string;
  organisationId?: string;
  organisationCode?: string;
  organisationNom?: string;
  dateCreation?: string;
  initiales: string;
  couleur: string;
}

export type AssignableRole = 'ADMIN_ORG' | 'RESPONSABLE_SMQ' | 'AUDITEUR' | 'UTILISATEUR';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/utilisateurs`;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly users = signal<AdminUser[]>([]);

  readonly total = computed(() => this.users().length);
  readonly roleStats = computed(() => {
    const stats = new Map<string, number>();
    for (const user of this.users()) {
      stats.set(user.role, (stats.get(user.role) ?? 0) + 1);
    }

    return [...stats.entries()]
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);
  });

  readonly privilegedCount = computed(() =>
    this.users().filter((u) => u.role === 'ADMIN_ORG' || u.role === 'RESPONSABLE_SMQ').length
  );

  async loadUsers(organisationId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const params = new HttpParams().set('organisationId', organisationId);
      const data = await firstValueFrom(this.http.get<AdminUser[]>(`${this.url}/`, { params }));
      this.users.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement des utilisateurs');
    } finally {
      this.loading.set(false);
    }
  }

  async loadPlatformUsers(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.http.get<AdminUser[]>(`${this.url}/platform`));
      this.users.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur de chargement des utilisateurs plateforme');
    } finally {
      this.loading.set(false);
    }
  }

  async updateUserRole(userId: string, role: AssignableRole, fonction?: string): Promise<boolean> {
    this.error.set(null);

    try {
      await firstValueFrom(
        this.http.put(`${this.url}/${userId}/role`, {
          role,
          fonction: fonction?.trim() || undefined
        })
      );

      this.users.update((list) =>
        list.map((user) =>
          user.id === userId
            ? {
                ...user,
                role,
                roleLabel:
                  role === 'ADMIN_ORG'
                    ? 'Admin'
                    : role === 'RESPONSABLE_SMQ'
                      ? 'Responsable Qualité'
                      : role === 'AUDITEUR'
                        ? 'Auditeur'
                        : 'Utilisateur',
                fonction: fonction?.trim() || user.fonction
              }
            : user
        )
      );

      return true;
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rôle');
      return false;
    }
  }
}
