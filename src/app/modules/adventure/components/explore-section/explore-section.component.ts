import { Component, inject } from '@angular/core';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { BattleModalComponent } from '../../../../shared/components/battle-modal/battle-modal.component';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { ToastService } from '../../../../shared/components/toast/toast.service';

interface Location {
  name: string;
  img: string;
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
    { name: 'Login Mountain', img: 'assets/environments/loginmountain.png' },
    { name: 'Pixel Desert', img: 'assets/environments/pixeldesert.png' },
    { name: 'Register Jungle', img: 'assets/environments/registerjungle.png' },
    { name: 'Proxy Island', img: 'assets/environments/proxyisland.png' },
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

    this.generateOpponents();
    this.modalService.open('battle-modal');

    this.startBattle();
  }

  private isPlayerTeamEmpty(): boolean {
    const playerTeam = this.globalState.playerDataAcessor.digimonList;
    return playerTeam.length === 0 || playerTeam.every((d) => d.currentHp <= 0);
  }

  private generateOpponents() {
    const randomNumber = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < randomNumber; i++) {
      const opponentDigimon = this.globalState.generateRandomDigimon();
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
