import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { AuthUser, LoginCredentials, LoginResponse } from './auth.model';
import { RoleUtilisateur } from '../../shared/models/utilisateur.model';

const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    id: 'u-01',
    nom: 'Mansouri',
    prenom: 'Amira',
    initiales: 'AM',
    email: 'a.mansouri@qualiflow.app',
    role: 'Responsable Qualité',
    couleur: '#1a5c38',
    password: 'qualiflow2026',
    token: 'mock-token-admin'
  },
  {
    id: 'u-02',
    nom: 'Mrad',
    prenom: 'Kais',
    initiales: 'KM',
    email: 'k.mrad@qualiflow.app',
    role: 'Pilote',
    couleur: '#2d7a4f',
    password: 'qualiflow2026',
    token: 'mock-token-pilote'
  },
  {
    id: 'u-03',
    nom: 'Ben Ali',
    prenom: 'Sana',
    initiales: 'SB',
    email: 's.benali@qualiflow.app',
    role: 'Auditeur',
    couleur: '#0f766e',
    password: 'qualiflow2026',
    token: 'mock-token-auditeur'
  },
  {
    id: 'u-04',
    nom: 'Haddad',
    prenom: 'Rami',
    initiales: 'RH',
    email: 'r.haddad@qualiflow.app',
    role: 'Pilote',
    couleur: '#475569',
    password: 'qualiflow2026',
    token: 'mock-token-pilote2'
  }
];

const TOKEN_KEY = 'qf_token';
const USER_KEY = 'qf_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const found = MOCK_USERS.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (!found) {
      return throwError(() => new Error('Email ou mot de passe incorrect'));
    }

    const { password: _pw, ...user } = found;
    const response: LoginResponse = {
      user,
      token: user.token,
      expiresIn: 86400
    };

    return of(response).pipe(
      delay(600),
      tap((res) => this.persistSession(res.user, res.token))
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  hasRole(roles: RoleUtilisateur[]): boolean {
    const role = this.userRole();
    return role !== null && roles.includes(role);
  }

  canCreate(): boolean {
    return this.hasRole(['Admin', 'Responsable Qualité']);
  }

  canEdit(): boolean {
    return this.hasRole(['Admin', 'Responsable Qualité', 'Pilote']);
  }

  canDeclareNC(): boolean {
    return this.hasRole(['Admin', 'Responsable Qualité', 'Auditeur', 'Pilote']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(user: AuthUser, token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  private loadUserFromStorage(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
