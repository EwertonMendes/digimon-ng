import { inject, Injectable, signal } from '@angular/core';
import { Digimon } from './core/interfaces/digimon.interface';
import { DigimonService } from './services/digimon.service';
import { PlayerDataService } from './services/player-data.service';
import { PlayerData } from './core/interfaces/player-data.interface';

@Injectable({
  providedIn: 'root',
})
export class GlobalStateDataSource {
  playerData = signal<PlayerData>({
    name: '',
    level: 0,
    exp: 0,
    digimonList: [],
    bitFarmDigimonList: [],
    inTrainingDigimonList: [],
    digimonStorageList: [],
    digimonStorageCapacity: 0,
    bits: 0,
  });

  digimonService = inject(DigimonService);
  playerDataService = inject(PlayerDataService);

  async connect() {
    const playerData = await this.playerDataService.getPlayerData();

    this.playerData.set(playerData);
  }

  addDigimonToTraining(digimon: Digimon) {
    if (!digimon.id) return;
    const inTrainingDigimonList = this.playerData().inTrainingDigimonList;
    inTrainingDigimonList.push(digimon);
    this.playerData.set({
      ...this.playerData(),
      inTrainingDigimonList,
    });

    this.removeDigimonFromStorage(digimon.id);
  }

  removeDigimonFromTraining(digimonId: string) {
    const digimon = this.playerData().inTrainingDigimonList.find(
      (digimon) => digimon.id === digimonId
    );
    if (digimon) {
      this.addDigimonToStorage(digimon);
    }
    const inTrainingDigimonList =
      this.playerData().inTrainingDigimonList.filter(
        (digimon) => digimon.id !== digimonId
      );
    this.playerData.set({
      ...this.playerData(),
      inTrainingDigimonList,
    });
  }

  addDigimonToList(digimon: Digimon) {
    if (!digimon.id) return;
    const digimonList = this.playerData().digimonList;
    digimonList.push(digimon);
    this.playerData.set({
      ...this.playerData(),
      digimonList,
    });

    this.removeDigimonFromStorage(digimon.id);
  }

  removeDigimonFromList(digimonId: string) {
    const digimon = this.playerData().digimonList.find(
      (digimon) => digimon.id === digimonId
    );
    if (digimon) {
      this.addDigimonToStorage(digimon);
    }
    const digimonList = this.playerData().digimonList.filter(
      (digimon) => digimon.id !== digimonId
    );
    this.playerData.set({
      ...this.playerData(),
      digimonList,
    });
  }

  addDigimonToStorage(digimon: Digimon) {
    const digimonStorageList = this.playerData().digimonStorageList;
    digimonStorageList.push(digimon);
    this.playerData.set({
      ...this.playerData(),
      digimonStorageList,
    });
  }

  removeDigimonFromStorage(digimonId: string) {
    const digimonStorageList = this.playerData().digimonStorageList.filter(
      (digimon) => digimon.id !== digimonId
    );
    this.playerData.set({
      ...this.playerData(),
      digimonStorageList,
    });
  }

  addDigimonToFarm(digimon: Digimon) {
    if (!digimon.id) return;
    const bitFarmDigimonList = this.playerData().bitFarmDigimonList;
    bitFarmDigimonList.push(digimon);
    this.playerData.set({
      ...this.playerData(),
      bitFarmDigimonList,
    });

    this.removeDigimonFromStorage(digimon.id);
  }

  removeDigimonFromFarm(digimonId: string) {
    const digimon = this.playerData().bitFarmDigimonList.find(
      (digimon) => digimon.id === digimonId
    );
    if (digimon) {
      this.addDigimonToStorage(digimon);
    }

    const bitFarmDigimonList = this.playerData().bitFarmDigimonList.filter(
      (digimon) => digimon.id !== digimonId
    );
    this.playerData.set({
      ...this.playerData(),
      bitFarmDigimonList,
    });
  }

  getBitGenerationTotalRate() {
    const bitFarmDigimonList = this.playerData().bitFarmDigimonList;
    return bitFarmDigimonList.reduce((acc, digimon) => acc + digimon.bitFarmingRate!, 0);
  }
}
