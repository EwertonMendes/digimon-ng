import { Component, inject } from '@angular/core';
import { AudioEffects } from '../../../core/enums/audio-tracks.enum';
import { DigimonListLocation } from '../../../core/enums/digimon-list-location.enum';
import { Digimon } from '../../../core/interfaces/digimon.interface';
import { AudioService } from '../../../services/audio.service';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { ModalService } from '../modal/modal.service';
import { ButtonComponent } from '../button/button.component';
import { DigiStatusCardComponent } from '../digi-status-card/digi-status-card.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-storage-modal',
  standalone: true,
  imports: [ButtonComponent, ModalComponent, DigiStatusCardComponent],
  templateUrl: './storage-modal.component.html',
  styleUrl: './storage-modal.component.scss',
})
export class StorageModalComponent {
  digimonStorageModalId = 'digimon-storage-modal';
  digimonDetailsModalId = 'digimon-details-modal';

  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);
  audioService = inject(AudioService);

  openDigimonDetailsModal(digimon: Digimon) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.globalState.setSelectedDigimonOnDetailsAccessor(digimon);
    this.modalService.open(this.digimonDetailsModalId);
  }

  addDigimonToTeam(digimon: Digimon) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.globalState.addDigimonToList(digimon, DigimonListLocation.STORAGE);
  }

  addDigimonToTraining(digimon: Digimon) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.globalState.addDigimonToTraining(digimon, DigimonListLocation.STORAGE);
  }

  addDigimonToFarm(digimon: Digimon) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.globalState.addDigimonToFarm(digimon, DigimonListLocation.STORAGE);
  }

  addDigimonToHospital(digimon: Digimon) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.globalState.addDigimonToHospital(digimon, DigimonListLocation.STORAGE);
  }
}
