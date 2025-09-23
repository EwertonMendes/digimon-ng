import { Component, inject, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { BattleModalComponent } from '@shared/components/battle-modal/battle-modal.component';
import { Digimon } from '@core/interfaces/digimon.interface';
import { ToastService } from '@shared/components/toast/toast.service';
import { AudioService } from '@services/audio.service';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { LOCATIONS } from '@core/consts/locations';
import { Location } from '@core/consts/locations';

@Component({
  selector: 'app-explore-section',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './explore-section.component.html',
  styleUrl: './explore-section.component.scss',
})
export class ExploreSectionComponent {
  protected globalState = inject(GlobalStateDataSource);
  private modalService = inject(ModalService);
  private translocoService = inject(TranslocoService);
  private toastService = inject(ToastService);
  private audioService = inject(AudioService);

  locations: Location[] = [...LOCATIONS];
  currentLocation = signal<Location | null>(null)

  baseTurnOrder: Digimon[] = [];
  actualTurnOrder: Digimon[] = [];
  showPlayerAttackButton = false;

  canExplore(location: Location): boolean {
    const playerDigimons = this.globalState.playerDataView().digimonList;
    return playerDigimons.some(d => d.level >= location.levelRange.min);
  }

  exploreLocation(location: Location) {
    if (!this.canExplore(location)) {
      const minLevelMsg = this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.MIN_LEVEL_REQUIRED', { minLevel: location.levelRange.min });
      this.toastService.showToast(minLevelMsg, 'error');
      return;
    }

    this.currentLocation.set(location);
    this.audioService.playAudio(AudioEffects.CLICK);
    this.log(this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.LOG_EXPLORING_LOCATION', { location: this.translocoService.translate(location.name) }));

    if (this.isPlayerTeamEmpty()) {
      const noDigimonMsg = this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.NO_DIGIMON_TO_EXPLORE');
      this.toastService.showToast(noDigimonMsg, 'error');
      return;
    }

    this.globalState.generateOpponentsForStageOnLocation(location, 1);
    this.modalService.open('battle-modal', BattleModalComponent, {
      imageBackground: location.img
    });

    this.startBattle();
  }

  private isPlayerTeamEmpty(): boolean {
    const playerTeam = this.globalState.playerDataView().digimonList;
    return playerTeam.length === 0 || playerTeam.every((d) => d.currentHp <= 0);
  }

  private startBattle() {
    this.globalState.startBattle();
  }

  private log(message: string) {
    this.globalState.log(message);
  }
}
