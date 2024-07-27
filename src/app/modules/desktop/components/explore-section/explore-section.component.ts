import { Component, inject } from '@angular/core';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { BattleModalComponent } from '../../../../shared/components/battle-modal/battle-modal.component';
import { ModalService } from '../../../../shared/components/modal/modal.service';

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

  locations = [
    {
      name: 'Login Mountain',
      img: 'assets/environments/loginmountain.png',
    },
    {
      name: 'Pixel Desert',
      img: 'assets/environments/pixeldesert.png',
    },
    {
      name: 'Register Jungle',
      img: 'assets/environments/registerjungle.png',
    },
    {
      name: 'Proxy Island',
      img: 'assets/environments/proxyisland.png',
    },
  ];

  exploreLocation(location: any) {
    //TODO: refactor this code
    console.log(`Exploring location ${location.name}`);
    this.globalState.log(`Exploring location ${location.name}`);

    if (
      this.globalState.playerData().digimonList.length === 0 ||
      this.globalState.playerData().digimonList.every((d) => d.currentHp <= 0)
    ) {
      console.log('No Digimon to explore with.');
      this.globalState.log('No Digimon to explore with.');
      return;
    }

    this.modalService.open('battle-modal');

    const randomNumber = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < randomNumber; i++) {
      const opponentDigimon = this.globalState.generateRandomDigimon();
      this.globalState.enemyTeam().push(opponentDigimon);

      console.log(`Found a ${opponentDigimon.name}!`, opponentDigimon);
      this.globalState.log(`Found a ${opponentDigimon.name}!`);
    }

    const turnOrder = [
      ...this.globalState
        .playerData()
        .digimonList.filter((digimon) => digimon.currentHp > 0),
      ...this.globalState.enemyTeam().filter((digimon) => digimon.currentHp > 0),
    ];
    turnOrder.sort(() => Math.random() - 0.5);

    console.log(
      'Turn order:',
      turnOrder.map((digimon) => digimon.name).join(', ')
    );
    this.globalState.log(
      `Turn order:
      ${turnOrder.map((digimon) => digimon.name).join(', ')}`
    );

    let battleActive = true;

    while (battleActive) {
      if(turnOrder.length <=1) break
      for (const digimon of turnOrder) {
        if (!battleActive) break;

        if (digimon.currentHp <= 0) continue;

        if (this.globalState.playerData().digimonList.includes(digimon)) {

          const opponentDigimon = this.globalState
            .enemyTeam()
            .find((d) => d.currentHp > 0);

            if(!opponentDigimon) {
              continue;
            };

          this.globalState.battle(digimon, opponentDigimon);

          console.log(
            `${digimon.name} attacks! ${opponentDigimon.name} has ${opponentDigimon.currentHp} health left.`
          );
          this.globalState.log(
            `${digimon.name} attacks! ${opponentDigimon.name} has ${opponentDigimon.currentHp} health left.`
          );

          if (this.globalState.enemyTeam().every((d) => d.currentHp <= 0)) {
            battleActive = false;
            break;
          }
        } else {
          const target = this.globalState
            .playerData()
            .digimonList.find((d) => d.currentHp > 0);
          if (target) {
            this.globalState.battle(digimon, target);
            console.log(
              `Enemy ${digimon.name} attacks! ${target.name} has ${target.currentHp} health left.`
            );
            this.globalState.log(
              `Enemy ${digimon.name} attacks! ${target.name} has ${target.currentHp} health left.`
            );
          }

          if (
            this.globalState
              .playerData()
              .digimonList.every((d) => d.currentHp <= 0)
          ) {
            console.log('All player Digimon are defeated. Battle lost.');
            this.globalState.log(
              'All player Digimon are defeated. Battle lost.'
            );
            battleActive = false;
            break;
          }
        }
      }
    }

    if (this.globalState.enemyTeam().every((d) => d.currentHp <= 0)) {
      console.log('Victory! Opponent Digimon is defeated.');
      this.globalState.log('Victory! Opponent Digimon is defeated.');
    }
  }
}
