import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Digimon } from '../core/interfaces/digimon.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class DigimonService {
  private baseDigimonDataSubject = new BehaviorSubject<Digimon[]>([]);
  baseDigimonData$ = this.baseDigimonDataSubject.asObservable();

  constructor() {
    this.initializeBaseDigimonData();
  }

  private async initializeBaseDigimonData() {
    const data = await fetch('database/base-digimon-list.json').then((res) =>
      res.json()
    );
    this.baseDigimonDataSubject.next(data);
  }

  getBaseDigimonDataBySeed(seed: string): Digimon | undefined {
    return this.baseDigimonDataSubject.value.find(
      (digimon) => digimon.seed === seed
    );
  }

  getBaseDigimonDataById(id: string): Digimon | undefined {
    return this.baseDigimonDataSubject.value.find(
      (digimon) => digimon.seed === id
    );
  }

  getDigimonEvolutions(digimon?: Digimon): Digimon[] {
    const digimonList: Digimon[] = [];
    digimon?.digiEvolutionSeedList.forEach((seed) => {
      const digimon = this.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }

  getDigimonDegenerations(digimon?: Digimon): Digimon[] {
    const digimonList: Digimon[] = [];
    digimon?.degenerateSeedList.forEach((seed) => {
      const digimon = this.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }

  getDigimonCurrentEvolutionRoute(digimon?: Digimon): Digimon[] | undefined {
    return digimon?.currentEvolutionRoute?.map((digimon) =>
      this.getBaseDigimonDataBySeed(digimon.seed)
    ) as Digimon[];
  }

  generateRandomDigimon(): Digimon {
    const randomDigimonIndex = Math.floor(
      Math.random() * this.baseDigimonDataSubject.value.length
    );
    const newDigimon = {
      ...this.baseDigimonDataSubject.value[randomDigimonIndex],
    };

    newDigimon.id = uuidv4();

    return newDigimon;
  }

  generateNewDigimon(digimon: Digimon): Digimon {
    const newDigimon = { ...digimon };

    newDigimon.id = uuidv4();
    newDigimon.birthDate = new Date();

    return newDigimon;
  }

  generateDigimonBySeed(seed: string): Digimon | undefined {
    const baseDigimon = this.getBaseDigimonDataBySeed(seed);
    if (!baseDigimon) return;
    const newDigimon = { ...baseDigimon };

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
