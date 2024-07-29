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
import { DigimonListLocation } from '../../../../core/enums/digimon-list-location.enum';
import { PlayerData } from '../../../../core/interfaces/player-data.interface';

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
  hospitalListId = 'hospital-digimon-list';

  actions: Record<string, string> = {
    'in-training-digimon-list': 'inTraining',
    'bit-farming-digimon-list': 'bitFarm',
    'team-list': 'team',
    'hospital-digimon-list': 'hospital',
  };

  onRightClick(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    if (!digimon.id) return;
    this.globalState.addDigimonToStorage(digimon, DigimonListLocation.TEAM);
  }

  openDigimonDetailsModal(digimon: Digimon): void {
    this.globalState.setSelectedDigimonOnDetailsAccessor(digimon);
    this.modalService.open(this.digimonDetailsModalId);
  }

  // drop(event: CdkDragDrop<PlayerData>) {
  //   const { previousContainer, container, previousIndex, currentIndex } = event;

  //   if (previousContainer === container) {
  //     this.handleSameContainerDrop(container.id, previousIndex, currentIndex);
  //     return;
  //   }

  //   this.handleDifferentContainerDrop(previousContainer.id, previousIndex);
  // }

  // private handleSameContainerDrop(
  //   containerId: string,
  //   previousIndex: number,
  //   currentIndex: number
  // ) {
  //   const handlers = {
  //     [this.teamListId]: () =>
  //       moveItemInArray(
  //         this.globalState.playerDataAcessor.digimonList,
  //         previousIndex,
  //         currentIndex
  //       ),
  //   };

  //   const handler = handlers[containerId];
  //   if (handler) {
  //     handler();
  //   }
  // }

  // private handleDifferentContainerDrop(
  //   previousContainerId: string,
  //   previousIndex: number
  // ) {
  //   const digimon = this.getDigimonFromPreviousContainer(
  //     previousContainerId,
  //     previousIndex
  //   );
  //   const action = this.actions[previousContainerId];

  //   const handlers = {
  //     [this.inTrainingListId]: () =>
  //       this.globalState.addDigimonToList(digimon, action),
  //     [this.bitFarmingListId]: () =>
  //       this.globalState.addDigimonToList(digimon, action),
  //     [this.hospitalListId]: () =>
  //       this.globalState.addDigimonToHospital(digimon, action),
  //   };

  //   const handler = handlers[previousContainerId];
  //   if (handler) {
  //     handler();
  //   }
  // }

  // private getDigimonFromPreviousContainer(
  //   containerId: string,
  //   index: number
  // ): Digimon {
  //   const lists = {
  //     [this.inTrainingListId]:
  //       this.globalState.playerDataAcessor.inTrainingDigimonList,
  //     [this.bitFarmingListId]:
  //       this.globalState.playerDataAcessor.bitFarmDigimonList,
  //     [this.hospitalListId]:
  //       this.globalState.playerDataAcessor.hospitalDigimonList,
  //   };

  //   const list = lists[containerId];
  //   if (list) {
  //     return list[index];
  //   }

  //   throw new Error('Invalid container ID');
  // }

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
    previousIndex: number
  ) {
    const digimon = this.getDigimonFromPreviousContainer(
      previousContainerId,
      previousIndex
    );

    const action = this.actions[previousContainerId];

    const handlers = {
      [this.inTrainingListId]: () =>
        this.handleTeamListDrop(containerId, digimon, action),
      [this.bitFarmingListId]: () =>
        this.handleTeamListDrop(containerId, digimon, action),
      [this.teamListId]: () =>
        this.globalState.addDigimonToList(digimon, action),
      [this.hospitalListId]: () =>
        this.globalState.addDigimonToHospital(digimon, action),
    };

    const handler = handlers[containerId];
    if (handler) {
      handler();
    }
  }

  private handleTeamListDrop(
    containerId: string,
    digimon: Digimon,
    action: string
  ) {
    const handlers = {
      [this.inTrainingListId]: () =>
        this.globalState.addDigimonToTraining(digimon, action),
      [this.bitFarmingListId]: () =>
        this.globalState.addDigimonToFarm(digimon, action),
      [this.hospitalListId]: () => this.globalState.addDigimonToHospital(digimon, action),
      [this.teamListId]: () => this.globalState.addDigimonToList(digimon, action),
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
