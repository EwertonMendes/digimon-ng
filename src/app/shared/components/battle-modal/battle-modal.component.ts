import { Component, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { DigiStatusCardComponent } from '../digi-status-card/digi-status-card.component';
import { ToastService } from '../toast/toast.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-battle-modal',
  standalone: true,
  imports: [ModalComponent, DigiStatusCardComponent, ButtonComponent],
  templateUrl: './battle-modal.component.html',
  styleUrl: './battle-modal.component.scss',
})
export class BattleModalComponent {
  battleModalId = 'battle-modal';
  showPlayerAttackButton = false;

  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);

  onBattleModalClose() {
    this.globalState.resetBattleState();
  }

  playerAttack() {
    if (!this.globalState.isBattleActive) return;
    const digimon = this.globalState.actualTurnOrder.shift();

    if (!digimon) return;

    const opponentDigimon = this.globalState.enemyTeamAccessor.find(
      (d) => d.currentHp > 0
    );
    if (!opponentDigimon) return;

    const dealtDamage = this.globalState.attack(digimon, opponentDigimon);
    this.log(
      `Player ${digimon.name} attacks! Damage: ${dealtDamage}. Enemy ${opponentDigimon.name} has ${opponentDigimon.currentHp} health left.`
    );

    if (opponentDigimon.currentHp <= 0) {
      this.log(`Enemy ${opponentDigimon.name} has been defeated.`);
      this.globalState.baseTurnOrder = this.globalState.baseTurnOrder.filter(
        (d) => d.id !== opponentDigimon.id
      );
      this.globalState.actualTurnOrder = [...this.globalState.baseTurnOrder];
    }

    this.globalState.nextTurn();
    return;
  }

  private log(message: string) {
    console.log(message);
    this.globalState.log(message);
  }
}
