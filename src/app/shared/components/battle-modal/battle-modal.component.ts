import { Component, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { DigiStatusCardComponent } from '../digi-status-card/digi-status-card.component';
import { ToastService } from '../toast/toast.service';
import { ButtonComponent } from '../button/button.component';
import { AudioService } from '../../../services/audio.service';
import { AudioEffects } from '../../../core/enums/audio-tracks.enum';
import { CommonModule } from '@angular/common';
import { Digimon } from 'app/core/interfaces/digimon.interface';

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
  imageBackground = input<string | null>(null);
  battleModalId = 'battle-modal';
  showPlayerAttackButton = false;
  isChoosingDigimonToAttack = signal(false);

  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);
  audioService = inject(AudioService);

  onBattleModalClose() {
    this.globalState.resetBattleState();
    this.globalState.resetTurnOrder();
  }

  onClickAttack() {
    this.isChoosingDigimonToAttack.set(true);
  }

  cancelAttack(event?: MouseEvent) {
    event?.preventDefault();
    this.isChoosingDigimonToAttack.set(false);
  }

  playerAttack(opponentDigimon: Digimon) {
    if (!this.globalState.isBattleActive || !this.isChoosingDigimonToAttack() || opponentDigimon.currentHp <= 0) return;
    this.isChoosingDigimonToAttack.set(false);
    const digimon = this.globalState.turnOrder.shift();

    if (!digimon) return;

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
      this.globalState.turnOrder =
        this.globalState.turnOrder.filter(
          (d) => d.id !== opponentDigimon.id
        );
    }

    this.globalState.nextTurn();
    return;
  }

  attemptRunAway() {
    if (!this.globalState.isBattleActive) return;
    this.globalState.attemptRunAway();
  }

  private log(message: string) {
    this.globalState.log(message);
  }
}
