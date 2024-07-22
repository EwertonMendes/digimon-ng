import { Component, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../global-state.datasource';
import { DigiStatusCardComponent } from '../digi-status-card/digi-status-card.component';

@Component({
  selector: 'app-battle-modal',
  standalone: true,
  imports: [ModalComponent, DigiStatusCardComponent],
  templateUrl: './battle-modal.component.html',
  styleUrl: './battle-modal.component.scss',
})
export class BattleModalComponent {
  battleModalId = 'battle-modal';

  globalState = inject(GlobalStateDataSource);

  onBattleModalClose() {
    this.globalState.battleLog.set([]);
    this.globalState.enemyTeam.set([]);
  }
}
