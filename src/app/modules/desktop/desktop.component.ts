import { Component, inject } from '@angular/core';
import { HomeSectionComponent } from './components/home-section/home-section.component';
import { FarmSectionComponent } from './components/farm-section/farm-section.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ModalService } from '../../shared/modal/modal.service';
import { DigiStatusCardComponent } from '../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../global-state.datasource';
import { Digimon } from '../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [HomeSectionComponent, FarmSectionComponent, ButtonComponent, ModalComponent, DigiStatusCardComponent],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.scss',
})
export class DesktopComponent {

  digimonStorageModalId = 'digimon-storage-modal';

  modalService = inject(ModalService);
  globalState = inject(GlobalStateDataSource);

  openDigimonStorageModal() {
    this.modalService.open(this.digimonStorageModalId);
  }

  addDigimonToTeam(digimon: Digimon) {
    this.globalState.addDigimonToList(digimon);
  }

  addDigimonToTraining(digimon: Digimon) {
    this.globalState.addDigimonToTraining(digimon);
  }

  addDigimonToFarm(digimon: Digimon) {
    this.globalState.addDigimonToFarm(digimon);
  }
}
