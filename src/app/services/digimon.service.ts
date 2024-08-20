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

  getDigimonCurrentEvolutionRoute(digimon?: Digimon) {
    return digimon?.currentEvolutionRoute?.map((digimon) =>
      this.getBaseDigimonDataBySeed(digimon.seed)
    ) as Digimon[];
  }

  generateRandomDigimon() {
    const randomDigimonIndex = Math.floor(
      Math.random() * this.baseDigimonData.length
    );
    const newDigimon = { ...this.baseDigimonData[randomDigimonIndex] };

    newDigimon.id = uuidv4();

    return newDigimon;
  }

  getRankOrder(rank: string): number {
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

}
