import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'desktop',
    pathMatch: 'full',
  },
  {
    path: 'desktop',
    loadComponent: () => import('./modules/desktop/desktop.component').then(m => m.DesktopComponent),
  },
  {
    path: 'adventure',
    loadComponent: () => import('./modules/adventure/adventure.component').then(m => m.AdventureComponent),
  },
  {
    path: 'lab',
    loadComponent: () => import('./modules/lab/lab.component').then(m => m.LabComponent),
  },
  { path: '**', redirectTo: 'desktop' },
];
