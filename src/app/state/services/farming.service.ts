import { Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';

@Injectable({
  providedIn: 'root',
})
export class FarmingService {
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

  addDigimonToFarm(digimon: Digimon, playerData: PlayerData) {
    if (!digimon.id) return;
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
