import { Injectable } from '@angular/core';
import { Digimon } from '../core/interfaces/digimon.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class DigimonService {
  baseDigimonData!: Digimon[];

  constructor() {
    this.initializeBaseDigimonData();
  }

  private async initializeBaseDigimonData() {
    this.baseDigimonData = await fetch('database/base-digimon-list.json').then(
      (res) => res.json()
    );
  }

  getBaseDigimonDataBySeed(seed: string) {
    return this.baseDigimonData.find((digimon) => digimon.seed === seed);
  }

  getBaseDigimonDataById(id: string) {
    return this.baseDigimonData.find((digimon) => digimon.seed === id);
  }

  getDigimonEvolutions(digimon?: Digimon) {
    const digimonList: Digimon[] = [];
    digimon?.digiEvolutionSeedList.forEach((seed) => {
      const digimon = this.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }

  getDigimonDegenerations(digimon?: Digimon) {
    const digimonList: Digimon[] = [];
    digimon?.degenerateSeedList.forEach((seed) => {
      const digimon = this.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }

  getDigimonCompleteEvolutionTree(digimon?: Digimon) {
    let mainEvolutionTree: Digimon[] = [];
    const directEvolutions: Digimon[] = this.getDigimonEvolutions(digimon);
    const directDegenerations: Digimon[] =
      this.getDigimonDegenerations(digimon);

    const digimonQueueForward: Digimon[] = [];
    const digimonQueueBackward: Digimon[] = [];
    const visited: Set<string> = new Set();

    if (digimon) {
      digimonQueueForward.push(digimon);
      digimonQueueBackward.push(digimon);
    }

    while (digimonQueueBackward.length > 0) {
      const currentDigimon = digimonQueueBackward.shift();
      if (currentDigimon && !visited.has(currentDigimon.seed)) {
        mainEvolutionTree.push(currentDigimon);
        visited.add(currentDigimon.seed);

        currentDigimon.degenerateSeedList.forEach((seed) => {
          const nextDigimon = this.getBaseDigimonDataBySeed(seed);
          if (nextDigimon) digimonQueueBackward.push(nextDigimon);
        });
      }
    }

    visited.delete(digimon?.seed!);

    while (digimonQueueForward.length > 0) {
      const currentDigimon = digimonQueueForward.shift();
      if (currentDigimon && !visited.has(currentDigimon.seed)) {
        if (currentDigimon.seed !== digimon?.seed)
          mainEvolutionTree.push(currentDigimon);
        visited.add(currentDigimon.seed);
        currentDigimon.digiEvolutionSeedList.forEach((seed) => {
          const nextDigimon = this.getBaseDigimonDataBySeed(seed);
          if (nextDigimon) digimonQueueForward.push(nextDigimon);
        });
      }
    }

    if (mainEvolutionTree.every((d) => d.seed === digimon?.seed)) {
      mainEvolutionTree = [];
    }

    mainEvolutionTree.sort(
      (a, b) => this.getRankOrder(a.rank) - this.getRankOrder(b.rank)
    );

    return {
      mainEvolutionTree,
      directEvolutions,
      directDegenerations,
    };
  }

  private getRankOrder(rank: string): number {
    const rankOrder: Record<string, number> = {
      'Baby I': 1,
      'Baby II': 2,
      Rookie: 3,
      Champion: 4,
      Ultimate: 5,
      Mega: 6,
    };
    return rankOrder[rank] || 0;
  }

  generateRandomDigimon() {
    const randomDigimonIndex = Math.floor(
      Math.random() * this.baseDigimonData.length
    );
    const newDigimon = this.baseDigimonData[randomDigimonIndex];

    newDigimon.id = uuidv4();

    return newDigimon;
  }
}
