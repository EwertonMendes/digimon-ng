import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DigiStatusCardComponent } from '@shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { Digimon } from '@core/interfaces/digimon.interface';
import {
  CdkDragDrop,
  DragDropModule,
  DropListOrientation,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DigimonListLocation } from '@core/enums/digimon-list-location.enum';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { AudioService } from '@services/audio.service';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { ButtonComponent } from '@shared/components/button/button.component';
import { HospitalService } from '@state/services/hospital.service';
import { TranslocoModule } from '@jsverse/transloco';
import { TooltipDirective } from 'app/directives/tooltip.directive';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { DigimonDetailsModalComponent } from 'app/shared/components/digimon-details-modal/digimon-details-modal.component';
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [DigiStatusCardComponent, ButtonComponent, DragDropModule, TranslocoModule, TooltipDirective, FormsModule],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeSectionComponent {
  private digimonDetailsModalId = 'digimon-details-modal';
  protected globalState = inject(GlobalStateDataSource);
  private hospitalService = inject(HospitalService);
  private modalService = inject(ModalService);
  private audioService = inject(AudioService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  protected selectedLayout = signal<DropListOrientation>('horizontal')

  protected teamListId = 'team-list';
  protected inTrainingListId = 'in-training-digimon-list';
  protected bitFarmingListId = 'bit-farming-digimon-list';
  protected hospitalListId = 'hospital-digimon-list';
  protected fullHealPrice = signal(0);

  private listLocations: Record<string, string> = {
    'in-training-digimon-list': DigimonListLocation.IN_TRAINING,
    'bit-farming-digimon-list': DigimonListLocation.BIT_FARM,
    'team-list': DigimonListLocation.TEAM,
    'hospital-digimon-list': DigimonListLocation.HOSPITAL,
  };

  constructor() {
    effect(() => {
      this.isHealAllEnabled.set(this.canHealAll());
      this.fullHealPrice.set(this.calculateFullHealPrice(this.globalState.playerDataAcessor.hospitalDigimonList));
    });

    this.globalState.digimonHpChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isHealAllEnabled.set(this.canHealAll());
        this.fullHealPrice.set(this.calculateFullHealPrice(this.globalState.playerDataAcessor.hospitalDigimonList));
        this.changeDetectorRef.detectChanges();
      });
  }

  setLayout() {
    const current = this.selectedLayout();
    const next = current === 'horizontal' ? 'vertical' : 'horizontal';
    this.selectedLayout.set(next);
  }

  isHealAllEnabled = signal(this.canHealAll());

  healAll() {
    if (!this.isHealAllEnabled()) return;
    this.audioService.playAudio(AudioEffects.CLICK);
    this.hospitalService.fullHealHospitalDigimons(this.globalState.playerDataAcessor);
    this.globalState.playerDataAcessor.bits -= this.fullHealPrice();
    this.isHealAllEnabled.set(this.canHealAll());
    this.changeDetectorRef.detectChanges();
  }

  canHealAll() {
    return this.globalState.playerDataAcessor.hospitalDigimonList.length > 0
      && this.globalState.playerDataAcessor.hospitalDigimonList.some(d => d.currentHp < d.maxHp)
      && this.globalState.playerDataAcessor.bits >= this.fullHealPrice();
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

  canSendInjuredDigimonToHospital(): boolean {
    return this.globalState.playerDataAcessor.digimonList.some(d => d.currentHp === 0 || d.currentHp <= 0.2 * d.maxHp);
  }

  sendInjuredDigimonToHospital(): void {
    const lowHpDigimons = this.globalState.playerDataAcessor.digimonList.filter(d => d.currentHp === 0 || d.currentHp <= 0.2 * d.maxHp);
    lowHpDigimons.forEach(digimon => {
      this.globalState.addDigimonToHospital(digimon, DigimonListLocation.TEAM);
    });
    this.audioService.playAudio(AudioEffects.CLICK);
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

  calculateFullHealPrice(hospitalDigimonList: Digimon[]): number {
    const BASE_HEAL_PRICE = 100;
    if (hospitalDigimonList.length === 0) {
      return 0;
    }

    let totalCost = 0;

    const rankMultiplier: Record<string, number> = {
      Mega: 3.5,
      Ultimate: 2.5,
      Champion: 1.5,
      Rookie: 1.0,
      'In-Training': 0.6,
      Fresh: 0.3,
    };

    hospitalDigimonList.forEach(digimon => {

      let digimonCost = BASE_HEAL_PRICE;

      const rankMult = rankMultiplier[digimon.rank] || 1.0;
      digimonCost *= rankMult;

      const levelMultiplier = 1 + (digimon.level - 1) * 0.05;
      digimonCost *= levelMultiplier;

      const hpPercentage = digimon.currentHp / digimon.maxHp;
      const damageMultiplier = 2 - hpPercentage;
      digimonCost *= damageMultiplier;

      totalCost += Math.ceil(digimonCost);
    });

    return totalCost;
  }
}
