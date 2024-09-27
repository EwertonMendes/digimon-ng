import { Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  rankMultiplier: Record<string, number> = {
    Mega: 2.5,
    Ultimate: 2.0,
    Champion: 1.5,
    Rookie: 1.0,
    'In-Training': 0.5,
    Fresh: 0.1,
  };

  private maxLevel = 100;
  private maxHpMp = 999999;
  private maxOtherStats = 99999;

  private calculateDamage(attacker: Digimon, defender: Digimon) {
    let baseDamage =
      (attacker.atk - defender.def) * this.rankMultiplier[attacker.rank];
    baseDamage = Math.max(1, baseDamage);

    const criticalHit = Math.random() < 0.1 ? 1.5 : 1.0;
    const randomVariance = 0.9 + Math.random() * 0.2;

    return Math.floor(baseDamage * criticalHit * randomVariance);
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
    const baseExp = 50;
    const rankMultiplier = this.rankMultiplier[defeatedDigimon.rank];
    const levelMultiplier = Math.log2(defeatedDigimon.level + 1) + 1;

    return Math.floor(baseExp * rankMultiplier * levelMultiplier);
  }

  calculateRequiredExpForLevel(level: number, baseExp: number = 100): number {
    return Math.floor(baseExp * (Math.pow(level, 2) + 5 * level));
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

  improveDigimonStats(digimon: Digimon) {
    const multiplier = this.rankMultiplier[digimon.rank];
    const levelMultiplier = digimon.level * 0.2;
    const rankMultiplier = multiplier;

    const limitedStatIncrease = (baseStat: number, maxStat: number) => {
      const increase = Math.floor(
        baseStat * 0.03 + levelMultiplier + rankMultiplier
      );
      const newStat = Math.min(baseStat + Math.max(1, increase), maxStat);
      return newStat;
    };

    const highCapStatIncrease = (baseStat: number, maxStat: number) => {
      const increase = Math.floor(
        baseStat * 0.05 + levelMultiplier + rankMultiplier
      );
      const newStat = Math.min(baseStat + Math.max(1, increase), maxStat);
      return newStat;
    };

    digimon.atk = limitedStatIncrease(digimon.atk, this.maxOtherStats);
    digimon.def = limitedStatIncrease(digimon.def, this.maxOtherStats);
    digimon.speed = limitedStatIncrease(digimon.speed, this.maxOtherStats);

    digimon.maxHp = highCapStatIncrease(digimon.maxHp, this.maxHpMp);
    digimon.currentHp = digimon.maxHp;

    digimon.maxMp = highCapStatIncrease(digimon.maxMp, this.maxHpMp);
    digimon.currentMp = digimon.maxMp;
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
    return Math.floor(baseExp * (Math.pow(level, 2) + 4 * level));
  }
}
