import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalService } from '../../shared/components/modal/modal.service';
import { Router } from '@angular/router';
import { AudioService } from '../../services/audio.service';
import { AudioEffects } from '../../core/enums/audio-tracks.enum';
import { StorageModalComponent } from '../../shared/components/storage-modal/storage-modal.component';
import { PlayerInfoModalComponent } from '../../shared/components/player-info-modal/player-info-modal.component';
import { DebugModalComponent } from './debug-modal/debug-modal.component';
import { GlobalStateDataSource } from '../../state/global-state.datasource';
import { ToastService } from '../../shared/components/toast/toast.service';
import { environment } from 'app/environments/environment';
import { ConfigModalComponent } from './config-modal/config-modal.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TooltipDirective } from 'app/directives/tooltip.directive';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [
    ButtonComponent,
    StorageModalComponent,
    PlayerInfoModalComponent,
    DebugModalComponent,
    ConfigModalComponent,
    TranslocoModule,
    TooltipDirective
  ],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss',
})
export class ActionBarComponent {
  playerInfoModalId = 'player-info-modal';
  digimonStorageModalId = 'digimon-storage-modal';
  debugModalId = 'debug-modal';
  configModalId = 'config-modal';
  isDevMode = !environment.production;

  modalService = inject(ModalService);
  audioService = inject(AudioService);
  router = inject(Router);
  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);

  openDigimonStorageModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.digimonStorageModalId);
  }

  openPlayerInfoModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.playerInfoModalId);
  }

  openDebugModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.debugModalId);
  }

  openConfigModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.configModalId);
  }

  navigateTo(url: string) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.router.navigate([url]);
  }

  async saveGame() {
    this.audioService.playAudio(AudioEffects.CLICK);
    try {
      await this.globalState.saveCurrentPlayerData();
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.TOAST.GAME_SAVED_SUCCESSFULLY'), 'success');

    } catch (err) {
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.TOAST.GAME_SAVE_FAILED'), 'error');
    }
  }
}
