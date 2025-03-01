import { Component, effect, inject, signal } from '@angular/core';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DigimonListLocation } from '../../../../core/enums/digimon-list-location.enum';
import { PlayerData } from '../../../../core/interfaces/player-data.interface';
import { AudioService } from '../../../../services/audio.service';
import { AudioEffects } from '../../../../core/enums/audio-tracks.enum';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { HospitalService } from '../../../../state/services/hospital.service';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [DigiStatusCardComponent, ButtonComponent, DragDropModule],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.scss',
})
export class HomeSectionComponent {
  digimonDetailsModalId = 'digimon-details-modal';
  globalState = inject(GlobalStateDataSource);
  hospitalService = inject(HospitalService);
  modalService = inject(ModalService);
  audioService = inject(AudioService);

  teamListId = 'team-list';
  inTrainingListId = 'in-training-digimon-list';
  bitFarmingListId = 'bit-farming-digimon-list';
  hospitalListId = 'hospital-digimon-list';
  fullHealPrice = 150;

  listLocations: Record<string, string> = {
    'in-training-digimon-list': DigimonListLocation.IN_TRAINING,
    'bit-farming-digimon-list': DigimonListLocation.BIT_FARM,
    'team-list': DigimonListLocation.TEAM,
    'hospital-digimon-list': DigimonListLocation.HOSPITAL,
  };

  constructor() {
    effect(() => {
      this.canHealAll.set(
        this.globalState.playerDataAcessor.hospitalDigimonList.length > 0 &&
        this.globalState.playerDataAcessor.hospitalDigimonList.some(
          (digimon) => digimon.currentHp < digimon.maxHp
        ) &&
        this.globalState.playerDataAcessor.bits >= this.fullHealPrice
      )
    }, {
      allowSignalWrites: true
    });
  }

  canHealAll = signal(false)

  healAll() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.hospitalService.fullHealHospitalDigimons(this.globalState.playerDataAcessor);
  }

  removeDigimonFromLocation(
    event: MouseEvent,
    digimon: Digimon,
    location: string
  ): void {
    event.preventDefault();
    if (!digimon.id) return;
    this.audioService.playAudio(AudioEffects.CLICK_ALTERNATIVE);
    this.globalState.addDigimonToStorage(digimon, location);
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
      previousIndex,
      currentIndex
    );
  }

  private handleSameContainerDrop(
    containerId: string,
    previousIndex: number,
    currentIndex: number
  ) {
    const handlers = {
      [this.teamListId]: () =>
        moveItemInArray(
          this.globalState.playerDataAcessor.digimonList,
          previousIndex,
          currentIndex
        ),
      [this.hospitalListId]: () =>
        moveItemInArray(
          this.globalState.playerDataAcessor.hospitalDigimonList,
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
    previousIndex: number,
    currentIndex: number
  ) {
    const digimon = this.getDigimonFromPreviousContainer(
      previousContainerId,
      previousIndex
    );

    const action = this.listLocations[previousContainerId];

    const handlers = {
      [this.teamListId]: () => {
        this.globalState.addDigimonToList(digimon, action);
        moveItemInArray(
          this.globalState.playerDataAcessor.digimonList,
          this.globalState.playerDataAcessor.digimonList.length - 1,
          currentIndex
        );
      },
      [this.hospitalListId]: () => {
        this.globalState.addDigimonToHospital(digimon, action),
          moveItemInArray(
            this.globalState.playerDataAcessor.hospitalDigimonList,
            this.globalState.playerDataAcessor.hospitalDigimonList.length - 1,
            currentIndex
          );
      },
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
