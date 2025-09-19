import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { DigiStatusCardComponent } from '@shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { Digimon } from '@core/interfaces/digimon.interface';
import { CdkDragDrop, DragDropModule, DropListOrientation, moveItemInArray } from '@angular/cdk/drag-drop';
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
import { takeLast } from 'rxjs';
import { SelectComponent } from "@shared/components/select/select.component";
import { InputComponent } from "@shared/components/input/input.component";

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [
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
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  protected selectedLayout = signal<DropListOrientation>('horizontal')

  protected teamListId = 'team-list';
  protected inTrainingListId = 'in-training-digimon-list';
  protected bitFarmingListId = 'bit-farming-digimon-list';
  protected hospitalListId = 'hospital-digimon-list';
  protected fullHealPrice = signal(0);
  protected hasDigimonsToHeal = signal(false);
  protected hasEnoughBits = signal(false);
  protected isCreatingTeam = signal(false);

  protected newTeamName = model<string>('');
  protected playerTeams = signal<Array<{ label: string; value: string }>>([]);
  protected selectedTeam = signal('');

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
      this.hasEnoughBits.set(enough);
      this.isHealAllEnabled.set(hasToHeal && enough);
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
        this.hasEnoughBits.set(enough);
        this.isHealAllEnabled.set(hasToHeal && enough);
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
    this.hospitalService.fullHealHospitalDigimons(this.globalState.playerDataView());
    this.globalState.spendBits(this.fullHealPrice());
    this.isHealAllEnabled.set(this.canHealAll());
    this.changeDetectorRef.detectChanges();
  }

  canHealAll() {
    return this.hasDigimonsToHeal() && this.hasEnoughBits();
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

  protected setSelectedTeam($event: string) {
    this.selectedTeam.set($event);
    this.globalState.loadBattleTeam(this.selectedTeam());
  }

  protected processTeamCreation() {
    this.isCreatingTeam.set(false);

    if (!this.newTeamName()) return;

    this.globalState.createBattleTeam(this.newTeamName());

    this.setSelectedTeam(this.newTeamName());
    this.newTeamName.set('');
  }

  protected updateTeam() {
    this.globalState.updateBattleTeam(this.selectedTeam());
    this.setSelectedTeam(this.selectedTeam());
  }

  protected removeTeam() {
    this.globalState.removeBattleTeam(this.selectedTeam());
    this.selectedTeam.set('');
  }
}
