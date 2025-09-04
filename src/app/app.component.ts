import { Component, inject, OnInit } from '@angular/core';
import { GlobalStateDataSource } from './state/global-state.datasource';
import { ToastComponent } from './shared/components/toast/toast.component';
import { InitialSetupComponent } from './modules/initial-setup/initial-setup.component';
import { PlayerDataService } from './services/player-data.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastComponent,
    InitialSetupComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'digi-angular';

  globalState = inject(GlobalStateDataSource);
  playerDataService = inject(PlayerDataService);

  async ngOnInit() {
    if (window.location.pathname === '/splashscreen') {
      this.globalState.showInitialSetupScreen.set(false);
      return;
    }

    const playerData = await this.playerDataService.loadPlayerData();
    if (!playerData) {
      this.globalState.showInitialSetupScreen.set(true);
      return;
    }
    this.globalState.initializeGame(playerData);
  }
}
