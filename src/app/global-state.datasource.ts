import { inject, Injectable, signal } from "@angular/core";
import { Digimon } from "./core/interfaces/digimon.interface";
import { DigimonService } from "./services/digimon.service";
import { PlayerDataService } from "./services/player-data.service";
import { PlayerData } from "./core/interfaces/player-data.interface";

@Injectable({
  providedIn: 'root'
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
    const inTrainingDigimonList = this.playerData().inTrainingDigimonList;
    inTrainingDigimonList.push(digimon);
    this.playerData.set({
      ...this.playerData(),
      inTrainingDigimonList,
    });
  }

  removeDigimonFromTraining(digimonId: string) {
    const digimon = this.playerData().inTrainingDigimonList.find(digimon => digimon.id === digimonId);
    if (digimon) {
      this.addDigimonToStorage(digimon);
    }
    const inTrainingDigimonList = this.playerData().inTrainingDigimonList.filter(digimon => digimon.id !== digimonId);
    this.playerData.set({
      ...this.playerData(),
      inTrainingDigimonList,
    });
  }

  removeDigimonFromList(digimonId: string) {
    const digimon = this.playerData().digimonList.find(digimon => digimon.id === digimonId);
    if (digimon) {
      this.addDigimonToStorage(digimon);
    }
    const digimonList = this.playerData().digimonList.filter(digimon => digimon.id !== digimonId);
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
}
