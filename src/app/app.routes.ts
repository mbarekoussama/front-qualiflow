import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard.js';
import { roleGuard } from './core/auth/role.guard.js';

export const routes: Routes = [
  // ─── Public ────────────────────────────────────────────────
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/login/login.component.js').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/register/register.component.js').then((m) => m.RegisterComponent)
  },

  // ─── Authenticated shell ────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.component.js').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component.js').then((m) => m.DashboardComponent)
      },

      // Profil
      {
        path: 'profil',
        loadComponent: () =>
          import('./features/profile/profile.component.js').then((m) => m.ProfileComponent)
      },

      // Recherche
      {
        path: 'recherche',
        loadComponent: () =>
          import('./features/recherche/recherche.component.js').then((m) => m.RechercheComponent)
      },

      // Notifications
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component.js').then(
            (m) => m.NotificationsComponent
          )
      },

      // Processus
      {
        path: 'processus',
        loadComponent: () =>
          import('./features/processus/processus-list/processus-list.component.js').then(
            (m) => m.ProcessusListComponent
          )
      },
      {
        path: 'processus/nouveau',
        loadComponent: () =>
          import('./features/processus/processus-form/processus-form.component.js').then(
            (m) => m.ProcessusFormComponent
          )
      },
      {
        path: 'processus/:id/edition',
        loadComponent: () =>
          import('./features/processus/processus-form/processus-form.component.js').then(
            (m) => m.ProcessusFormComponent
          )
      },
      {
        path: 'processus/:id',
        loadComponent: () =>
          import('./features/processus/processus-detail/processus-detail.component.js').then(
            (m) => m.ProcessusDetailComponent
          )
      },

      // Procédures
      {
        path: 'procedures',
        loadComponent: () =>
          import('./features/procedures/procedure-list/procedure-list.component.js').then(
            (m) => m.ProcedureListComponent
          )
      },
      {
        path: 'procedures/nouvelle',
        loadComponent: () =>
          import('./features/procedures/procedure-form/procedure-form.component.js').then(
            (m) => m.ProcedureFormComponent
          )
      },
      {
        path: 'procedures/:id/edition',
        loadComponent: () =>
          import('./features/procedures/procedure-form/procedure-form.component.js').then(
            (m) => m.ProcedureFormComponent
          )
      },

      {
        path: 'procedures/:id',
        loadComponent: () =>
          import('./features/procedures/procedure-detail/procedure-detail.component.js').then(
            (m) => m.ProcedureDetailComponent
          )
      },

      // Documents
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/document-list/document-list.component.js').then(
            (m) => m.DocumentListComponent
          )
      },
      {
        path: 'documents/nouveau',
        loadComponent: () =>
          import('./features/documents/document-form/document-form.component.js').then(
            (m) => m.DocumentFormComponent
          )
      },
      {
        path: 'documents/:id/edition',
        loadComponent: () =>
          import('./features/documents/document-form/document-form.component.js').then(
            (m) => m.DocumentFormComponent
          )
      },
      {
        path: 'documents/:id',
        loadComponent: () =>
          import('./features/documents/document-detail/document-detail.component.js').then(
            (m) => m.DocumentDetailComponent
          )
      },

      // Non-conformités
      {
        path: 'non-conformites',
        loadComponent: () =>
          import('./features/non-conformites/nc-list/nc-list.component.js').then(
            (m) => m.NcListComponent
          )
      },
      {
        path: 'non-conformites/nouvelle',
        loadComponent: () =>
          import('./features/non-conformites/nc-form/nc-form.component.js').then(
            (m) => m.NcFormComponent
          )
      },
      {
        path: 'non-conformites/:id',
        loadComponent: () =>
          import('./features/non-conformites/nc-detail/nc-detail.component.js').then(
            (m) => m.NcDetailComponent
          )
      },

      // Actions correctives
      {
        path: 'actions-correctives',
        loadComponent: () =>
          import('./features/actions-correctives/ac-list/ac-list.component.js').then(
            (m) => m.AcListComponent
          )
      },

      // Indicateurs
      {
        path: 'indicateurs',
        loadComponent: () =>
          import('./features/indicateurs/indicateur-list/indicateur-list.component.js').then(
            (m) => m.IndicateurListComponent
          )
      },
      {
        path: 'indicateurs/nouveau',
        loadComponent: () =>
          import('./features/indicateurs/indicateur-form/indicateur-form.component.js').then(
            (m) => m.IndicateurFormComponent
          )
      },
      {
        path: 'indicateurs/:id/edition',
        loadComponent: () =>
          import('./features/indicateurs/indicateur-form/indicateur-form.component.js').then(
            (m) => m.IndicateurFormComponent
          )
      },
      {
        path: 'indicateurs/:id',
        loadComponent: () =>
          import('./features/indicateurs/indicateur-detail/indicateur-detail.component.js').then(
            (m) => m.IndicateurDetailComponent
          )
      },

      // Tableau de bord KPI
      {
        path: 'tableau-de-bord',
        loadComponent: () =>
          import('./features/indicateurs/indicateur-list/indicateur-list.component.js').then(
            (m) => m.IndicateurListComponent
          )
      },

      // Administration Auth & Rôles
      
     {
        path: 'admin/auth-roles',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component.js').then(
            (m) => m.AdminDashboardComponent
          )
      },
      {
        path: 'admin/utilisateurs',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/admin-users/admin-users.component.js').then(
            (m) => m.AdminUsersComponent
          )
      }

    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];
