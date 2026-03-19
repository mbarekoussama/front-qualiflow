import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const isAdmin = auth.hasRole(['Admin']);
  const isAdminRoute = state.url.startsWith('/admin/');
  const isProfileRoute = state.url.startsWith('/profil');
  const isSearchRoute = state.url.startsWith('/recherche');
  const isNotificationsRoute = state.url.startsWith('/notifications');

  if (isAdmin && !isAdminRoute && !isProfileRoute && !isSearchRoute && !isNotificationsRoute) {
    return router.createUrlTree(['/admin/utilisateurs']);
  }

  if (!isAdmin && isAdminRoute) {
    return router.createUrlTree(['/dashboard']);
  }

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  if (auth.hasRole(['Admin'])) {
    return router.createUrlTree(['/admin/utilisateurs']);
  }

  return router.createUrlTree(['/dashboard']);
};
