import { inject, Injectable, Injector, signal } from '@angular/core';
import { TrainingService } from './services/training.service';
import { FarmingService } from './services/farming.service';
import { BattleService } from './services/battle.service';
import { StorageService } from './services/storage.service';
import { Digimon } from '../core/interfaces/digimon.interface';
import { PlayerData } from '../core/interfaces/player-data.interface';
import { DigimonService } from '../services/digimon.service';
import { PlayerDataService } from '../services/player-data.service';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalStateDataSource {
  playerData = signal<PlayerData>({
    name: '',
    level: 0,
    exp: 0,
    totalExp: 0,
    digimonList: [],
    bitFarmDigimonList: [],
    inTrainingDigimonList: [],
    digimonStorageList: [],
    digimonStorageCapacity: 0,
    bits: 0,
  });

  selectedDigimonOnDetails = signal<Digimon | null>(null);
  enemyTeam = signal<Digimon[]>([]);
  battleLog = signal<string[]>([]);

  oneMinuteInterval = 60000;

  digimonService = inject(DigimonService);
  playerDataService = inject(PlayerDataService);

  trainingService = inject(TrainingService);
  farmingService = inject(FarmingService);
  battleService = inject(BattleService);
  storageService = inject(StorageService);

  constructor(injector: Injector) {
    this.trainingService = injector.get(TrainingService);
    this.farmingService = injector.get(FarmingService);
    this.battleService = injector.get(BattleService);
    this.storageService = injector.get(StorageService);
  }

  async connect() {
    const playerData = await this.playerDataService.getPlayerData();

    this.playerData.set(playerData);

    this.initDigimonTraining();
    this.initBitFarmingGeneration();
  }

  initDigimonTraining() {
    interval(this.oneMinuteInterval).subscribe(() => {
      const updatedPlayerData = this.trainingService.trainDigimons(
        this.playerData()
      );
      this.updatePlayerData(updatedPlayerData);
    });
  }

  initBitFarmingGeneration() {
    interval(this.oneMinuteInterval).subscribe(() => {
      this.farmingService.generateBitsBasedOnGenerationTotalRate(
        this.playerData()
      );
      this.updatePlayerData();
    });
  }

  log(message: string) {
    this.battleLog().push(message);
  }

  addDigimonToTraining(digimon: Digimon) {
    const updatedPlayerData = this.trainingService.addDigimonToTraining(
      digimon,
      this.playerData()
    );
    this.updatePlayerData(updatedPlayerData);
    this.removeDigimonFromStorage(digimon.id);
  }

  removeDigimonFromTraining(digimonId: string) {
    const data = this.trainingService.removeDigimonFromTraining(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(data?.playerData);
    this.addDigimonToStorage(data?.digimon);
  }

  addDigimonToList(digimon: Digimon) {
    const updatedPlayerData = this.storageService.addDigimonToList(
      digimon,
      this.playerData()
    );
    this.updatePlayerData(updatedPlayerData);
    this.removeDigimonFromStorage(digimon.id);
  }

  removeDigimonFromList(digimonId: string) {
    const data = this.storageService.removeDigimonFromList(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(data?.playerData);
    this.addDigimonToStorage(data?.digimon);
  }

  addDigimonToStorage(digimon?: Digimon) {
    const updatedPlayerData = this.storageService.addDigimonToStorage(
      this.playerData(),
      digimon
    );
    this.updatePlayerData(updatedPlayerData);
  }

  removeDigimonFromStorage(digimonId?: string) {
    const updatedPlayerData = this.storageService.removeDigimonFromStorage(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(updatedPlayerData);
  }

  addDigimonToFarm(digimon: Digimon) {
    const updatedPlayerData = this.farmingService.addDigimonToFarm(
      digimon,
      this.playerData()
    );
    this.updatePlayerData(updatedPlayerData);
    this.removeDigimonFromStorage(digimon.id);
  }

  removeDigimonFromFarm(digimonId: string) {
    const data = this.farmingService.removeDigimonFromFarm(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(data?.playerData);
    this.addDigimonToStorage(data?.digimon);
  }

  battle(attacker: Digimon, defender: Digimon) {
    this.battleService.battle(attacker, defender);
  }

  getBitGenerationTotalRate() {
    return this.farmingService.getBitGenerationTotalRate(this.playerData());
  }

  generateRandomDigimon() {
    return this.digimonService.generateRandomDigimon();
  }

  getDigimonEvolutions() {
    const digimonList: Digimon[] = [];
    this.selectedDigimonOnDetails()?.digiEvolutionSeedList.forEach((seed) => {
      const digimon = this.digimonService.getBaseDigimonDataById(seed);
      if (digimon) digimonList.push(digimon);
    });
    return digimonList;
  }

  private updatePlayerData(playerData?: PlayerData) {
    if (!playerData) return;
    this.playerData.set({
      ...this.playerData(),
      ...playerData,
    });
  }
}
