import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { DigimonFarmCardComponent } from './components/digimon-farm-card/digimon-farm-card.component';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DigimonListLocation } from '../../../../core/enums/digimon-list-location.enum';

@Component({
  selector: 'app-farm-section',
  standalone: true,
  imports: [
    ButtonComponent,
    DigiStatusCardComponent,
    DigimonFarmCardComponent,
    DragDropModule,
  ],
  templateUrl: './farm-section.component.html',
  styleUrl: './farm-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FarmSectionComponent {
  digimonDetailsModalId = 'digimon-details-modal';

  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);

  bitGenerationTotalRate = signal<number>(0);

  inTrainingListId = 'in-training-digimon-list';
  bitFarmingListId = 'bit-farming-digimon-list';
  teamListId = 'team-list';

  actions: Record<string, string> = {
    'in-training-digimon-list': 'inTraining',
    'bit-farming-digimon-list': 'bitFarm',
    'team-list': 'team',
  };

  constructor() {
    effect(
      () => {
        this.bitGenerationTotalRate.set(
          this.globalState.getBitGenerationTotalRate()
        );
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  removeDigimonFromTraining(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    this.globalState.addDigimonToStorage(digimon, DigimonListLocation.IN_TRAINING);
  }

  removeDigimonFromFarm(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    this.globalState.addDigimonToStorage(digimon, DigimonListLocation.BIT_FARM);
  }

  openDigimonDetailsModal(digimon: Digimon): void {
    this.globalState.setSelectedDigimonOnDetailsAccessor(digimon);
    this.modalService.open(this.digimonDetailsModalId);
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      if (event.container.id === this.inTrainingListId) {
        moveItemInArray(
          this.globalState.playerDataAcessor.inTrainingDigimonList,
          event.previousIndex,
          event.currentIndex
        );

        return;
      }

      if (event.container.id === this.bitFarmingListId) {
        moveItemInArray(
          this.globalState.playerDataAcessor.bitFarmDigimonList,
          event.previousIndex,
          event.currentIndex
        );
        return;
      }
      return;
    }

    if (event.previousContainer.id === this.inTrainingListId) {
      this.globalState.addDigimonToFarm(
        event.previousContainer.data.inTrainingDigimonList[event.previousIndex],
        this.actions[event.previousContainer.id]
      );
    }

    if (event.previousContainer.id === this.bitFarmingListId) {
      this.globalState.addDigimonToTraining(
        event.previousContainer.data.bitFarmDigimonList[event.previousIndex],
        this.actions[event.previousContainer.id]
      );
    }

    if (event.previousContainer.id === this.teamListId) {
      if (event.container.id === this.inTrainingListId) {
        this.globalState.addDigimonToTraining(
          event.previousContainer.data.digimonList[event.previousIndex],
          this.actions[event.previousContainer.id]
        );
        return;
      }
      if (event.container.id === this.bitFarmingListId) {
        this.globalState.addDigimonToFarm(
          event.previousContainer.data.digimonList[event.previousIndex],
          this.actions[event.previousContainer.id]
        );
        return;
      }
    }
  }
}
