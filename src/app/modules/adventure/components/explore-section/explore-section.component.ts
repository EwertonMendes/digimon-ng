import { Component, inject } from '@angular/core';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { BattleModalComponent } from '../../../../shared/components/battle-modal/battle-modal.component';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { DigimonSeeds } from '../../../../core/enums/digimon-seeds.enum';
import { AudioService } from '../../../../services/audio.service';
import { AudioEffects } from '../../../../core/enums/audio-tracks.enum';

interface Location {
  name: string;
  img: string;
  possibleEcounterDigimonSeeds: string[];
  levelRange: { min: number; max: number };
}

@Component({
  selector: 'app-explore-section',
  standalone: true,
  imports: [BattleModalComponent],
  templateUrl: './explore-section.component.html',
  styleUrl: './explore-section.component.scss',
})
export class ExploreSectionComponent {
  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);
  toastService = inject(ToastService);
  audioService = inject(AudioService);

  locations: Location[] = [
    {
      name: 'Login Mountain',
      img: 'assets/environments/loginmountain.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.BOTAMON,
        DigimonSeeds.KOROMON,
        DigimonSeeds.AGUMON,
      ],
      levelRange: { min: 1, max: 5 },
    },
    {
      name: 'Pixel Desert',
      img: 'assets/environments/pixeldesert.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.AGUMON,
        DigimonSeeds.GREYMON,
        DigimonSeeds.APEMON,
      ],
      levelRange: { min: 5, max: 10 },
    },
    {
      name: 'Register Jungle',
      img: 'assets/environments/registerjungle.png',
      possibleEcounterDigimonSeeds: [],
      levelRange: { min: 10, max: 15 },
    },
    {
      name: 'Proxy Island',
      img: 'assets/environments/proxyisland.png',
      possibleEcounterDigimonSeeds: [],
      levelRange: { min: 20, max: 30 },
    },
  ];

  baseTurnOrder: Digimon[] = [];
  actualTurnOrder: Digimon[] = [];
  showPlayerAttackButton = false;

  exploreLocation(location: Location) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.log(`Exploring location ${location.name}`);

    if (this.isPlayerTeamEmpty()) {
      this.log('No Digimon to explore with.');
      this.toastService.showToast('No Digimon to explore with.', 'error');
      return;
    }

    this.generateOpponentsOnExploreLocation(location);
    this.modalService.open('battle-modal');

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
          Math.random() * (location.levelRange.max - location.levelRange.min) +
            location.levelRange.min
        );
        const opponentDigimon =
          this.globalState.generateRandomDigimon(randomLevel);
        this.globalState.enemyTeamAccessor.push(opponentDigimon);
        this.log(`(Enemy) ${opponentDigimon.name} was found!`);
      }
      return;
    }

    for (let i = 0; i < randomNumber; i++) {
      const randomLevel = Math.floor(
        Math.random() * (location.levelRange.max - location.levelRange.min) +
          location.levelRange.min
      );
      const randomPossibleSeedIndex = Math.floor(
        Math.random() * location.possibleEcounterDigimonSeeds.length
      );
      const opponentDigimon = this.globalState.generateDigimonBySeed(
        location.possibleEcounterDigimonSeeds[randomPossibleSeedIndex],
        randomLevel
      );
      if (!opponentDigimon) return;
      this.globalState.enemyTeamAccessor.push(opponentDigimon);
      this.log(`(Enemy) ${opponentDigimon.name} was found!`);
    }
  }

  private startBattle() {
    this.globalState.startBattle();
  }

  private log(message: string) {
    this.globalState.log(message);
  }
}
