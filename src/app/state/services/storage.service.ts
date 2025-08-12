import { inject, Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';
import { ToastService } from '../../shared/components/toast/toast.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);

  addDigimonToList(
    playerData: PlayerData,
    currentTeamLimit: number,
    digimon?: Digimon
  ) {
    if (!digimon || !digimon.id) return;

    if (playerData.digimonList.length >= currentTeamLimit) {
      this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.TEAM_LIMIT_REACHED'), 'error');
      throw new Error('Team digimon limit reached!');
    }
    playerData.digimonList.push(digimon);
    return playerData;
  }

  removeDigimonFromList(playerData: PlayerData, digimonId?: string) {
    if (!digimonId) return;

    const index = playerData.digimonList.findIndex(
      (digimon: Digimon) => digimon.id === digimonId
    );
    playerData.digimonList.splice(index, 1);

    return playerData;
  }

  addDigimonToStorage(playerData: PlayerData, digimon?: Digimon) {
    if (!digimon || !digimon.id) return;

    playerData.digimonStorageList.push(digimon);
    return playerData;
  }

  removeDigimonFromStorage(playerData: PlayerData, digimonId?: string) {
    if (!digimonId) return;

    const index = playerData.digimonStorageList.findIndex(
      (digimon: Digimon) => digimon.id === digimonId
    );

    playerData.digimonStorageList.splice(index, 1);
    return playerData;
  }
}
