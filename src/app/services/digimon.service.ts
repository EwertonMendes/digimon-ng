import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseDigimon, Digimon } from '@core/interfaces/digimon.interface';
import { v4 as uuidv4 } from 'uuid';
import { applyCaps, calculateGains, getDefaultPotential } from '@core/utils/digimon.utils';

@Injectable({
  providedIn: 'root',
})
export class DigimonService {
  private baseDigimonDataSubject = new BehaviorSubject<BaseDigimon[]>([]);
  baseDigimonData$ = this.baseDigimonDataSubject.asObservable();

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
    ) as BaseDigimon[] ?? null;
  }

  generateRandomDigimon(level: number = 1): Digimon {
    const randomIndex = Math.floor(
      Math.random() * this.baseDigimonDataSubject.value.length
    );
    const baseDigimon = this.baseDigimonDataSubject.value[randomIndex];
    return this.createDigimonFromBase(baseDigimon, level);
  }

  generateDigimonBySeed(seed: string, level: number = 1): Digimon | null {
    const baseDigimon = this.getBaseDigimonDataBySeed(seed);
    return baseDigimon ? this.createDigimonFromBase(baseDigimon, level) : null;
  }

  private createDigimonFromBase(baseDigimon: BaseDigimon, level: number = 1): Digimon {
    let stats: Partial<Digimon> = {
      maxHp: baseDigimon.hp,
      maxMp: baseDigimon.mp,
      atk: baseDigimon.atk,
      def: baseDigimon.def,
      speed: baseDigimon.speed,
      bitFarmingRate: baseDigimon.bitFarmingRate,
    };

    for (let i = 2; i <= level; i++) {
      const gains = calculateGains(baseDigimon.rank);
      stats.maxHp! += gains.hp;
      stats.maxMp! += gains.mp;
      stats.atk! += gains.atk;
      stats.def! += gains.def;
      stats.speed! += gains.speed;
      stats.bitFarmingRate! += Math.floor(Math.random() * 2);
      applyCaps(baseDigimon.rank, stats);
    }

    return {
      id: uuidv4(),
      birthDate: new Date(),
      seed: baseDigimon.seed,
      name: baseDigimon.name,
      img: baseDigimon.img,
      rank: baseDigimon.rank,
      species: baseDigimon.species,
      attribute: baseDigimon.attribute,
      currentHp: stats.maxHp!,
      maxHp: stats.maxHp!,
      currentMp: stats.maxMp!,
      maxMp: stats.maxMp!,
      atk: stats.atk!,
      def: stats.def!,
      speed: stats.speed!,
      exp: 0,
      totalExp: 0,
      level,
      bitFarmingRate: stats.bitFarmingRate,
      digiEvolutionSeedList: baseDigimon.digiEvolutionSeedList,
      degenerateSeedList: baseDigimon.degenerateSeedList,
      currentEvolutionRoute: [],
      potential: baseDigimon.potential ?? getDefaultPotential(baseDigimon.rank),
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
      level: (evolving: Digimon, value: number) => evolving.level >= value,
    };

    return targetDigimon.evolutionRequirements?.every((requirement) => {
      const checker = requirementCheckers[requirement.type];
      return checker ? checker(evolvingDigimon, requirement.value) : false;
    }) ?? true;
  }

  getPossibleEvolutionStats(
    evolvingDigimon: Digimon,
    targetDigimon: BaseDigimon
  ) {
    const factor = 0.3;
    return {
      maxHp: evolvingDigimon.maxHp + Math.round(targetDigimon.hp * factor),
      maxMp: evolvingDigimon.maxMp + Math.round(targetDigimon.mp * factor),
      atk: evolvingDigimon.atk + Math.round(targetDigimon.atk * factor),
      def: evolvingDigimon.def + Math.round(targetDigimon.def * factor),
      speed: evolvingDigimon.speed + Math.round(targetDigimon.speed * factor),
      bitFarmingRate: Math.round((evolvingDigimon.bitFarmingRate || 0) + targetDigimon.bitFarmingRate * factor),
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

    applyCaps(targetDigimon.rank, evolvingDigimon);

    evolvingDigimon.exp = 0;
    evolvingDigimon.level = 1;

    const currentPotential = evolvingDigimon.potential ?? getDefaultPotential(evolvingDigimon.rank);
    const targetPotential = targetDigimon.potential ?? getDefaultPotential(targetDigimon.rank);
    evolvingDigimon.potential = Math.max(currentPotential, targetPotential);

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
