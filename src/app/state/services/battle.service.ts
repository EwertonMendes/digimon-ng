import { Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { applyCaps, calculateGains, getDefaultPotential } from '@core/utils/digimon.utils';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  private readonly MAX_LEVEL = 100;
  private readonly PLAYER_MAX_LEVEL = 1000;

  private readonly ATTRIBUTE_ADVANTAGE_FACTOR = 1.3;
  private readonly ATTRIBUTE_DISADVANTAGE_FACTOR = 0.7;
  private readonly ATTRIBUTE_NEUTRAL_FACTOR = 1.0;

  private readonly RANK_FRESH_ORDER = 1;
  private readonly RANK_IN_TRAINING_ORDER = 2;
  private readonly RANK_ROOKIE_ORDER = 3;
  private readonly RANK_CHAMPION_ORDER = 4;
  private readonly RANK_ULTIMATE_ORDER = 5;
  private readonly RANK_MEGA_ORDER = 6;

  private readonly RANK_DOM_DIFF_GE_3_MULTIPLIER = 2.5;
  private readonly RANK_DOM_DIFF_GE_3_MISS_BONUS = -0.1;
  private readonly RANK_DOM_DIFF_EQ_2_MULTIPLIER = 1.8;
  private readonly RANK_DOM_DIFF_EQ_2_MISS_BONUS = -0.05;
  private readonly RANK_DOM_DIFF_EQ_1_MULTIPLIER = 1.3;
  private readonly RANK_DOM_DIFF_EQ_1_MISS_BONUS = 0;
  private readonly RANK_DOM_DIFF_LE_NEG3_MULTIPLIER = 0.1;
  private readonly RANK_DOM_DIFF_LE_NEG3_MISS_BONUS = 0.4;
  private readonly RANK_DOM_DIFF_EQ_NEG2_MULTIPLIER = 0.25;
  private readonly RANK_DOM_DIFF_EQ_NEG2_MISS_BONUS = 0.25;
  private readonly RANK_DOM_DIFF_EQ_NEG1_MULTIPLIER = 0.6;
  private readonly RANK_DOM_DIFF_EQ_NEG1_MISS_BONUS = 0.1;
  private readonly RANK_DOM_NEUTRAL_MULTIPLIER = 1.0;
  private readonly RANK_DOM_NEUTRAL_MISS_BONUS = 0;
  private readonly DAMAGE_MULTIPLIER_ADVANTAGE_THRESHOLD = 1.0;

  private readonly MISS_CHANCE_SPEED_DIVISOR = 150;
  private readonly MISS_CHANCE_MIN = 0;
  private readonly MISS_CHANCE_MAX = 0.4;
  private readonly TOTAL_MISS_CHANCE_CAP = 0.8;

  private readonly CRIT_CHANCE = 0.05;
  private readonly CRIT_MULTIPLIER = 1.5;

  private readonly VARIANCE_MIN = 0.85;
  private readonly VARIANCE_RANGE = 0.3;

  private readonly ATK_POWER_EXPONENT = 2;
  private readonly DAMAGE_SCALE_FACTOR = 1.1;
  private readonly MIN_DAMAGE = 1;
  private readonly HP_CAP_DISADVANTAGE_DIVISOR = 2;

  private readonly EXP_GIVEN_BASE = 100;
  private readonly EXP_GIVEN_LEVEL_EXPONENT = 2.2;
  private readonly EXP_GIVEN_DIVISOR = 100;

  private readonly REQUIRED_EXP_BASE = 100;
  private readonly REQUIRED_EXP_EXPONENT = 2;

  private readonly BITS_FRESH_BASE = 10;
  private readonly BITS_FRESH_MULTIPLIER = 1;
  private readonly BITS_IN_TRAINING_BASE = 20;
  private readonly BITS_IN_TRAINING_MULTIPLIER = 1.2;
  private readonly BITS_ROOKIE_BASE = 50;
  private readonly BITS_ROOKIE_MULTIPLIER = 1.5;
  private readonly BITS_CHAMPION_BASE = 100;
  private readonly BITS_CHAMPION_MULTIPLIER = 2;
  private readonly BITS_ULTIMATE_BASE = 200;
  private readonly BITS_ULTIMATE_MULTIPLIER = 3;
  private readonly BITS_MEGA_BASE = 500;
  private readonly BITS_MEGA_MULTIPLIER = 5;
  private readonly BITS_DEFAULT_BASE = 10;
  private readonly BITS_DEFAULT_MULTIPLIER = 1;

  private readonly PLAYER_EXP_BASE = 300;
  private readonly PLAYER_EXP_LEVEL_EXPONENT = 1.7;
  private readonly PLAYER_EXP_LEVEL_MULTIPLIER = 3;

  private readonly DIGI_DATA_FRESH_GAIN = 30;
  private readonly DIGI_DATA_IN_TRAINING_GAIN = 25;
  private readonly DIGI_DATA_ROOKIE_GAIN = 15;
  private readonly DIGI_DATA_CHAMPION_GAIN = 10;
  private readonly DIGI_DATA_ULTIMATE_GAIN = 5;
  private readonly DIGI_DATA_MEGA_GAIN = 2;
  private readonly DIGI_DATA_DEFAULT_GAIN = 1;

  private readonly TEAM_SCORE_FRESH_WEIGHT = 0.5;
  private readonly TEAM_SCORE_IN_TRAINING_WEIGHT = 1;
  private readonly TEAM_SCORE_ROOKIE_WEIGHT = 2;
  private readonly TEAM_SCORE_CHAMPION_WEIGHT = 3;
  private readonly TEAM_SCORE_ULTIMATE_WEIGHT = 4;
  private readonly TEAM_SCORE_MEGA_WEIGHT = 5;
  private readonly TEAM_SCORE_DEFAULT_WEIGHT = 1;

  private readonly ESCAPE_RATIO_GE_4 = 4.0;
  private readonly ESCAPE_CHANCE_GE_4 = 0.95;
  private readonly ESCAPE_RATIO_GE_3 = 3.0;
  private readonly ESCAPE_CHANCE_GE_3 = 0.85;
  private readonly ESCAPE_RATIO_GE_2 = 2.0;
  private readonly ESCAPE_CHANCE_GE_2 = 0.75;
  private readonly ESCAPE_RATIO_GE_1_5 = 1.5;
  private readonly ESCAPE_CHANCE_GE_1_5 = 0.6;
  private readonly ESCAPE_RATIO_GE_1 = 1.0;
  private readonly ESCAPE_CHANCE_GE_1 = 0.5;
  private readonly ESCAPE_RATIO_GE_0_75 = 0.75;
  private readonly ESCAPE_CHANCE_GE_0_75 = 0.35;
  private readonly ESCAPE_RATIO_GE_0_5 = 0.5;
  private readonly ESCAPE_CHANCE_GE_0_5 = 0.2;
  private readonly ESCAPE_CHANCE_DEFAULT = 0.1;

  private readonly TOTAL_EXP_LEVEL_MIN = 1;
  private readonly TOTAL_EXP_BASE = 100;
  private readonly TOTAL_EXP_DIVISOR = 6;

  private attributeAdvantages: Record<string, Record<string, number>> = {
    Vaccine: { Virus: this.ATTRIBUTE_ADVANTAGE_FACTOR, Data: this.ATTRIBUTE_DISADVANTAGE_FACTOR, Vaccine: this.ATTRIBUTE_NEUTRAL_FACTOR },
    Virus: { Data: this.ATTRIBUTE_ADVANTAGE_FACTOR, Vaccine: this.ATTRIBUTE_DISADVANTAGE_FACTOR, Virus: this.ATTRIBUTE_NEUTRAL_FACTOR },
    Data: { Vaccine: this.ATTRIBUTE_ADVANTAGE_FACTOR, Virus: this.ATTRIBUTE_DISADVANTAGE_FACTOR, Data: this.ATTRIBUTE_NEUTRAL_FACTOR },
  };

  private getRankOrder(rank: string): number {
    const rankOrder: Record<string, number> = {
      Fresh: this.RANK_FRESH_ORDER,
      'In-Training': this.RANK_IN_TRAINING_ORDER,
      Rookie: this.RANK_ROOKIE_ORDER,
      Champion: this.RANK_CHAMPION_ORDER,
      Ultimate: this.RANK_ULTIMATE_ORDER,
      Mega: this.RANK_MEGA_ORDER,
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

    if (diff >= 3) return { damageMultiplier: this.RANK_DOM_DIFF_GE_3_MULTIPLIER, missChanceBonus: this.RANK_DOM_DIFF_GE_3_MISS_BONUS };
    if (diff === 2) return { damageMultiplier: this.RANK_DOM_DIFF_EQ_2_MULTIPLIER, missChanceBonus: this.RANK_DOM_DIFF_EQ_2_MISS_BONUS };
    if (diff === 1) return { damageMultiplier: this.RANK_DOM_DIFF_EQ_1_MULTIPLIER, missChanceBonus: this.RANK_DOM_DIFF_EQ_1_MISS_BONUS };

    if (diff <= -3) return { damageMultiplier: this.RANK_DOM_DIFF_LE_NEG3_MULTIPLIER, missChanceBonus: this.RANK_DOM_DIFF_LE_NEG3_MISS_BONUS };
    if (diff === -2) return { damageMultiplier: this.RANK_DOM_DIFF_EQ_NEG2_MULTIPLIER, missChanceBonus: this.RANK_DOM_DIFF_EQ_NEG2_MISS_BONUS };
    if (diff === -1) return { damageMultiplier: this.RANK_DOM_DIFF_EQ_NEG1_MULTIPLIER, missChanceBonus: this.RANK_DOM_DIFF_EQ_NEG1_MISS_BONUS };

    return { damageMultiplier: this.RANK_DOM_NEUTRAL_MULTIPLIER, missChanceBonus: this.RANK_DOM_NEUTRAL_MISS_BONUS };
  }

  private calculateDamage(attacker: Digimon, defender: Digimon) {
    const speedDiff = defender.speed - attacker.speed;
    const baseMissChance = Math.max(this.MISS_CHANCE_MIN, Math.min(this.MISS_CHANCE_MAX, speedDiff / this.MISS_CHANCE_SPEED_DIVISOR));
    const rankDom = this.calculateRankDominance(attacker.rank, defender.rank);
    const totalMissChance = Math.min(this.TOTAL_MISS_CHANCE_CAP, baseMissChance + rankDom.missChanceBonus);

    if (Math.random() < totalMissChance) {
      return 0;
    }

    const attrFactor = this.attributeAdvantages[attacker.attribute]?.[defender.attribute] ?? this.ATTRIBUTE_NEUTRAL_FACTOR;
    const crit = Math.random() < this.CRIT_CHANCE ? this.CRIT_MULTIPLIER : 1.0;
    const variance = this.VARIANCE_MIN + Math.random() * this.VARIANCE_RANGE;

    let baseDamage = (Math.pow(attacker.atk, this.ATK_POWER_EXPONENT) / (attacker.atk + defender.def)) * this.DAMAGE_SCALE_FACTOR * attrFactor * crit * variance * rankDom.damageMultiplier;
    baseDamage = Math.max(this.MIN_DAMAGE, baseDamage);

    const hpCap = rankDom.damageMultiplier > this.DAMAGE_MULTIPLIER_ADVANTAGE_THRESHOLD ? defender.maxHp : defender.maxHp / this.HP_CAP_DISADVANTAGE_DIVISOR;
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
    const potential = getDefaultPotential(defeatedDigimon.rank);
    return Math.floor(this.EXP_GIVEN_BASE * potential * Math.pow(defeatedDigimon.level, this.EXP_GIVEN_LEVEL_EXPONENT) / this.EXP_GIVEN_DIVISOR);
  }

  calculateRequiredExpForLevel(level: number): number {
    return Math.floor(this.REQUIRED_EXP_BASE * Math.pow(level, this.REQUIRED_EXP_EXPONENT));
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
      Fresh: { baseBits: this.BITS_FRESH_BASE, multiplier: this.BITS_FRESH_MULTIPLIER },
      'In-Training': { baseBits: this.BITS_IN_TRAINING_BASE, multiplier: this.BITS_IN_TRAINING_MULTIPLIER },
      Rookie: { baseBits: this.BITS_ROOKIE_BASE, multiplier: this.BITS_ROOKIE_MULTIPLIER },
      Champion: { baseBits: this.BITS_CHAMPION_BASE, multiplier: this.BITS_CHAMPION_MULTIPLIER },
      Ultimate: { baseBits: this.BITS_ULTIMATE_BASE, multiplier: this.BITS_ULTIMATE_MULTIPLIER },
      Mega: { baseBits: this.BITS_MEGA_BASE, multiplier: this.BITS_MEGA_MULTIPLIER },
    };
    const { baseBits, multiplier } = rankBitsMultiplier[defeatedDigimon.rank] || { baseBits: this.BITS_DEFAULT_BASE, multiplier: this.BITS_DEFAULT_MULTIPLIER };
    return Math.floor(baseBits + defeatedDigimon.level * multiplier);
  }

  private updatePlayerDigimonsExp(playerData: PlayerData, totalExp: number) {
    playerData.digimonList.forEach((playerDigimon) => {
      if (!playerDigimon || playerDigimon.currentHp <= 0) return;

      playerDigimon.exp ??= 0;
      playerDigimon.totalExp ??= 0;

      const potential = getDefaultPotential(playerDigimon.rank);

      if (playerDigimon.level > potential || playerDigimon.level > this.MAX_LEVEL) {
        playerDigimon.level = Math.min(potential, this.MAX_LEVEL);
      }

      if (playerDigimon.level >= potential || playerDigimon.level >= this.MAX_LEVEL) {
        playerDigimon.exp = 0;
        const maxTotalExp = this.calculateTotalExpToLevel(playerDigimon.level);
        playerDigimon.totalExp = Math.min(playerDigimon.totalExp, maxTotalExp);
        return;
      }

      const expForNextLevel = this.calculateRequiredExpForLevel(playerDigimon.level);

      if (playerDigimon.exp >= expForNextLevel) {
        playerDigimon.exp = 0;
      }

      playerDigimon.exp += totalExp;
      playerDigimon.totalExp += totalExp;

      this.levelUpDigimon(playerDigimon);
    });
  }

  levelUpDigimon(digimon: Digimon) {
    const potential = getDefaultPotential(digimon.rank);
    if (digimon.level >= potential || digimon.level >= this.MAX_LEVEL) return;
    if (!digimon.exp) digimon.exp = 0;

    let expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);

    while (digimon.exp >= expForNextLevel && digimon.level < potential && digimon.level < this.MAX_LEVEL) {
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

      if (digimon.level >= potential || digimon.level >= this.MAX_LEVEL) {
        digimon.exp = 0;
        break;
      }

      expForNextLevel = this.calculateRequiredExpForLevel(digimon.level);
    }
  }

  private updatePlayerExp(playerData: PlayerData, totalExp: number) {
    if (playerData.level >= this.PLAYER_MAX_LEVEL) return;

    playerData.exp += totalExp;
    playerData.totalExp += totalExp;

    let expForNextLevel = this.calculateRequiredExpForPlayerLevel(
      playerData.level
    );

    while (playerData.exp >= expForNextLevel && playerData.level < this.PLAYER_MAX_LEVEL) {
      playerData.exp -= expForNextLevel;
      playerData.level++;

      if (playerData.level >= this.PLAYER_MAX_LEVEL) {
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
    baseExp: number = this.PLAYER_EXP_BASE
  ): number {
    return Math.floor(baseExp * (Math.pow(level, this.PLAYER_EXP_LEVEL_EXPONENT) + this.PLAYER_EXP_LEVEL_MULTIPLIER * level));
  }

  levelUpDigimonToLevel(digimon: Digimon, level: number) {
    const potential = getDefaultPotential(digimon.rank);
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
      Fresh: this.DIGI_DATA_FRESH_GAIN,
      'In-Training': this.DIGI_DATA_IN_TRAINING_GAIN,
      Rookie: this.DIGI_DATA_ROOKIE_GAIN,
      Champion: this.DIGI_DATA_CHAMPION_GAIN,
      Ultimate: this.DIGI_DATA_ULTIMATE_GAIN,
      Mega: this.DIGI_DATA_MEGA_GAIN,
    };

    const gainMap: Record<
      string,
      { seed: string; name: string; amount: number }
    > = {};

    for (const digimon of defeatedDigimons) {
      const { seed, name, rank } = digimon;
      const gain = digiDataGainPerRank[rank] || this.DIGI_DATA_DEFAULT_GAIN;

      if (!gainMap[seed]) {
        gainMap[seed] = { seed, name, amount: 0 };
      }

      gainMap[seed].amount += gain;
    }

    return Object.values(gainMap);
  }

  calculateTeamScore(team: Digimon[]): number {
    const rankWeights: Record<string, number> = {
      Fresh: this.TEAM_SCORE_FRESH_WEIGHT,
      'In-Training': this.TEAM_SCORE_IN_TRAINING_WEIGHT,
      Rookie: this.TEAM_SCORE_ROOKIE_WEIGHT,
      Champion: this.TEAM_SCORE_CHAMPION_WEIGHT,
      Ultimate: this.TEAM_SCORE_ULTIMATE_WEIGHT,
      Mega: this.TEAM_SCORE_MEGA_WEIGHT,
    };

    let totalScore = 0;

    for (const digimon of team) {
      if (digimon.currentHp > 0) {
        const rankScore = rankWeights[digimon.rank] || this.TEAM_SCORE_DEFAULT_WEIGHT;
        totalScore += rankScore * digimon.level;
      }
    }

    return totalScore;
  }

  calculateEscapeChance(playerScore: number, enemyScore: number): number {
    const ratio = playerScore / enemyScore;

    if (ratio >= this.ESCAPE_RATIO_GE_4) return this.ESCAPE_CHANCE_GE_4;
    if (ratio >= this.ESCAPE_RATIO_GE_3) return this.ESCAPE_CHANCE_GE_3;
    if (ratio >= this.ESCAPE_RATIO_GE_2) return this.ESCAPE_CHANCE_GE_2;
    if (ratio >= this.ESCAPE_RATIO_GE_1_5) return this.ESCAPE_CHANCE_GE_1_5;
    if (ratio >= this.ESCAPE_RATIO_GE_1) return this.ESCAPE_CHANCE_GE_1;
    if (ratio >= this.ESCAPE_RATIO_GE_0_75) return this.ESCAPE_CHANCE_GE_0_75;
    if (ratio >= this.ESCAPE_RATIO_GE_0_5) return this.ESCAPE_CHANCE_GE_0_5;
    return this.ESCAPE_CHANCE_DEFAULT;
  }

  private calculateTotalExpToLevel(level: number): number {
    if (level <= this.TOTAL_EXP_LEVEL_MIN) return 0;
    const n = level - 1;
    return Math.floor(this.TOTAL_EXP_BASE * (n * (n + 1) * (2 * n + 1) / this.TOTAL_EXP_DIVISOR));
  }
}
