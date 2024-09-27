import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseDigimon, Digimon } from '../core/interfaces/digimon.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class DigimonService {
  private baseDigimonDataSubject = new BehaviorSubject<BaseDigimon[]>([]);
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

  getBaseDigimonDataBySeed(seed: string): BaseDigimon | undefined {
    return this.baseDigimonDataSubject.value.find(
      (digimon) => digimon.seed === seed
    );
  }

  getBaseDigimonDataById(id: string): BaseDigimon | undefined {
    return this.baseDigimonDataSubject.value.find(
      (digimon) => digimon.seed === id
    );
  }

  getDigimonEvolutions(digimon?: Digimon | BaseDigimon): BaseDigimon[] {
    const digimonList: BaseDigimon[] = [];
    digimon?.digiEvolutionSeedList.forEach((seed) => {
      const digimon = this.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }

  getDigimonDegenerations(digimon?: Digimon | BaseDigimon): BaseDigimon[] {
    const digimonList: BaseDigimon[] = [];
    digimon?.degenerateSeedList.forEach((seed) => {
      const digimon = this.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }

  getDigimonCurrentEvolutionRoute(
    digimon?: Digimon
  ): BaseDigimon[] | undefined {
    return digimon?.currentEvolutionRoute?.map((digimon) =>
      this.getBaseDigimonDataBySeed(digimon.seed)
    ) as BaseDigimon[];
  }

  generateRandomDigimon(): Digimon {
    const randomDigimonIndex = Math.floor(
      Math.random() * this.baseDigimonDataSubject.value.length
    );

    const baseDigimon = this.baseDigimonDataSubject.value[randomDigimonIndex];
    const newDigimon: Digimon = {
      id: uuidv4(),
      birthDate: new Date(),
      seed: baseDigimon.seed,
      name: baseDigimon.name,
      img: baseDigimon.img,
      rank: baseDigimon.rank,
      species: baseDigimon.species,
      currentHp: baseDigimon.hp,
      maxHp: baseDigimon.hp,
      currentMp: baseDigimon.mp,
      maxMp: baseDigimon.mp,
      atk: baseDigimon.atk,
      def: baseDigimon.def,
      speed: baseDigimon.speed,
      exp: 0,
      totalExp: 0,
      level: 1,
      bitFarmingRate: baseDigimon.bitFarmingRate,
      digiEvolutionSeedList: baseDigimon.digiEvolutionSeedList,
      degenerateSeedList: baseDigimon.degenerateSeedList,
    };

    return newDigimon;
  }

  generateDigimonBySeed(seed: string): Digimon | undefined {
    const baseDigimon = this.getBaseDigimonDataBySeed(seed);
    if (!baseDigimon) return;

    const newDigimon: Digimon = {
      id: uuidv4(),
      birthDate: new Date(),
      seed: baseDigimon.seed,
      name: baseDigimon.name,
      img: baseDigimon.img,
      rank: baseDigimon.rank,
      species: baseDigimon.species,
      currentHp: baseDigimon.hp,
      maxHp: baseDigimon.hp,
      currentMp: baseDigimon.mp,
      maxMp: baseDigimon.mp,
      atk: baseDigimon.atk,
      def: baseDigimon.def,
      speed: baseDigimon.speed,
      exp: 0,
      totalExp: 0,
      level: 1,
      bitFarmingRate: baseDigimon.bitFarmingRate,
      digiEvolutionSeedList: baseDigimon.digiEvolutionSeedList,
      degenerateSeedList: baseDigimon.degenerateSeedList,
    };

    return newDigimon;
  }

  generateNewDigimon(digimon: BaseDigimon): Digimon {
    const newDigimon = {
      id: uuidv4(),
      birthDate: new Date(),
      seed: digimon.seed,
      name: digimon.name,
      img: digimon.img,
      rank: digimon.rank,
      species: digimon.species,
      currentHp: digimon.hp,
      maxHp: digimon.hp,
      currentMp: digimon.mp,
      maxMp: digimon.mp,
      atk: digimon.atk,
      def: digimon.def,
      speed: digimon.speed,
      exp: 0,
      totalExp: 0,
      level: 1,
      bitFarmingRate: digimon.bitFarmingRate,
      digiEvolutionSeedList: digimon.digiEvolutionSeedList,
      degenerateSeedList: digimon.degenerateSeedList,
    };

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

  checkRequirements(
    evolvingDigimon: Digimon,
    targetDigimon: BaseDigimon
  ): boolean {
    if (!evolvingDigimon || !targetDigimon) return false;
    const requirementCheckers: Record<string, Function> = {
      level: (evolvingDigimon: Digimon, value: number) =>
        evolvingDigimon.level >= value,
    };

    const value = targetDigimon.evolutionRequirements?.every((requirement) => {
      const checker = requirementCheckers[requirement.type];
      return checker ? checker(evolvingDigimon, requirement.value) : false;
    }) as boolean;

    return value;
  }

  getPossibleEvolutionStats(
    evolvingDigimon: Digimon,
    targetDigimon: BaseDigimon
  ): any {
    const rankMultipliers: Record<string, number> = {
      Fresh: 1.0,
      'In-Training': 1.1,
      Rookie: 1.2,
      Champion: 1.3,
      Ultimate: 1.5,
      Mega: 1.8,
    };

    const rankMultiplier =
      rankMultipliers[targetDigimon.rank] /
      rankMultipliers[evolvingDigimon.rank];

    return {
      maxHp: Math.round(
        (evolvingDigimon.maxHp > targetDigimon.hp
          ? evolvingDigimon.maxHp
          : targetDigimon.hp) * rankMultiplier
      ),
      maxMp: Math.round(
        (evolvingDigimon.maxMp > targetDigimon.mp
          ? evolvingDigimon.maxMp
          : targetDigimon.mp) * rankMultiplier
      ),
      atk: Math.round(
        (evolvingDigimon.atk > targetDigimon.atk
          ? evolvingDigimon.atk
          : targetDigimon.atk) * rankMultiplier
      ),
      def: Math.round(
        (evolvingDigimon.def > targetDigimon.def
          ? evolvingDigimon.def
          : targetDigimon.def) * rankMultiplier
      ),
      speed: Math.round(
        (evolvingDigimon.speed > targetDigimon.speed
          ? evolvingDigimon.speed
          : targetDigimon.speed) * rankMultiplier
      ),
      bitFarmingRate:
        evolvingDigimon.bitFarmingRate! + targetDigimon.bitFarmingRate + 1,
    };
  }

  evolveDigimon(evolvingDigimon: Digimon, targetSeed: string): Digimon | void {
    const rankMultipliers: Record<string, number> = {
      Fresh: 1.0,
      'In-Training': 1.1,
      Rookie: 1.2,
      Champion: 1.3,
      Ultimate: 1.5,
      Mega: 1.8,
    };
    const targetDigimon = this.getBaseDigimonDataBySeed(targetSeed);

    if (!targetDigimon) throw Error('Target Digimon not found!');

    if (!this.checkRequirements(evolvingDigimon, targetDigimon))
      throw Error('Evolution requirements not met!');

    const rankMultiplier =
      rankMultipliers[targetDigimon.rank] /
      rankMultipliers[evolvingDigimon.rank];

    evolvingDigimon.maxHp = Math.round(
      (evolvingDigimon.maxHp > targetDigimon.hp
        ? evolvingDigimon.maxHp
        : targetDigimon.hp) * rankMultiplier
    );
    evolvingDigimon.maxMp = Math.round(
      (evolvingDigimon.maxMp > targetDigimon.mp
        ? evolvingDigimon.maxMp
        : targetDigimon.mp) * rankMultiplier
    );
    evolvingDigimon.currentHp = evolvingDigimon.maxHp;
    evolvingDigimon.currentMp = evolvingDigimon.maxMp;

    evolvingDigimon.atk = Math.round(
      (evolvingDigimon.atk > targetDigimon.atk
        ? evolvingDigimon.atk
        : targetDigimon.atk) * rankMultiplier
    );
    evolvingDigimon.def = Math.round(
      (evolvingDigimon.def > targetDigimon.def
        ? evolvingDigimon.def
        : targetDigimon.def) * rankMultiplier
    );
    evolvingDigimon.speed = Math.round(
      (evolvingDigimon.speed > targetDigimon.speed
        ? evolvingDigimon.speed
        : targetDigimon.speed) * rankMultiplier
    );
    evolvingDigimon.bitFarmingRate! += targetDigimon.bitFarmingRate + 1;

    evolvingDigimon.exp = 0;
    evolvingDigimon.level = 1;

    if (!evolvingDigimon.currentEvolutionRoute) {
      evolvingDigimon.currentEvolutionRoute = [];
    }

    evolvingDigimon.currentEvolutionRoute.push({
      seed: evolvingDigimon.seed,
      rank: evolvingDigimon.rank,
    });

    evolvingDigimon.name = targetDigimon.name;
    evolvingDigimon.seed = targetDigimon.seed;
    evolvingDigimon.img = targetDigimon.img;
    evolvingDigimon.rank = targetDigimon.rank;
    evolvingDigimon.digiEvolutionSeedList = targetDigimon.digiEvolutionSeedList;
    evolvingDigimon.degenerateSeedList = targetDigimon.degenerateSeedList;

    return evolvingDigimon;
  }
}
