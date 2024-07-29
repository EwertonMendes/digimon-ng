import { Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  upfrontTeamLimit = 6;

  addDigimonToList(playerData: PlayerData, digimon?: Digimon) {
    if (!digimon || !digimon.id) return;

    if (playerData.digimonList.length >= this.upfrontTeamLimit)
      throw Error('Team limit reached!');
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
