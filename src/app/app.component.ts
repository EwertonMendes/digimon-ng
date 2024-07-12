import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopComponent } from './modules/desktop/desktop.component';
import { GlobalStateDataSource } from './global-state.datasource';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DesktopComponent],
  providers: [GlobalStateDataSource],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'digi-angular';

  globalState = inject(GlobalStateDataSource);

  constructor() {
    this.globalState.connect();
  }
}
