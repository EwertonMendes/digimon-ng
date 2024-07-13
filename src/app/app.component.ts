import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopComponent } from './modules/desktop/desktop.component';
import { GlobalStateDataSource } from './global-state.datasource';
import { ButtonComponent } from "./shared/components/button/button.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DesktopComponent, ButtonComponent],
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
