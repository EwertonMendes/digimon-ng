import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseDigimon, Digimon } from '@core/interfaces/digimon.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class DigimonService {
  private baseDigimonDataSubject = new BehaviorSubject<BaseDigimon[]>([]);
  baseDigimonData$ = this.baseDigimonDataSubject.asObservable();

  private maxHpMp = 999999;
  private maxOtherStats = 99999;

  constructor() {
    this.readBaseDigimonDatabase();
  }

  async readBaseDigimonDatabase() {
    const data = await fetch('database/base-digimon-list.json').then((res) =>
      res.json()
    );
    this.baseDigimonDataSubject.next(data);
  }

  getBaseDigimonDataBySeed(seed: string): BaseDigimon | null {
    return this.baseDigimonDataSubject.value.find(
      (digimon) => digimon.seed === seed
    ) ?? null;
  }

  getBaseDigimonDataById(id: string): BaseDigimon | null {
    return this.baseDigimonDataSubject.value.find(
      (digimon) => digimon.seed === id
    ) ?? null;
  }

  getDigimonEvolutions(digimon?: Digimon | BaseDigimon): BaseDigimon[] {
    return this.getDigimonListBySeeds(digimon?.digiEvolutionSeedList);
  }

  getDigimonDegenerations(digimon?: Digimon | BaseDigimon): BaseDigimon[] {
    return this.getDigimonListBySeeds(digimon?.degenerateSeedList);
  }

  private getDigimonListBySeeds(seeds?: string[]): BaseDigimon[] {
    const digimonList: BaseDigimon[] = [];
    seeds?.forEach((seed) => {
      const digimon = this.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }

  getDigimonCurrentEvolutionRoute(
    digimon?: Digimon
  ): BaseDigimon[] | null {
    return digimon?.currentEvolutionRoute?.map((route) =>
      this.getBaseDigimonDataBySeed(route.seed)
    ) as BaseDigimon[];
  }

  generateRandomDigimon(): Digimon {
    const randomIndex = Math.floor(
      Math.random() * this.baseDigimonDataSubject.value.length
    );
    const baseDigimon = this.baseDigimonDataSubject.value[randomIndex];
    return this.createDigimonFromBase(baseDigimon);
  }

  generateDigimonBySeed(seed: string): Digimon | null {
    const baseDigimon = this.getBaseDigimonDataBySeed(seed);
    return baseDigimon ? this.createDigimonFromBase(baseDigimon) : null;
  }

  private createDigimonFromBase(baseDigimon: BaseDigimon): Digimon {
    return {
      id: uuidv4(),
      birthDate: new Date(),
      seed: baseDigimon.seed,
      name: baseDigimon.name,
      img: baseDigimon.img,
      rank: baseDigimon.rank,
      species: baseDigimon.species,
      attribute: baseDigimon.attribute,
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
      currentEvolutionRoute: [],
    };
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
    evolvingDigimon: Digimon | BaseDigimon,
    targetDigimon: BaseDigimon
  ): boolean {
    if (!evolvingDigimon || !targetDigimon) return false;
    const requirementCheckers: Record<string, Function> = {
      level: (evolvingDigimon: Digimon, value: number) =>
        evolvingDigimon.level >= value,
    };

    return targetDigimon.evolutionRequirements?.every((requirement) => {
      const checker = requirementCheckers[requirement.type];
      return checker ? checker(evolvingDigimon, requirement.value) : false;
    }) as boolean;
  }

  getPossibleEvolutionStats(
    evolvingDigimon: Digimon,
    targetDigimon: BaseDigimon
  ): any {
    const growthFactor = 0.5;
    return {
      maxHp: Math.min(
        evolvingDigimon.maxHp + Math.round(targetDigimon.hp * growthFactor),
        this.maxHpMp
      ),
      maxMp: Math.min(
        evolvingDigimon.maxMp + Math.round(targetDigimon.mp * growthFactor),
        this.maxHpMp
      ),
      atk: Math.min(
        evolvingDigimon.atk + Math.round(targetDigimon.atk * growthFactor),
        this.maxOtherStats
      ),
      def: Math.min(
        evolvingDigimon.def + Math.round(targetDigimon.def * growthFactor),
        this.maxOtherStats
      ),
      speed: Math.min(
        evolvingDigimon.speed + Math.round(targetDigimon.speed * growthFactor),
        this.maxOtherStats
      ),
      bitFarmingRate:
        evolvingDigimon.bitFarmingRate! + targetDigimon.bitFarmingRate + 1,
    };
  }

  evolveDigimon(evolvingDigimon: Digimon, targetSeed: string): Digimon | void {
    const targetDigimon = this.getBaseDigimonDataBySeed(targetSeed);
    if (!targetDigimon) throw Error('Target Digimon not found!');
    if (!this.checkRequirements(evolvingDigimon, targetDigimon))
      throw Error('Evolution requirements not met!');

    const newStats = this.getPossibleEvolutionStats(
      evolvingDigimon,
      targetDigimon
    );

    evolvingDigimon.maxHp = newStats.maxHp;
    evolvingDigimon.maxMp = newStats.maxMp;
    evolvingDigimon.atk = newStats.atk;
    evolvingDigimon.def = newStats.def;
    evolvingDigimon.speed = newStats.speed;
    evolvingDigimon.bitFarmingRate = newStats.bitFarmingRate;

    evolvingDigimon.currentHp = evolvingDigimon.maxHp;
    evolvingDigimon.currentMp = evolvingDigimon.maxMp;

    this.resetDigimonStats(evolvingDigimon);
    this.updateEvolutionRoute(evolvingDigimon, targetDigimon);
    return evolvingDigimon;
  }

  private resetDigimonStats(digimon: Digimon): void {
    digimon.exp = 0;
    digimon.level = 1;
  }

  private updateEvolutionRoute(
    evolvingDigimon: Digimon,
    targetDigimon: BaseDigimon
  ): void {
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
  }
}
