import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // ─── Public ────────────────────────────────────────────────
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent)
  },

  // ─── Authenticated shell ────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },

      // Processus
      {
        path: 'processus',
        loadComponent: () =>
          import('./features/processus/processus-list/processus-list.component').then(
            (m) => m.ProcessusListComponent
          )
      },
      {
        path: 'processus/nouveau',
        loadComponent: () =>
          import('./features/processus/processus-form/processus-form.component').then(
            (m) => m.ProcessusFormComponent
          )
      },
      {
        path: 'processus/:id/edition',
        loadComponent: () =>
          import('./features/processus/processus-form/processus-form.component').then(
            (m) => m.ProcessusFormComponent
          )
      },
      {
        path: 'processus/:id',
        loadComponent: () =>
          import('./features/processus/processus-detail/processus-detail.component').then(
            (m) => m.ProcessusDetailComponent
          )
      },

      // Procédures
      {
        path: 'procedures',
        loadComponent: () =>
          import('./features/procedures/procedure-list/procedure-list.component').then(
            (m) => m.ProcedureListComponent
          )
      },
      {
        path: 'procedures/nouvelle',
        loadComponent: () =>
          import('./features/procedures/procedure-form/procedure-form.component').then(
            (m) => m.ProcedureFormComponent
          )
      },
      {
        path: 'procedures/:id/edition',
        loadComponent: () =>
          import('./features/procedures/procedure-form/procedure-form.component').then(
            (m) => m.ProcedureFormComponent
          )
      },

      {
        path: 'procedures/:id',
        loadComponent: () =>
          import('./features/procedures/procedure-detail/procedure-detail.component').then(
            (m) => m.ProcedureDetailComponent
          )
      },

      // Documents
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/document-list/document-list.component').then(
            (m) => m.DocumentListComponent
          )
      },
      {
        path: 'documents/nouveau',
        loadComponent: () =>
          import('./features/documents/document-form/document-form.component').then(
            (m) => m.DocumentFormComponent
          )
      },
      {
        path: 'documents/:id/edition',
        loadComponent: () =>
          import('./features/documents/document-form/document-form.component').then(
            (m) => m.DocumentFormComponent
          )
      },
      {
        path: 'documents/:id',
        loadComponent: () =>
          import('./features/documents/document-detail/document-detail.component').then(
            (m) => m.DocumentDetailComponent
          )
      },

      // Non-conformités
      {
        path: 'non-conformites',
        loadComponent: () =>
          import('./features/non-conformites/nc-list/nc-list.component').then(
            (m) => m.NcListComponent
          )
      },
      {
        path: 'non-conformites/nouvelle',
        loadComponent: () =>
          import('./features/non-conformites/nc-form/nc-form.component').then(
            (m) => m.NcFormComponent
          )
      },
      {
        path: 'non-conformites/:id',
        loadComponent: () =>
          import('./features/non-conformites/nc-detail/nc-detail.component').then(
            (m) => m.NcDetailComponent
          )
      },

      // Actions correctives
      {
        path: 'actions-correctives',
        loadComponent: () =>
          import('./features/actions-correctives/ac-list/ac-list.component').then(
            (m) => m.AcListComponent
          )
      },

      // Indicateurs
      {
        path: 'indicateurs',
        loadComponent: () =>
          import('./features/indicateurs/indicateur-list/indicateur-list.component').then(
            (m) => m.IndicateurListComponent
          )
      },

      // Tableau de bord KPI
      {
        path: 'tableau-de-bord',
        loadComponent: () =>
          import('./features/indicateurs/indicateur-list/indicateur-list.component').then(
            (m) => m.IndicateurListComponent
          )
      }
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];
