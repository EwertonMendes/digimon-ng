import { Component, inject } from '@angular/core';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [DigiStatusCardComponent, DragDropModule],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.scss',
})
export class HomeSectionComponent {
  digimonDetailsModalId = 'digimon-details-modal';
  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);

  teamListId = 'team-list';
  inTrainingListId = 'in-training-digimon-list';
  bitFarmingListId = 'bit-farming-digimon-list';

  actions: Record<string, string> = {
    'in-training-digimon-list': 'inTraining',
    'bit-farming-digimon-list': 'bitFarm',
    'team-list': 'team',
  };

  onRightClick(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    if (!digimon.id) return;
    this.globalState.addDigimonToStorage(digimon, 'team');
  }

  openDigimonDetailsModal(digimon: Digimon): void {
    this.globalState.setSelectedDigimonOnDetailsAccessor(digimon);
    this.modalService.open(this.digimonDetailsModalId);
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      if (event.container.id === this.teamListId) {
        moveItemInArray(
          this.globalState.playerDataAcessor.digimonList,
          event.previousIndex,
          event.currentIndex
        );

        return;
      }
      return;
    }

    if (event.previousContainer.id === this.inTrainingListId) {
      console.log(
        event.previousContainer.data.digimonList[event.previousIndex]
      );
      this.globalState.addDigimonToList(
        event.previousContainer.data.inTrainingDigimonList[event.previousIndex],
        this.actions[event.previousContainer.id]
      );
    }

    if (event.previousContainer.id === this.bitFarmingListId) {
      this.globalState.addDigimonToList(
        event.previousContainer.data.bitFarmDigimonList[event.previousIndex],
        this.actions[event.previousContainer.id]
      );
    }
  }
}
