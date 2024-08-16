import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalService } from '../../shared/components/modal/modal.service';
import { Router } from '@angular/router';
import { AudioService } from '../../services/audio.service';
import { AudioEffects } from '../../core/enums/audio-tracks.enum';
import { StorageModalComponent } from '../../shared/components/storage-modal/storage-modal.component';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [ButtonComponent, StorageModalComponent],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss',
})
export class ActionBarComponent {
  digimonStorageModalId = 'digimon-storage-modal';

  modalService = inject(ModalService);
  audioService = inject(AudioService);
  router = inject(Router);

  openDigimonStorageModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.digimonStorageModalId);
  }

  navigateTo(url: string) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.router.navigate([url]);
  }
}
