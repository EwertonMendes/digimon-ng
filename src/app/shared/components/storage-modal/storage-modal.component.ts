import { Component, inject } from '@angular/core';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { DigimonListLocation } from '@core/enums/digimon-list-location.enum';
import { Digimon } from '@core/interfaces/digimon.interface';
import { AudioService } from '@services/audio.service';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { ButtonComponent } from '../button/button.component';
import { DigiStatusCardComponent } from '../digi-status-card/digi-status-card.component';
import { TranslocoModule } from '@jsverse/transloco';
import { TooltipDirective } from 'app/directives/tooltip.directive';
import { ModalService } from '../modal/modal.service';
import { DigimonDetailsModalComponent } from '../digimon-details-modal/digimon-details-modal.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-storage-modal',
  standalone: true,
  imports: [ButtonComponent, ModalComponent, DigiStatusCardComponent, TranslocoModule, TooltipDirective],
  templateUrl: './storage-modal.component.html',
  styleUrl: './storage-modal.component.scss',
})
export class StorageModalComponent {
  digimonStorageModalId = 'digimon-storage-modal';
  digimonDetailsModalId = 'digimon-details-modal';

  protected globalState = inject(GlobalStateDataSource);
  private modalService = inject(ModalService);
  private audioService = inject(AudioService);

  openDigimonDetailsModal(digimon: Digimon) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.globalState.selectedDigimonOnDetails.set(digimon);
    this.modalService.open(this.digimonDetailsModalId, DigimonDetailsModalComponent);
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
