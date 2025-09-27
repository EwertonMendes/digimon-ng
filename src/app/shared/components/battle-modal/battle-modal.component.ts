import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { DigiStatusCardComponent } from '../digi-status-card/digi-status-card.component';
import { ButtonComponent } from '../button/button.component';
import { AudioService } from '@services/audio.service';
import { CommonModule } from '@angular/common';
import { Digimon } from 'app/core/interfaces/digimon.interface';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ModalComponent } from '../modal/modal.component';
import { ModalService } from '../modal/modal.service';

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
  protected imageBackground = input<string | null>(null);

  protected battleModalId = 'battle-modal';

  protected isChoosingDigimonToAttack = signal(false);
  protected canGoToNextStage = signal(false);
  protected canRepeatStage = signal(false);
  protected ranAway = signal(false);
  protected isBossStage = computed(() => this.globalState.isBossStage(this.globalState.currentBattleStage()));

  protected globalState = inject(GlobalStateDataSource);
  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);
  private modalService = inject(ModalService);

  constructor() {
    this.canGoToNextStage.set(this.globalState.canGoToNextStage());

    this.canRepeatStage.set(!this.globalState.isBossStage(this.globalState.currentBattleStage()) && this.globalState.canGoToNextStage());

    effect(() => {
      if (this.globalState.isBattleActive()) return;

      this.canGoToNextStage.set(this.globalState.canGoToNextStage());

      this.canRepeatStage.set(!this.globalState.isBossStage(this.globalState.currentBattleStage()) && this.globalState.canGoToNextStage());
    });
  }

  protected onBattleModalClose() {
    this.globalState.resetBattleState();
    this.globalState.resetTurnOrder();
    this.ranAway.set(false);
  }

  protected onClickAttack() {
    this.isChoosingDigimonToAttack.set(true);
  }

  protected cancelAttack(event?: MouseEvent) {
    event?.preventDefault();
    this.isChoosingDigimonToAttack.set(false);
  }

  protected playerAttack(opponentDigimon: Digimon) {
    if (!this.globalState.isBattleActive || !this.isChoosingDigimonToAttack() || opponentDigimon.currentHp <= 0) return;
    this.isChoosingDigimonToAttack.set(false);
    const digimon = this.globalState.turnOrder().shift();

    if (!digimon) return;

    this.globalState.currentDefendingDigimon.set({
      ...opponentDigimon,
      owner: 'enemy',
    });

    this.globalState.attack(digimon, opponentDigimon, 'player');

    if (opponentDigimon.currentHp <= 0) {
      this.log(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ENEMY_DEFEATED_LOG', {
          enemy: opponentDigimon.name
        })
      );
      this.globalState.turnOrder.set(
        this.globalState.turnOrder().filter(
          (d) => d.id !== opponentDigimon.id
        ));
    }

    this.globalState.nextTurn();
    return;
  }

  protected repeatStage() {
    this.globalState.repeatStage();
  }

  protected attemptRunAway() {
    if (!this.globalState.isBattleActive()) return;
    const ranAway = this.globalState.attemptRunAway();
    this.ranAway.set(ranAway);
  }

  protected exitLocation() {
    this.modalService.close(this.battleModalId);
    this.onBattleModalClose();
  }

  protected goToNextStage() {
    this.globalState.goToBattleNextStage();
  }

  private log(message: string) {
    this.globalState.log(message);
  }
}
