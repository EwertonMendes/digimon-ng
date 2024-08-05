import { Routes } from '@angular/router';
import { DesktopComponent } from './modules/desktop/desktop.component';
import { AdventureComponent } from './modules/adventure/adventure.component';

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
  {
    path: 'adventure',
    component: AdventureComponent,
  },
  { path: '**', redirectTo: 'desktop' },
];
