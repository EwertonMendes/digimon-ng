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
import { PlayerData } from '../../../../core/interfaces/player-data.interface';
import { AudioEffects } from '../../../../core/enums/audio-tracks.enum';
import { AudioService } from '../../../../services/audio.service';

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
  audioService = inject(AudioService);

  bitGenerationTotalRate = signal<number>(0);

  teamListId = 'team-list';
  inTrainingListId = 'in-training-digimon-list';
  bitFarmingListId = 'bit-farming-digimon-list';
  hospitalListId = 'hospital-digimon-list';

  listLocations: Record<string, string> = {
    'in-training-digimon-list': DigimonListLocation.IN_TRAINING,
    'bit-farming-digimon-list': DigimonListLocation.BIT_FARM,
    'team-list': DigimonListLocation.TEAM,
    'hospital-digimon-list': DigimonListLocation.HOSPITAL,
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
    this.audioService.playAudio(AudioEffects.CLICK_ALTERNATIVE);
    this.globalState.addDigimonToStorage(
      digimon,
      DigimonListLocation.IN_TRAINING
    );
  }

  removeDigimonFromFarm(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    this.audioService.playAudio(AudioEffects.CLICK_ALTERNATIVE);
    this.globalState.addDigimonToStorage(digimon, DigimonListLocation.BIT_FARM);
  }

  openDigimonDetailsModal(digimon: Digimon): void {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.globalState.setSelectedDigimonOnDetailsAccessor(digimon);
    this.modalService.open(this.digimonDetailsModalId);
  }

  drop(event: CdkDragDrop<PlayerData>) {
    const { previousContainer, container, previousIndex, currentIndex } = event;

    if (previousContainer === container) {
      this.handleSameContainerDrop(container.id, previousIndex, currentIndex);
      return;
    }

    this.handleDifferentContainerDrop(
      previousContainer.id,
      container.id,
      previousIndex
    );
  }

  private handleSameContainerDrop(
    containerId: string,
    previousIndex: number,
    currentIndex: number
  ) {
    const handlers = {
      [this.inTrainingListId]: () =>
        moveItemInArray(
          this.globalState.playerDataAcessor.inTrainingDigimonList,
          previousIndex,
          currentIndex
        ),
      [this.bitFarmingListId]: () =>
        moveItemInArray(
          this.globalState.playerDataAcessor.bitFarmDigimonList,
          previousIndex,
          currentIndex
        ),
    };

    const handler = handlers[containerId];
    if (handler) {
      handler();
    }
  }

  private handleDifferentContainerDrop(
    previousContainerId: string,
    containerId: string,
    previousIndex: number
  ) {
    const digimon = this.getDigimonFromPreviousContainer(
      previousContainerId,
      previousIndex
    );
    const action = this.listLocations[previousContainerId];

    const handlers = {
      [this.inTrainingListId]: () =>
        this.globalState.addDigimonToFarm(digimon, action),
      [this.bitFarmingListId]: () =>
        this.globalState.addDigimonToTraining(digimon, action),
      [this.teamListId]: () =>
        this.handleTeamListDrop(containerId, digimon, action),
      [this.hospitalListId]: () =>
        this.handleTeamListDrop(containerId, digimon, action),
    };

    const handler = handlers[previousContainerId];
    if (handler) {
      handler();
    }
  }

  private handleTeamListDrop(
    containerId: string,
    digimon: Digimon,
    action: any
  ) {
    const handlers = {
      [this.inTrainingListId]: () =>
        this.globalState.addDigimonToTraining(digimon, action),
      [this.bitFarmingListId]: () =>
        this.globalState.addDigimonToFarm(digimon, action),
      [this.hospitalListId]: () => this.globalState.addDigimonToHospital(digimon, action),
    };

    const handler = handlers[containerId];
    if (handler) {
      handler();
    }
  }

  private getDigimonFromPreviousContainer(
    containerId: string,
    index: number
  ): Digimon {
    const lists = {
      [this.inTrainingListId]:
        this.globalState.playerDataAcessor.inTrainingDigimonList,
      [this.bitFarmingListId]:
        this.globalState.playerDataAcessor.bitFarmDigimonList,
      [this.teamListId]: this.globalState.playerDataAcessor.digimonList,
      [this.hospitalListId]:
        this.globalState.playerDataAcessor.hospitalDigimonList,
    };

    const list = lists[containerId];
    if (list) {
      return list[index];
    }

    throw new Error('Invalid container ID');
  }
}
