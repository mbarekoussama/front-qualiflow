import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'login',                  renderMode: RenderMode.Prerender },
  { path: 'register',               renderMode: RenderMode.Prerender },
  { path: 'processus/:id/edition',  renderMode: RenderMode.Server },
  { path: 'processus/:id',          renderMode: RenderMode.Server },
  { path: 'procedures/:id/edition', renderMode: RenderMode.Server },
  { path: 'procedures/:id',         renderMode: RenderMode.Server },
  { path: 'documents/:id',          renderMode: RenderMode.Server },
  { path: 'documents/:id/edition',  renderMode: RenderMode.Server },
  { path: 'non-conformites/:id',    renderMode: RenderMode.Server },
  { path: 'indicateurs/:id',        renderMode: RenderMode.Server },
  { path: 'indicateurs/:id/edition', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender }
];
