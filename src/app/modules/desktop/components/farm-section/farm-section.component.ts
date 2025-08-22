import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { DigimonFarmCardComponent } from './components/digimon-farm-card/digimon-farm-card.component';
import {
  CdkDragDrop,
  DragDropModule,
  DropListOrientation,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DigimonListLocation } from '../../../../core/enums/digimon-list-location.enum';
import { PlayerData } from '../../../../core/interfaces/player-data.interface';
import { AudioEffects } from '../../../../core/enums/audio-tracks.enum';
import { AudioService } from '../../../../services/audio.service';
import { TranslocoModule } from '@jsverse/transloco';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { DigimonDetailsModalComponent } from 'app/shared/components/digimon-details-modal/digimon-details-modal.component';
import { ButtonComponent } from 'app/shared/components/button/button.component';
import { TooltipDirective } from "app/directives/tooltip.directive";

@Component({
  selector: 'app-farm-section',
  standalone: true,
  imports: [
    DigiStatusCardComponent,
    DigimonFarmCardComponent,
    ButtonComponent,
    DragDropModule,
    TranslocoModule,
    TooltipDirective
],
  templateUrl: './farm-section.component.html',
  styleUrl: './farm-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FarmSectionComponent {
  private digimonDetailsModalId = 'digimon-details-modal';

  protected globalState = inject(GlobalStateDataSource);
  private modalService = inject(ModalService);
  private audioService = inject(AudioService);

  protected selectedLayout = signal<DropListOrientation>('horizontal');

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
      }
    );
  }

  setLayout() {
    const current = this.selectedLayout();
    const next = current === 'horizontal' ? 'vertical' : 'horizontal';
    this.selectedLayout.set(next);
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
    this.globalState.selectedDigimonOnDetails.set(digimon);
    this.modalService.open(this.digimonDetailsModalId, DigimonDetailsModalComponent);
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
    previousIndex: number,
    currentIndex: number
  ) {
    const digimon = this.getDigimonFromPreviousContainer(
      previousContainerId,
      previousIndex
    );
    const action = this.listLocations[previousContainerId];

    const handlers = {
      [this.inTrainingListId]: () => {
        this.globalState.addDigimonToTraining(digimon, action),
          moveItemInArray(
            this.globalState.playerDataAcessor.inTrainingDigimonList,
            this.globalState.playerDataAcessor.inTrainingDigimonList.length - 1,
            currentIndex
          );
      },
      [this.bitFarmingListId]: () => {
        this.globalState.addDigimonToFarm(digimon, action),
          moveItemInArray(
            this.globalState.playerDataAcessor.bitFarmDigimonList,
            this.globalState.playerDataAcessor.bitFarmDigimonList.length - 1,
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
