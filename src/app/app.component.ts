import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalStateDataSource } from './state/global-state.datasource';
import { ActionBarComponent } from './common/action-bar/action-bar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { InitialSetupComponent } from './modules/initial-setup/initial-setup.component';
import { PlayerDataService } from './services/player-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ActionBarComponent,
    ToastComponent,
    InitialSetupComponent
  ],
  providers: [GlobalStateDataSource],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'digi-angular';

  globalState = inject(GlobalStateDataSource);
  playerDataService = inject(PlayerDataService);

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.adjustZoom();
  }

  async ngOnInit() {
    this.adjustZoom();
    const playerData = await this.playerDataService.loadPlayerData();
    if (!playerData) {
      this.globalState.showInitialSetupScreen.set(true);
      return;
    }
    this.globalState.initializeGame(playerData);
  }

  private adjustZoom(): void {
    const baseWidth = 1920;
    const baseHeight = 1080;
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    const zoom = Math.max(currentWidth / baseWidth, currentHeight / baseHeight);

    const appRoot = document.querySelector('app-root') as HTMLElement;
    if (appRoot) {
      appRoot.style.zoom = `${zoom}`;
    }
  }
}
