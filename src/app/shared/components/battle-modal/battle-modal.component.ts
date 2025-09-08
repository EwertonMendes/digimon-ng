import { Component, inject, input, signal } from '@angular/core';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { DigiStatusCardComponent } from '../digi-status-card/digi-status-card.component';
import { ButtonComponent } from '../button/button.component';
import { AudioService } from '@services/audio.service';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { CommonModule } from '@angular/common';
import { Digimon } from 'app/core/interfaces/digimon.interface';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-battle-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    DigiStatusCardComponent,
    ButtonComponent,
    TranslocoModule
  ],
  templateUrl: './battle-modal.component.html',
  styleUrl: './battle-modal.component.scss',
})
export class BattleModalComponent {
  imageBackground = input<string | null>(null);
  battleModalId = 'battle-modal';
  showPlayerAttackButton = false;
  isChoosingDigimonToAttack = signal(false);

  protected globalState = inject(GlobalStateDataSource);
  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);

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
      this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.PLAYER_ATTACKS_LOG', {
        player: this.globalState.playerDataView().name,
        digimon: digimon.nickName ? digimon.nickName : digimon.name,
        damage: dealtDamage,
        enemy: opponentDigimon.name,
        hp: opponentDigimon.currentHp
      })
    );

    if (dealtDamage === 0) {
      this.audioService.playAudio(AudioEffects.MISS);
    }

    if (dealtDamage > 0) {
      this.audioService.playAudio(AudioEffects.HIT);
    }

    if (opponentDigimon.currentHp <= 0) {
      this.log(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ENEMY_DEFEATED_LOG', {
          enemy: opponentDigimon.name
        })
      );
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
