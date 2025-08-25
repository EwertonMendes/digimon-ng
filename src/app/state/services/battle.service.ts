import { Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  rankDamageMultiplier: Record<string, number> = {
    Mega: 2.0,
    Ultimate: 1.75,
    Champion: 1.5,
    Rookie: 1.0,
    'In-Training': 0.6,
    Fresh: 0.3,
  };

  rankGrowthMultiplier: Record<string, number> = {
    Fresh: 2,
    'In-Training': 3,
    Rookie: 4,
    Champion: 6,
    Ultimate: 8,
    Mega: 12,
  };

  private maxLevel = 100;
  private maxHpMp = 999999;
  private maxOtherStats = 99999;

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
    const atkPower =
      attacker.atk * (this.rankDamageMultiplier[attacker.rank] || 1);
    const defPower =
      defender.def * (this.rankDamageMultiplier[defender.rank] || 1);

    let baseDamage =
      (Math.pow(atkPower, 1.1) /
        Math.pow(defPower + 1, 0.9)) *
      10;
    const rankDom = this.calculateRankDominance(
      attacker.rank,
      defender.rank
    );
    baseDamage *= rankDom.damageMultiplier;

    const crit = Math.random() < 0.1 ? 1.5 : 1.0;

    const variance = 0.85 + Math.random() * 0.3;


    const speedDiff = defender.speed - attacker.speed;
    const baseMissChance = Math.max(0, Math.min(0.4, speedDiff / 150));
    const totalMissChance = Math.min(
      0.8,
      baseMissChance + rankDom.missChanceBonus
    );

    if (Math.random() < totalMissChance) {
      return 0;
    }

    let finalDamage = baseDamage * crit * variance;

    finalDamage = Math.max(1, finalDamage);
    finalDamage = Math.min(finalDamage, defender.maxHp / 2);

    return Math.floor(finalDamage);
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
    const baseExp = 100;
    const rankMultiplier = this.getRankOrder(defeatedDigimon.rank);
    const levelMultiplier = Math.pow(defeatedDigimon.level, 1.5);
    return Math.floor(baseExp * rankMultiplier * levelMultiplier);
  }

  calculateRequiredExpForLevel(level: number, baseExp: number = 100): number {
    return Math.floor(baseExp * (Math.pow(level, 1.75) + 3 * level));
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
      Mega: { baseBits: 500, multiplier: 5 },
      Ultimate: { baseBits: 400, multiplier: 4 },
      Champion: { baseBits: 200, multiplier: 2 },
      Rookie: { baseBits: 75, multiplier: 1 },
      'In-Training': { baseBits: 50, multiplier: 1 },
      Fresh: { baseBits: 15, multiplier: 1 },
    };
    const rankData = rankBitsMultiplier[defeatedDigimon.rank];
    return Math.floor(rankData.baseBits * rankData.multiplier);
  }

  improveDigimonStats(digimon: Digimon) {
    const hpMpGrowth =
      this.rankGrowthMultiplier[digimon.rank] +
      Math.floor(digimon.level * 0.2);
    const otherStatsGrowth = Math.max(1, Math.floor(hpMpGrowth * 0.5));

    digimon.maxHp = Math.min(digimon.maxHp + hpMpGrowth, this.maxHpMp);
    digimon.currentHp = digimon.maxHp;

    digimon.maxMp = Math.min(digimon.maxMp + hpMpGrowth, this.maxHpMp);
    digimon.currentMp = digimon.maxMp;

    digimon.atk = Math.min(digimon.atk + otherStatsGrowth, this.maxOtherStats);
    digimon.def = Math.min(digimon.def + otherStatsGrowth, this.maxOtherStats);
    digimon.speed = Math.min(
      digimon.speed + otherStatsGrowth,
      this.maxOtherStats
    );
  }

  private updatePlayerDigimonsExp(playerData: PlayerData, totalExp: number) {
    playerData.digimonList.forEach((playerDigimon) => {
      if (!playerDigimon || playerDigimon.currentHp <= 0) return;
      if (playerDigimon.level >= this.maxLevel) return;

      playerDigimon.exp = Math.floor((playerDigimon.exp || 0) + totalExp);
      playerDigimon.totalExp = Math.floor(
        (playerDigimon.totalExp || 0) + totalExp
      );

      this.levelUpDigimon(playerDigimon);
    });
  }

  private levelUpDigimon(digimon: Digimon) {
    if (digimon.level >= this.maxLevel) return;
    if (!digimon.exp) digimon.exp = 0;

    let expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);

    while (digimon.exp >= expForNextLevel && digimon.level < this.maxLevel) {
      digimon.exp -= expForNextLevel;
      digimon.level++;

      if (digimon.level >= this.maxLevel) {
        digimon.level = this.maxLevel;
        digimon.exp = 0;
        break;
      }

      expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);
      this.improveDigimonStats(digimon);
    }
  }

  private updatePlayerExp(playerData: PlayerData, totalExp: number) {
    const playerMaxLevel = 200;
    if (playerData.level >= playerMaxLevel) return;

    playerData.exp += totalExp;
    playerData.totalExp += playerData.exp;

    let expForNextLevel = this.calculateRequiredExpForPlayerLevel(
      playerData.level
    );

    while (playerData.exp >= expForNextLevel) {
      playerData.exp -= expForNextLevel;
      playerData.level++;

      if (playerData.level >= playerMaxLevel) {
        playerData.level = playerMaxLevel;
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
    if (level <= digimon.level) return digimon;

    while (digimon.level < level) {
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
