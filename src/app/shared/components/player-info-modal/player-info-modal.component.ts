import { Component, computed, inject } from '@angular/core';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ModalComponent } from '../modal/modal.component';
import { LocalizedNumberPipe } from 'app/pipes/localized-number.pipe';

@Component({
  selector: 'app-player-info-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, TranslocoModule, LocalizedNumberPipe],
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
