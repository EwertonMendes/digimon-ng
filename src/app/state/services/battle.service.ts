import { Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { applyCaps, calculateGains, getDefaultPotential } from '@core/utils/digimon.utils';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  private maxLevel = 100;

  private attributeAdvantages: Record<string, Record<string, number>> = {
    Vaccine: { Virus: 1.3, Data: 0.7, Vaccine: 1.0 },
    Virus: { Data: 1.3, Vaccine: 0.7, Virus: 1.0 },
    Data: { Vaccine: 1.3, Virus: 0.7, Data: 1.0 },
  };

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

  private calculateRankDominance(
    attackerRank: string,
    defenderRank: string
  ): { damageMultiplier: number; missChanceBonus: number } {
    const attackerOrder = this.getRankOrder(attackerRank);
    const defenderOrder = this.getRankOrder(defenderRank);
    const diff = attackerOrder - defenderOrder;

    if (diff >= 3) return { damageMultiplier: 2.5, missChanceBonus: -0.1 };
    if (diff === 2) return { damageMultiplier: 1.8, missChanceBonus: -0.05 };
    if (diff === 1) return { damageMultiplier: 1.3, missChanceBonus: 0 };

    if (diff <= -3) return { damageMultiplier: 0.1, missChanceBonus: 0.4 };
    if (diff === -2) return { damageMultiplier: 0.25, missChanceBonus: 0.25 };
    if (diff === -1) return { damageMultiplier: 0.6, missChanceBonus: 0.1 };

    return { damageMultiplier: 1.0, missChanceBonus: 0 };
  }

  private calculateDamage(attacker: Digimon, defender: Digimon) {
    const speedDiff = defender.speed - attacker.speed;
    const baseMissChance = Math.max(0, Math.min(0.4, speedDiff / 150));
    const rankDom = this.calculateRankDominance(attacker.rank, defender.rank);
    const totalMissChance = Math.min(0.8, baseMissChance + rankDom.missChanceBonus);

    if (Math.random() < totalMissChance) {
      return 0;
    }

    const attrFactor = this.attributeAdvantages[attacker.attribute]?.[defender.attribute] ?? 1.0;
    const crit = Math.random() < 0.05 ? 1.5 : 1.0;
    const variance = 0.85 + Math.random() * 0.3;

    let baseDamage = (attacker.atk - defender.def / 2) * 10 * attrFactor * crit * variance * rankDom.damageMultiplier;
    baseDamage = Math.max(1, baseDamage);

    const hpCap = rankDom.damageMultiplier > 1.0 ? defender.maxHp : defender.maxHp / 2;
    baseDamage = Math.min(baseDamage, hpCap);

    return Math.floor(baseDamage);
  }

  attack(attacker: Digimon, defender: Digimon) {
    const damage = this.calculateDamage(attacker, defender);
    defender.currentHp -= damage;

    if (defender.currentHp <= 0) {
      defender.currentHp = 0;
    }
    return damage;
  }

  calculateExpGiven(defeatedDigimon: Digimon): number {
    const potential = defeatedDigimon.potential ?? getDefaultPotential(defeatedDigimon.rank);
    return Math.floor(100 * potential * Math.pow(defeatedDigimon.level, 2.2) / 100);
  }

  calculateRequiredExpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 2));
  }

  calculateTotalGainedExp(playerData: PlayerData, defeatedDigimons: Digimon[]) {
    const totalExp = defeatedDigimons.reduce(
      (acc, digimon) => acc + this.calculateExpGiven(digimon),
      0
    );

    this.updatePlayerDigimonsExp(playerData, totalExp);
    this.updatePlayerExp(playerData, totalExp);

    return {
      playerData,
      totalExp,
    };
  }

  calculateTotalGainedBits(defeatedDigimons: Digimon[]): number {
    return defeatedDigimons.reduce(
      (acc, digimon) => acc + this.calculateBitsGiven(digimon),
      0
    );
  }

  private calculateBitsGiven(defeatedDigimon: Digimon): number {
    const rankBitsMultiplier: Record<
      string,
      { baseBits: number; multiplier: number }
    > = {
      Fresh: { baseBits: 10, multiplier: 1 },
      'In-Training': { baseBits: 20, multiplier: 1.2 },
      Rookie: { baseBits: 50, multiplier: 1.5 },
      Champion: { baseBits: 100, multiplier: 2 },
      Ultimate: { baseBits: 200, multiplier: 3 },
      Mega: { baseBits: 500, multiplier: 5 },
    };
    const { baseBits, multiplier } = rankBitsMultiplier[defeatedDigimon.rank] || { baseBits: 10, multiplier: 1 };
    return Math.floor(baseBits + defeatedDigimon.level * multiplier);
  }

  private updatePlayerDigimonsExp(playerData: PlayerData, totalExp: number) {
    playerData.digimonList.forEach((playerDigimon) => {
      if (!playerDigimon || playerDigimon.currentHp <= 0 || playerDigimon.exp === undefined) return;

      playerDigimon.exp = Math.floor((playerDigimon.exp || 0) + totalExp);
      playerDigimon.totalExp = Math.floor(
        (playerDigimon.totalExp || 0) + totalExp
      );

      this.levelUpDigimon(playerDigimon);
    });
  }

  levelUpDigimon(digimon: Digimon) {
    const potential = digimon.potential ?? getDefaultPotential(digimon.rank);
    if (digimon.level >= potential || digimon.level >= this.maxLevel) return;
    if (!digimon.exp) digimon.exp = 0;

    let expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);

    while (digimon.exp >= expForNextLevel && digimon.level < potential && digimon.level < this.maxLevel) {
      digimon.exp -= expForNextLevel;
      digimon.level++;

      const gains = calculateGains();
      digimon.maxHp += gains.hp;
      digimon.maxMp += gains.mp;
      digimon.atk += gains.atk;
      digimon.def += gains.def;
      digimon.speed += gains.speed;

      applyCaps(digimon.rank, digimon);

      digimon.currentHp = digimon.maxHp;
      digimon.currentMp = digimon.maxMp;

      if (digimon.level >= potential || digimon.level >= this.maxLevel) {
        digimon.exp = 0;
        break;
      }

      expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);
    }
  }

  private updatePlayerExp(playerData: PlayerData, totalExp: number) {
    const playerMaxLevel = 200;
    if (playerData.level >= playerMaxLevel) return;

    playerData.exp += totalExp;
    playerData.totalExp += totalExp;

    let expForNextLevel = this.calculateRequiredExpForPlayerLevel(
      playerData.level
    );

    while (playerData.exp >= expForNextLevel && playerData.level < playerMaxLevel) {
      playerData.exp -= expForNextLevel;
      playerData.level++;

      if (playerData.level >= playerMaxLevel) {
        playerData.exp = 0;
        break;
      }

      expForNextLevel = this.calculateRequiredExpForPlayerLevel(
        playerData.level
      );

      if (playerData.exp < 0) {
        playerData.exp = 0;
      }
    }
  }

  calculateRequiredExpForPlayerLevel(
    level: number,
    baseExp: number = 300
  ): number {
    return Math.floor(baseExp * (Math.pow(level, 1.7) + 3 * level));
  }

  levelUpDigimonToLevel(digimon: Digimon, level: number) {
    const potential = digimon.potential ?? getDefaultPotential(digimon.rank);
    if (level <= digimon.level || digimon.level >= potential) return digimon;

    while (digimon.level < level && digimon.level < potential) {
      const expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);

      if (!digimon.exp) digimon.exp = 0;
      digimon.exp += expForNextLevel;
      this.levelUpDigimon(digimon);
    }

    return digimon;
  }

  calculateGainedDigiData(
    defeatedDigimons: Digimon[]
  ): { seed: string; name: string; amount: number }[] {
    const digiDataGainPerRank: Record<string, number> = {
      Fresh: 30,
      'In-Training': 25,
      Rookie: 15,
      Champion: 10,
      Ultimate: 5,
      Mega: 2,
    };

    const gainMap: Record<
      string,
      { seed: string; name: string; amount: number }
    > = {};

    for (const digimon of defeatedDigimons) {
      const { seed, name, rank } = digimon;
      const gain = digiDataGainPerRank[rank] || 1;

      if (!gainMap[seed]) {
        gainMap[seed] = { seed, name, amount: 0 };
      }

      gainMap[seed].amount += gain;
    }

    return Object.values(gainMap);
  }

  calculateTeamScore(team: Digimon[]): number {
    const rankWeights: Record<string, number> = {
      Fresh: 0.5,
      'In-Training': 1,
      Rookie: 2,
      Champion: 3,
      Ultimate: 4,
      Mega: 5,
    };

    let totalScore = 0;

    for (const digimon of team) {
      if (digimon.currentHp > 0) {
        const rankScore = rankWeights[digimon.rank] || 1;
        totalScore += rankScore * digimon.level;
      }
    }

    return totalScore;
  }

  calculateEscapeChance(playerScore: number, enemyScore: number): number {
    const ratio = playerScore / enemyScore;

    if (ratio >= 4.0) return 0.95;
    if (ratio >= 3.0) return 0.85;
    if (ratio >= 2.0) return 0.75;
    if (ratio >= 1.5) return 0.6;
    if (ratio >= 1.0) return 0.5;
    if (ratio >= 0.75) return 0.35;
    if (ratio >= 0.5) return 0.2;
    return 0.1;
  }
}
