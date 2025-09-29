import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { DigiStatusCardComponent } from '@shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { Digimon } from '@core/interfaces/digimon.interface';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DigimonListLocation } from '@core/enums/digimon-list-location.enum';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { AudioService } from '@services/audio.service';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { ButtonComponent } from '@shared/components/button/button.component';
import { HospitalService } from '@state/services/hospital.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TooltipDirective } from 'app/directives/tooltip.directive';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { DigimonDetailsModalComponent } from 'app/shared/components/digimon-details-modal/digimon-details-modal.component';
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { takeLast } from 'rxjs';
import { SelectComponent } from "@shared/components/select/select.component";
import { InputComponent } from "@shared/components/input/input.component";
import { ToastService } from '@shared/components/toast/toast.service';
import { DesktopDataSource } from '@modules/desktop/desktop.datasource';
import { CommonModule } from '@angular/common';
import { LocalizedNumberPipe } from 'app/pipes/localized-number.pipe';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [
    CommonModule,
    LocalizedNumberPipe,
    DigiStatusCardComponent,
    ButtonComponent,
    DragDropModule,
    TranslocoModule,
    TooltipDirective,
    FormsModule,
    SelectComponent,
    InputComponent
  ],
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
  private toastService = inject(ToastService);
  private translocoService = inject(TranslocoService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected desktopDatasource = inject(DesktopDataSource);

  protected teamListId = 'team-list';
  protected inTrainingListId = 'in-training-digimon-list';
  protected bitFarmingListId = 'bit-farming-digimon-list';
  protected hospitalListId = 'hospital-digimon-list';
  protected fullHealPrice = signal(0);
  protected levelUpHospitalPrice = signal(0);
  protected healingRate = signal(0);
  protected hasDigimonsToHeal = signal(false);
  protected hasEnoughBitsForHealingAll = signal(false);
  protected hasEnoughBitsForLevelUpHopistal = signal(false);
  protected isCreatingTeam = signal(false);
  protected isHealAllEnabled = signal(this.canHealAll());
  protected isLevelUpHospitalEnabled = signal(this.canLevelUpHospital());
  protected isHospitalMaxLevel = computed(() => this.hospitalService.isHospitalMaxLevel(this.globalState.playerDataView()));

  protected newTeamName = model<string>('');
  protected playerTeams = signal<Array<{ label: string; value: string }>>([]);

  private listLocations: Record<string, string> = {
    'in-training-digimon-list': DigimonListLocation.IN_TRAINING,
    'bit-farming-digimon-list': DigimonListLocation.BIT_FARM,
    'team-list': DigimonListLocation.TEAM,
    'hospital-digimon-list': DigimonListLocation.HOSPITAL,
  };

  constructor() {
    effect(() => {
      const mappeedPlayerTeams = this.globalState.playerDataView().teams?.map(team => {
        return {
          label: team.name,
          value: team.name,
        }
      });

      this.playerTeams.set(mappeedPlayerTeams || []);
    });

    effect(() => {
      const hospital = this.globalState.playerDataView().hospitalDigimonList;
      const price = this.calculateFullHealPrice(hospital);
      this.fullHealPrice.set(price);
      const hasToHeal = hospital.length > 0 && hospital.some(d => d.currentHp < d.maxHp);
      this.hasDigimonsToHeal.set(hasToHeal);
      const bits = this.globalState.playerDataView().bits;
      const enough = bits >= price;
      this.hasEnoughBitsForHealingAll.set(enough);
      this.isHealAllEnabled.set(hasToHeal && enough);
    });

    effect(() => {
      const hospitalLevel = this.globalState.playerDataView().hospitalLevel;
      const healingRate = this.hospitalService.getHospitalHealingRateForLevel(hospitalLevel);
      this.healingRate.set(Math.floor(healingRate * 100));

      const hospitalLevelUpPrice = this.calculateLevelUpHospitalPrice();
      this.levelUpHospitalPrice.set(hospitalLevelUpPrice);

      const bits = this.globalState.playerDataView().bits;
      const enough = bits >= hospitalLevelUpPrice;

      this.hasEnoughBitsForLevelUpHopistal.set(enough);

      const isHospitalMaxLevel = this.hospitalService.isHospitalMaxLevel(this.globalState.playerDataView());

      this.isLevelUpHospitalEnabled.set(enough && !isHospitalMaxLevel);
    });

    this.globalState.digimonHpChanges$
      .pipe(takeUntilDestroyed(this.destroyRef), takeLast(1))
      .subscribe(() => {
        const hospital = this.globalState.playerDataView().hospitalDigimonList;
        const price = this.calculateFullHealPrice(hospital);
        this.fullHealPrice.set(price);
        const hasToHeal = hospital.length > 0 && hospital.some(d => d.currentHp < d.maxHp);
        this.hasDigimonsToHeal.set(hasToHeal);
        const bits = this.globalState.playerDataView().bits;
        const enough = bits >= price;
        this.hasEnoughBitsForHealingAll.set(enough);
        this.isHealAllEnabled.set(hasToHeal && enough);
        this.changeDetectorRef.detectChanges();
      });
  }

  setLayout() {
    const current = this.desktopDatasource.homeSectionLayout();
    const next = current === 'horizontal' ? 'vertical' : 'horizontal';
    this.desktopDatasource.homeSectionLayout.set(next);
  }

  healAll() {
    if (!this.isHealAllEnabled()) return;
    this.audioService.playAudio(AudioEffects.CLICK);
    this.hospitalService.fullHealHospitalDigimons(this.globalState.playerDataView());
    this.globalState.spendBits(this.fullHealPrice());
    this.isHealAllEnabled.set(this.canHealAll());
    this.changeDetectorRef.detectChanges();
  }

  canHealAll() {
    return this.hasDigimonsToHeal() && this.hasEnoughBitsForHealingAll();
  }

  canLevelUpHospital() {
    return this.hasEnoughBitsForLevelUpHopistal();
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
    return this.globalState.playerDataView().digimonList.some(d => d.currentHp === 0 || d.currentHp <= 0.2 * d.maxHp);
  }

  sendInjuredDigimonToHospital(): void {
    const lowHpDigimons = this.globalState.playerDataView().digimonList.filter(d => d.currentHp === 0 || d.currentHp <= 0.2 * d.maxHp);
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
          this.globalState.playerDataView().digimonList,
          previousIndex,
          currentIndex
        ),
      [this.hospitalListId]: () =>
        moveItemInArray(
          this.globalState.playerDataView().hospitalDigimonList,
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
          this.globalState.playerDataView().digimonList,
          this.globalState.playerDataView().digimonList.length - 1,
          currentIndex
        );
      },
      [this.hospitalListId]: () => {
        this.globalState.addDigimonToHospital(digimon, action),
          moveItemInArray(
            this.globalState.playerDataView().hospitalDigimonList,
            this.globalState.playerDataView().hospitalDigimonList.length - 1,
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
        this.globalState.playerDataView().inTrainingDigimonList,
      [this.bitFarmingListId]:
        this.globalState.playerDataView().bitFarmDigimonList,
      [this.teamListId]: this.globalState.playerDataView().digimonList,
      [this.hospitalListId]:
        this.globalState.playerDataView().hospitalDigimonList,
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
      if (digimon.currentHp >= digimon.maxHp) return;

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

  protected calculateLevelUpHospitalPrice() {
    const hospitalLevel = this.globalState.playerDataView().hospitalLevel + 1;

    const priceTableForEachLevel: Record<string, number> = {
      '1': 0,
      '2': 9000,
      '3': 40000,
      '4': 120000,
      '5': 500000
    };

    return priceTableForEachLevel[hospitalLevel.toString()] || 0;
  }

  protected setSelectedTeam($event: string) {
    this.desktopDatasource.selectedTeam.set($event);
    this.globalState.loadBattleTeam(this.desktopDatasource.selectedTeam());
  }

  protected processTeamCreation() {
    this.isCreatingTeam.set(false);

    if (!this.newTeamName()) return;

    this.globalState.createBattleTeam(this.newTeamName());

    this.setSelectedTeam(this.newTeamName());
    this.newTeamName.set('');
  }

  protected updateTeam() {
    this.globalState.updateBattleTeam(this.desktopDatasource.selectedTeam());
    this.setSelectedTeam(this.desktopDatasource.selectedTeam());
  }

  protected removeTeam() {
    this.globalState.removeBattleTeam(this.desktopDatasource.selectedTeam());
    this.desktopDatasource.selectedTeam.set('');
  }

  protected levelUpHospital() {
    this.hospitalService.levelUpHospital(this.globalState.playerDataView());
    this.globalState.spendBits(this.levelUpHospitalPrice());
    this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.LEVEL_UP_HOSPITAL_SUCCESS_TOAST', { level: this.globalState.playerDataView().hospitalLevel }), 'success');
  }
}
