import { inject, Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';
import { ToastService } from '../../shared/components/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class FarmingService {
  toastService = inject(ToastService);

  generateBitsBasedOnGenerationTotalRate(playerData: PlayerData) {
    const bitGenerationTotalRate = this.getBitGenerationTotalRate(playerData);
    playerData.bits += bitGenerationTotalRate;
    return playerData;
  }

  getBitGenerationTotalRate(playerData: PlayerData) {
    const bitFarmDigimonList = playerData.bitFarmDigimonList;
    return bitFarmDigimonList.reduce(
      (acc: number, digimon: Digimon) => acc + digimon.bitFarmingRate!,
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
      this.toastService.showToast('Bit Farm limit reached!', 'error');
      throw Error('Bit Farm limit reached!');
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
