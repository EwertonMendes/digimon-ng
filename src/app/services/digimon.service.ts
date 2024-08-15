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

    if (digimon) {
      const visited: Set<string> = new Set();
      const digimonQueueForward: Digimon[] = [digimon];
      const digimonQueueBackward: Digimon[] = [digimon];

      this.processBackwardQueue(
        digimonQueueBackward,
        visited,
        mainEvolutionTree
      );

      visited.delete(digimon.seed);
      this.processForwardQueue(
        digimonQueueForward,
        visited,
        mainEvolutionTree,
        digimon.seed
      );

      if (
        this.isTreeContainingOnlySelectedDigimon(
          mainEvolutionTree,
          digimon.seed
        )
      ) {
        mainEvolutionTree = [];
      }

      mainEvolutionTree.sort(
        (a, b) => this.getRankOrder(a.rank) - this.getRankOrder(b.rank)
      );
    }

    return {
      mainEvolutionTree,
      directEvolutions,
      directDegenerations,
    };
  }

  generateRandomDigimon() {
    const randomDigimonIndex = Math.floor(
      Math.random() * this.baseDigimonData.length
    );
    const newDigimon = { ...this.baseDigimonData[randomDigimonIndex] };

    newDigimon.id = uuidv4();

    return newDigimon;
  }

  private getRankOrder(rank: string): number {
    const rankOrder: Record<string, number> = {
      Fresh: 1,
      'In-Training': 2,
      Rookie: 3,
      Champion: 4,
      Ultimate: 5,
      Mega: 6,
    };
    return rankOrder[rank] || 0;
  }

  private processBackwardQueue(
    queue: Digimon[],
    visited: Set<string>,
    tree: Digimon[]
  ) {
    while (queue.length > 0) {
      const currentDigimon = queue.shift();
      if (currentDigimon && !visited.has(currentDigimon.seed)) {
        tree.push(currentDigimon);
        visited.add(currentDigimon.seed);
        currentDigimon.degenerateSeedList.forEach((seed) => {
          const nextDigimon = this.getBaseDigimonDataBySeed(seed);
          if (nextDigimon) queue.push(nextDigimon);
        });
      }
    }
  }

  private processForwardQueue(
    queue: Digimon[],
    visited: Set<string>,
    tree: Digimon[],
    initialSeed: string
  ) {
    while (queue.length > 0) {
      const currentDigimon = queue.shift();
      if (currentDigimon && !visited.has(currentDigimon.seed)) {
        if (currentDigimon.seed !== initialSeed) tree.push(currentDigimon);
        visited.add(currentDigimon.seed);
        currentDigimon.digiEvolutionSeedList.forEach((seed) => {
          const nextDigimon = this.getBaseDigimonDataBySeed(seed);
          if (nextDigimon) queue.push(nextDigimon);
        });
      }
    }
  }

  private isTreeContainingOnlySelectedDigimon(
    tree: Digimon[],
    seed: string
  ): boolean {
    return tree.every((d) => d.seed === seed);
  }
}
