import { inject, Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { ToastService } from '@shared/components/toast/toast.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class FarmingService {
  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);

  generateBitsBasedOnGenerationTotalRate(playerData: PlayerData) {
    const bitGenerationTotalRate = this.getBitGenerationTotalRate(playerData);
    playerData.bits += bitGenerationTotalRate;
    return playerData;
  }

  getBitGenerationTotalRate(playerData: PlayerData) {
    const bitFarmDigimonList = playerData.bitFarmDigimonList;
    return bitFarmDigimonList.reduce(
      (acc: number, digimon: Digimon) =>
        digimon.currentHp > 0 ? acc + (digimon.bitFarmingRate ?? 0) : acc,
      0
    );
  }

  addDigimonToFarm(
    digimon: Digimon,
    currentFarmLimit: number,
    playerData: PlayerData
  ) {
    if (!digimon.id) return;
    if (playerData.bitFarmDigimonList.length >= currentFarmLimit) {
      this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.FARM_LIMIT_REACHED'), 'error');
      throw new Error('Farm limit reached!');
    }

    playerData.bitFarmDigimonList.push(digimon);

    return playerData;
  }

  removeDigimonFromFarm(playerData: PlayerData, digimonId?: string) {
    if (!digimonId) return;

    const index = playerData.bitFarmDigimonList.findIndex(
      (digimon: Digimon) => digimon.id === digimonId
    );

    playerData.bitFarmDigimonList.splice(index, 1);

    return playerData;
  }
}
