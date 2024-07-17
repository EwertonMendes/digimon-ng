import { inject, Injectable, signal } from '@angular/core';
import { Digimon } from './core/interfaces/digimon.interface';
import { DigimonService } from './services/digimon.service';
import { PlayerDataService } from './services/player-data.service';
import { PlayerData } from './core/interfaces/player-data.interface';
import { interval } from 'rxjs';

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

  selectedDigimonOnDetails = signal<Digimon | null>(null);

  modifiableAttributes = ['hp', 'mp', 'atk', 'def'];

  upfrontTeamLimit = 6;
  oneMinuteInterval = 60000;

  digimonService = inject(DigimonService);
  playerDataService = inject(PlayerDataService);

  async connect() {
    const playerData = await this.playerDataService.getPlayerData();

    this.playerData.set(playerData);

    this.initDigimonTraining();
    this.initBitFarmingGeneration();
  }

  addDigimonToTraining(digimon: Digimon) {
    if (!digimon.id) return;
    this.playerData().inTrainingDigimonList.push(digimon);
    this.playerData.set({
      ...this.playerData(),
      inTrainingDigimonList: this.playerData().inTrainingDigimonList,
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
    if (
      !digimon.id ||
      this.playerData().digimonList.length >= this.upfrontTeamLimit
    )
      return;
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
    return bitFarmDigimonList.reduce(
      (acc, digimon) => acc + digimon.bitFarmingRate!,
      0
    );
  }

  private initBitFarmingGeneration() {
    interval(this.oneMinuteInterval).subscribe(() => {
      this.generateBitsBasedOnGenerationTotalRate();
    });
  }

  private generateBitsBasedOnGenerationTotalRate() {
    const bitGenerationTotalRate = this.getBitGenerationTotalRate();
    const bits = this.playerData().bits + bitGenerationTotalRate;
    this.playerData.set({
      ...this.playerData(),
      bits,
    });
  }

  private initDigimonTraining() {
    interval(this.oneMinuteInterval).subscribe(() => {
      this.trainDigimons();
    });
  }

  private trainDigimons() {
    this.playerData().inTrainingDigimonList.forEach((digimon) => {
      const randomAttributeToTrainIndex = Math.floor(
        Math.random() * this.modifiableAttributes.length
      );
      const randomAttributeToTrain =
        this.modifiableAttributes[randomAttributeToTrainIndex];
      let randomAttributeTrainingValue = Math.floor(Math.random() * 10);

      if (randomAttributeToTrain === 'hp' || randomAttributeToTrain === 'mp')
        randomAttributeTrainingValue += 10;

      digimon[randomAttributeToTrain] += randomAttributeTrainingValue;
    });

    this.playerData.set({
      ...this.playerData(),
      inTrainingDigimonList: this.playerData().inTrainingDigimonList,
    });
  }

  getDigimonEvolutions() {
    const digimonList: Digimon[] = [];
    this.selectedDigimonOnDetails()?.digiEvolutionSeedList.forEach((seed) => {
      const digimon = this.digimonService.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }
}
