import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'processus/:id/edition', renderMode: RenderMode.Server },
  { path: 'procedures/:id/edition', renderMode: RenderMode.Server },
  { path: 'non-conformites/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender }
];
