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
}
