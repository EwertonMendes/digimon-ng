import { Component, inject } from '@angular/core';
import { GlobalStateDataSource } from '../../../../global-state.datasource';

@Component({
  selector: 'app-explore-section',
  standalone: true,
  imports: [],
  templateUrl: './explore-section.component.html',
  styleUrl: './explore-section.component.scss',
})
export class ExploreSectionComponent {
  globalState = inject(GlobalStateDataSource);

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

    if (
      this.globalState.playerData().digimonList.length === 0 ||
      this.globalState.playerData().digimonList.every((d) => d.currentHp <= 0)
    ) {
      console.log('No Digimon to explore with.');
      return;
    }

    const opponentDigimon = this.globalState.generateRandomDigimon();
    console.log(`Found a ${opponentDigimon.name}!`, opponentDigimon);

    const turnOrder = [
      ...this.globalState
        .playerData()
        .digimonList.filter((digimon) => digimon.currentHp > 0),
      opponentDigimon,
    ];
    turnOrder.sort(() => Math.random() - 0.5);

    console.log(
      'Turn order:',
      turnOrder.map((digimon) => digimon.name).join(', ')
    );

    let battleActive = true;

    while (battleActive) {
      for (const digimon of turnOrder) {
        if (!battleActive) break;

        if (digimon.currentHp <= 0) continue;

        if (this.globalState.playerData().digimonList.includes(digimon)) {
          this.globalState.battle(digimon, opponentDigimon);

          console.log(
            `${digimon.name} attacks! ${opponentDigimon.name} has ${opponentDigimon.currentHp} health left.`
          );

          if (opponentDigimon.currentHp <= 0) {
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
              `${opponentDigimon.name} attacks! ${target.name} has ${target.currentHp} health left.`
            );
          }

          if (
            this.globalState
              .playerData()
              .digimonList.every((d) => d.currentHp <= 0)
          ) {
            console.log('All player Digimon are defeated. Battle lost.');
            battleActive = false;
            break;
          }
        }
      }
    }

    if (opponentDigimon.currentHp <= 0) {
      console.log('Victory! Opponent Digimon is defeated.');
    }
  }
}
