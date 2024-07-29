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

  exploreLocation(location: Location) {
    this.log(`Exploring location ${location.name}`);

    if (this.isPlayerTeamEmpty()) {
      this.log('No Digimon to explore with.');
      this.toastService.showToast('No Digimon to explore with.', 'error');
      return;
    }

    this.modalService.open('battle-modal');
    this.generateOpponents();

    const turnOrder = this.getTurnOrder();
    this.log(`Turn order: ${turnOrder.map((d) => d.name).join(', ')}`);

    this.startBattle(turnOrder);
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

  private getTurnOrder() {
    const playerTeam = this.globalState.playerDataAcessor.digimonList.filter(
      (d) => d.currentHp > 0
    );
    const enemyTeam = this.globalState.enemyTeamAccessor.filter(
      (d) => d.currentHp > 0
    );
    return [...playerTeam, ...enemyTeam].sort(() => Math.random() - 0.5);
  }

  private startBattle(turnOrder: Digimon[]) {
    let battleActive = true;

    while (battleActive) {
      if (turnOrder.length <= 1) break;

      for (const digimon of turnOrder) {
        if (!battleActive) break;
        if (digimon.currentHp <= 0) continue;

        if (this.globalState.playerDataAcessor.digimonList.includes(digimon)) {
          battleActive = this.playerAttack(digimon);
          continue;
        }
        battleActive = this.enemyAttack(digimon);
      }
    }

    if (this.globalState.enemyTeamAccessor.every((d) => d.currentHp <= 0)) {
      this.log('Victory! Opponent Digimons were defeated.');
      this.toastService.showToast(
        'Victory! Opponent Digimons were defeated.',
        'success'
      );
      battleActive = false;
    }
  }

  private playerAttack(digimon: Digimon): boolean {
    const opponentDigimon = this.globalState.enemyTeamAccessor.find(
      (d) => d.currentHp > 0
    );
    if (!opponentDigimon) return false;

    this.globalState.battle(digimon, opponentDigimon);
    this.log(
      `${digimon.name} attacks! ${opponentDigimon.name} has ${opponentDigimon.currentHp} health left.`
    );

    if (this.globalState.enemyTeamAccessor.every((d) => d.currentHp <= 0)) {
      return false;
    }
    return true;
  }

  private enemyAttack(digimon: Digimon): boolean {
    const target = this.globalState.playerDataAcessor.digimonList.find(
      (d) => d.currentHp > 0
    );
    if (!target) return false;

    this.globalState.battle(digimon, target);
    this.log(
      `Enemy ${digimon.name} attacks! ${target.name} has ${target.currentHp} health left.`
    );

    if (
      this.globalState.playerDataAcessor.digimonList.every(
        (d) => d.currentHp <= 0
      )
    ) {
      this.log('All player Digimon are defeated. Battle lost.');
      this.toastService.showToast(
        'All player Digimon are defeated. Battle lost.',
        'error',
        'ph-skull'
      );
      return false;
    }
    return true;
  }

  private log(message: string) {
    console.log(message);
    this.globalState.log(message);
  }
}
