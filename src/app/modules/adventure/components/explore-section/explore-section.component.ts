import { Component, inject, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { BattleModalComponent } from '@shared/components/battle-modal/battle-modal.component';
import { Digimon } from '@core/interfaces/digimon.interface';
import { ToastService } from '@shared/components/toast/toast.service';
import { AudioService } from '@services/audio.service';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { LOCATIONS } from '@core/consts/locations';

interface Location {
  name: string;
  img: string;
  possibleEcounterDigimonSeeds: { seed: string; levelRange: { min: number; max: number }; rarity: number }[];
  levelRange: { min: number; max: number };
}

@Component({
  selector: 'app-explore-section',
  standalone: true,
  imports: [BattleModalComponent, TranslocoModule],
  templateUrl: './explore-section.component.html',
  styleUrl: './explore-section.component.scss',
})
export class ExploreSectionComponent {
  protected globalState = inject(GlobalStateDataSource);
  private modalService = inject(ModalService);
  private translocoService = inject(TranslocoService);
  private toastService = inject(ToastService);
  private audioService = inject(AudioService);

  locations: Location[] = [...LOCATIONS];
  currentLocation = signal<Location | null>(null)

  baseTurnOrder: Digimon[] = [];
  actualTurnOrder: Digimon[] = [];
  showPlayerAttackButton = false;

  exploreLocation(location: Location) {
    this.currentLocation.set(location);
    this.audioService.playAudio(AudioEffects.CLICK);
    this.log(this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.LOG_EXPLORING_LOCATION', { location: this.translocoService.translate(location.name) }));

    if (this.isPlayerTeamEmpty()) {
      const noDigimonMsg = this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.NO_DIGIMON_TO_EXPLORE');
      this.log(noDigimonMsg);
      this.toastService.showToast(noDigimonMsg, 'error');
      return;
    }

    this.generateOpponentsOnExploreLocation(location);
    this.modalService.open('battle-modal', BattleModalComponent, {
      imageBackground: location.img
    });

    this.startBattle();
  }

  private isPlayerTeamEmpty(): boolean {
    const playerTeam = this.globalState.playerDataAcessor.digimonList;
    return playerTeam.length === 0 || playerTeam.every((d) => d.currentHp <= 0);
  }

  private generateOpponentsOnExploreLocation(location: Location) {
    const randomNumber = Math.round(Math.random() * 3) + 1;

    if (
      !location.possibleEcounterDigimonSeeds ||
      location.possibleEcounterDigimonSeeds.length === 0
    ) {
      for (let i = 0; i < randomNumber; i++) {
        const randomLevel = Math.floor(
          Math.random() * (location.levelRange.max - location.levelRange.min + 1) +
          location.levelRange.min
        );
        const opponentDigimon = this.globalState.generateRandomDigimon(randomLevel);
        this.globalState.enemyTeamAccessor.push(opponentDigimon);
        this.log(this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.ENEMY_FOUND', { name: opponentDigimon.name }));
      }
      return;
    }

    const seeds = location.possibleEcounterDigimonSeeds;
    const weights = seeds.map(seed => 1 - seed.rarity);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    for (let i = 0; i < randomNumber; i++) {
      let randomValue = Math.random() * totalWeight;
      let selectedIndex = -1;

      for (let j = 0; j < weights.length; j++) {
        randomValue -= weights[j];
        if (randomValue <= 0) {
          selectedIndex = j;
          break;
        }
      }

      if (selectedIndex === -1) {
        selectedIndex = Math.floor(Math.random() * seeds.length);
      }

      const selectedDigimon = seeds[selectedIndex];
      const randomLevel = Math.floor(
        Math.random() * (selectedDigimon.levelRange.max - selectedDigimon.levelRange.min + 1) +
        selectedDigimon.levelRange.min
      );
      const opponentDigimon = this.globalState.generateDigimonBySeed(
        selectedDigimon.seed,
        randomLevel
      );
      if (!opponentDigimon) continue;
      this.globalState.enemyTeamAccessor.push(opponentDigimon);
      this.log(this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.ENEMY_FOUND', { name: opponentDigimon.name }));
    }
  }

  private startBattle() {
    this.globalState.startBattle();
  }

  private log(message: string) {
    this.globalState.log(message);
  }
}
