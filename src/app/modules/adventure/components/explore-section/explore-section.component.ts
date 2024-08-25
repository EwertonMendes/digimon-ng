import { Component, inject } from '@angular/core';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { BattleModalComponent } from '../../../../shared/components/battle-modal/battle-modal.component';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { ToastService } from '../../../../shared/components/toast/toast.service';

interface Location {
  name: string;
  img: string;
  possibleEcounterDigimonSeeds: string[];
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

  locations: Location[] = [
    {
      name: 'Login Mountain',
      img: 'assets/environments/loginmountain.png',
      possibleEcounterDigimonSeeds: [
        'b5ac222a-e653-4543-923e-77355dd24686',
        'edc9812f-82a6-487f-9a4d-52b845643176',
        '96c23ff9-d6b4-43da-91e6-f0c9799c65d7',
      ],
    },
    {
      name: 'Pixel Desert',
      img: 'assets/environments/pixeldesert.png',
      possibleEcounterDigimonSeeds: [
        '96c23ff9-d6b4-43da-91e6-f0c9799c65d7',
        '70dbb38a-690e-45b3-bfc5-eccba64fbd9b',
        'cd52bdf0-80a8-4b19-b738-ed6acf1f0b14',
      ],
    },
    {
      name: 'Register Jungle',
      img: 'assets/environments/registerjungle.png',
      possibleEcounterDigimonSeeds: [],
    },
    {
      name: 'Proxy Island',
      img: 'assets/environments/proxyisland.png',
      possibleEcounterDigimonSeeds: [],
    },
  ];

  baseTurnOrder: Digimon[] = [];
  actualTurnOrder: Digimon[] = [];
  showPlayerAttackButton = false;

  exploreLocation(location: Location) {
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
        const opponentDigimon = this.globalState.generateRandomDigimon();
        this.globalState.enemyTeamAccessor.push(opponentDigimon);
        this.log(`(Enemy) ${opponentDigimon.name} was found!`);
      }
      return;
    }

    for (let i = 0; i < randomNumber; i++) {
      const randomPossibleSeedIndex = Math.floor(
        Math.random() * location.possibleEcounterDigimonSeeds.length
      )
      const opponentDigimon = this.globalState.generateDigimonBySeed(
        location.possibleEcounterDigimonSeeds[randomPossibleSeedIndex]
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
