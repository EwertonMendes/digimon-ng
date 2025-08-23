import { Component, computed, inject } from '@angular/core';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-player-info-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, TranslocoModule],
  templateUrl: './player-info-modal.component.html',
  styleUrl: './player-info-modal.component.scss',
})
export class PlayerInfoModalComponent {
  playerInfoModalId = 'player-info-modal';

  protected globalState = inject(GlobalStateDataSource);

  neededExpForNextLevel = computed(() => {
    return this.globalState.getPlayerNeededExpForNextLevel();
  });
}
