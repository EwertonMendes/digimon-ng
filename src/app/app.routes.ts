import { Routes } from '@angular/router';
import { DesktopComponent } from './modules/desktop/desktop.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'desktop',
    pathMatch: 'full',
  },
  {
    path: 'desktop',
    component: DesktopComponent,
  },

  { path: '**', redirectTo: 'desktop' },
];
