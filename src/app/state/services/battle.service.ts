import { Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';

@Injectable({
  providedIn: 'root',
})
export class BattleService {

  private calculateDamage(attacker: Digimon, defender: Digimon) {
    const rankMultiplier: Record<string, number> = {
      Mega: 2.5,
      Ultimate: 2.0,
      Champion: 1.5,
      Rookie: 1.0,
    };

    let baseDamage =
      (attacker.atk - defender.def) * rankMultiplier[attacker.rank];
    baseDamage = Math.max(1, baseDamage);

    const criticalHit = Math.random() < 0.1 ? 1.5 : 1.0;
    const randomVariance = 0.9 + Math.random() * 0.2;

    return Math.floor(baseDamage * criticalHit * randomVariance);
  }

  battle(attacker: Digimon, defender: Digimon) {
    const damage = this.calculateDamage(attacker, defender);
    defender.currentHp -= damage;

    console.log(
      `${attacker.name} dealt ${damage} damage to ${defender.name}. ${defender.name} has ${defender.currentHp} HP left.`
    );

    if (defender.currentHp <= 0) {
      defender.currentHp = 0;
      console.log(`${defender.name} has been defeated!`);

      if (!attacker.exp) return;

      const xpGained = 100;
      attacker.exp += xpGained;
      console.log(`${attacker.name} gained ${xpGained} XP.`);

      const xpRequired = 100 * Math.pow(attacker.level, 1.5);
      if (attacker.exp >= xpRequired) {
        //levelUp(attacker);
        console.log(`${attacker.name} leveled up to level ${attacker.level}!`);
      }
    }
  }
}
