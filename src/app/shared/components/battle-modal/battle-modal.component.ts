import { Component, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { DigiStatusCardComponent } from '../digi-status-card/digi-status-card.component';
import { ToastService } from '../toast/toast.service';
import { ButtonComponent } from '../button/button.component';
import { AudioService } from '../../../services/audio.service';
import { AudioEffects } from '../../../core/enums/audio-tracks.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battle-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    DigiStatusCardComponent,
    ButtonComponent,
  ],
  templateUrl: './battle-modal.component.html',
  styleUrl: './battle-modal.component.scss',
})
export class BattleModalComponent {
  battleModalId = 'battle-modal';
  showPlayerAttackButton = false;

  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);
  audioService = inject(AudioService);

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

    this.globalState.currentDefendingDigimon.set({
      ...opponentDigimon,
      owner: 'enemy',
    });

    const dealtDamage = this.globalState.attack(digimon, opponentDigimon);
    this.log(
      `Player ${digimon.name} attacks! Damage: ${dealtDamage}. Enemy ${opponentDigimon.name} has ${opponentDigimon.currentHp} health left.`
    );

    if (dealtDamage === 0) {
      this.audioService.playAudio(AudioEffects.MISS);
    }

    if (dealtDamage > 0) {
      this.audioService.playAudio(AudioEffects.HIT);
    }

    if (opponentDigimon.currentHp <= 0) {
      this.log(`Enemy ${opponentDigimon.name} has been defeated.`);
      this.globalState.baseTurnOrder = this.globalState.baseTurnOrder.filter(
        (d) => d.id !== opponentDigimon.id
      );
      this.globalState.actualTurnOrder = this.globalState.actualTurnOrder.filter(
        (d) => d.id !== opponentDigimon.id
      );
    }

    this.globalState.nextTurn();
    return;
  }

  private log(message: string) {
    this.globalState.log(message);
  }
}
