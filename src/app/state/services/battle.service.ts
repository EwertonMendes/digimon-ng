import { Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';

enum DigimonRank {
  Fresh = 1,
  'In-Training' = 2,
  Rookie = 3,
  Champion = 4,
  Ultimate = 5,
  Mega = 6,
}

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

    console.log(
      `${attacker.name} dealt ${damage} damage to ${defender.name}. ${defender.name} has ${defender.currentHp} HP left.`
    );

    if (defender.currentHp <= 0) {
      defender.currentHp = 0;
      console.log(`${defender.name} has been defeated!`);
    }
    return damage;
  }

  calculateExpGiven(defeatedDigimon: Digimon): number {
    const baseExp = 100;
    const rankMultiplier =
      DigimonRank[defeatedDigimon.rank as keyof typeof DigimonRank];
    const levelMultiplier = defeatedDigimon.level;

    return baseExp * rankMultiplier * Math.sqrt(levelMultiplier);
  }

  calculateRequiredExpForLevel(level: number, baseExp: number = 100): number {
    return Math.floor(baseExp * Math.pow(1.2, level));
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
    const baseStatIncrease = Math.floor(digimon.level * 0.5);

    const randomFactor = () => Math.floor(Math.random() * 3) + 1;

    const calculateStatIncrease = (baseStat: number) => {
      const randomValue = randomFactor();
      return Math.floor(
        baseStatIncrease + randomValue + baseStat * multiplier * 0.05
      );
    };

    digimon.atk += calculateStatIncrease(digimon.atk);
    digimon.def += calculateStatIncrease(digimon.def);

    const hpIncrease = calculateStatIncrease(digimon.maxHp);
    const mpIncrease = calculateStatIncrease(digimon.maxMp);

    digimon.maxHp += hpIncrease;
    digimon.currentHp = digimon.maxHp;
    digimon.maxMp += mpIncrease;
    digimon.currentMp = digimon.maxMp;
  }

  private updatePlayerDigimonsExp(playerData: PlayerData, totalExp: number) {
    playerData.digimonList.forEach((playerDigimon) => {
      if (!playerDigimon || playerDigimon.currentHp <= 0) return;

      playerDigimon.exp = Math.floor((playerDigimon.exp || 0) + totalExp);
      playerDigimon.totalExp = Math.floor(
        (playerDigimon.totalExp || 0) + totalExp
      );

      this.levelUpDigimon(playerDigimon);
    });
  }

  private levelUpDigimon(digimon: Digimon) {
    if (!digimon.exp) digimon.exp = 0;
    while (digimon.exp >= this.calculateRequiredExpForLevel(digimon.level)) {
      digimon.exp = Math.floor(
        digimon.exp - this.calculateRequiredExpForLevel(digimon.level)
      );
      digimon.level++;
      this.improveDigimonStats(digimon);
    }
  }

  private updatePlayerExp(playerData: PlayerData, totalExp: number) {
    playerData.exp += totalExp;
    playerData.totalExp += totalExp;

    while (
      playerData.exp >= this.calculateRequiredExpForLevel(playerData.level)
    ) {
      playerData.exp -= this.calculateRequiredExpForLevel(playerData.level);
      playerData.level++;
    }
  }
}
