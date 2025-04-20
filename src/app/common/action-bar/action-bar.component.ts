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

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [
    ButtonComponent,
    StorageModalComponent,
    PlayerInfoModalComponent,
    DebugModalComponent,
  ],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss',
})
export class ActionBarComponent {
  digimonStorageModalId = 'digimon-storage-modal';
  debugModlaId = 'debug-modal';

  modalService = inject(ModalService);
  audioService = inject(AudioService);
  router = inject(Router);
  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);

  openDigimonStorageModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.digimonStorageModalId);
  }

  openPlayerInfoModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open('player-info-modal');
  }

  openDebugModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.debugModlaId);
  }

  navigateTo(url: string) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.router.navigate([url]);
  }

  async saveGame() {
    this.audioService.playAudio(AudioEffects.CLICK);
    try {
      await this.globalState.saveCurrentPlayerData();
      this.toastService.showToast('Game saved successfully!', 'success');

    } catch (err) {
      this.toastService.showToast('Error saving game', 'error');
    }
  }
}
