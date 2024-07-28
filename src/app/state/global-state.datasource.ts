import {
  ChangeDetectorRef,
  inject,
  Injectable,
  Injector,
  signal,
} from '@angular/core';
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
  private playerData = signal<PlayerData>({
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

  get playerDataAcessor() {
    return this.playerData();
  }

  private selectedDigimonOnDetails = signal<Digimon | undefined>(undefined);

  get selectedDigimonOnDetailsAccessor() {
    return this.selectedDigimonOnDetails();
  }

  setSelectedDigimonOnDetailsAccessor(digimon: Digimon | undefined) {
    this.selectedDigimonOnDetails.set(digimon);
  }

  private enemyTeam = signal<Digimon[]>([]);

  get enemyTeamAccessor() {
    return this.enemyTeam();
  }

  private battleLog = signal<string[]>([]);

  get battleLogAccessor() {
    return this.battleLog();
  }

  oneMinuteInterval = 60000;

  digimonService = inject(DigimonService);
  playerDataService = inject(PlayerDataService);

  trainingService = inject(TrainingService);
  farmingService = inject(FarmingService);
  battleService = inject(BattleService);
  storageService = inject(StorageService);

  changeDectorRef = inject(ChangeDetectorRef);

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

  addDigimonToTraining(digimon: Digimon, from: string) {
    const updatedPlayerData = this.trainingService.addDigimonToTraining(
      this.playerData(),
      digimon
    );
    this.updatePlayerData(updatedPlayerData);
    this.removeFromPreviousList(digimon.id!, from);
  }

  private removeDigimonFromTraining(digimonId?: string) {
    const data = this.trainingService.removeDigimonFromTraining(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(data?.playerData);
  }

  addDigimonToList(digimon: Digimon, from: string) {
    const updatedPlayerData = this.storageService.addDigimonToList(
      this.playerData(),
      digimon
    );
    this.updatePlayerData(updatedPlayerData);

    this.removeFromPreviousList(digimon.id!, from);
  }

  private removeDigimonFromList(digimonId?: string) {
    const data = this.storageService.removeDigimonFromList(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(data?.playerData);
  }

  addDigimonToStorage(digimon: Digimon, from: string) {
    const updatedPlayerData = this.storageService.addDigimonToStorage(
      this.playerData(),
      digimon
    );
    this.updatePlayerData(updatedPlayerData);

    this.removeFromPreviousList(digimon.id!, from);
  }

  private removeDigimonFromStorage(digimonId?: string) {
    const updatedPlayerData = this.storageService.removeDigimonFromStorage(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(updatedPlayerData);
  }

  addDigimonToFarm(digimon: Digimon, from: string) {
    const updatedPlayerData = this.farmingService.addDigimonToFarm(
      digimon,
      this.playerData()
    );
    this.updatePlayerData(updatedPlayerData);
    this.removeFromPreviousList(digimon.id!, from);
  }

  private removeDigimonFromFarm(digimonId?: string) {
    const data = this.farmingService.removeDigimonFromFarm(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(data?.playerData);
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
    return this.digimonService.getDigimonEvolutions(
      this.selectedDigimonOnDetails()
    );
  }

  resetBattleState() {
    this.enemyTeam.set([]);
    this.battleLog.set([]);
  }

  private updatePlayerData(playerData?: PlayerData) {
    if (!playerData) return;
    this.playerData.set({
      ...this.playerData(),
      ...playerData,
    });
    this.changeDectorRef.detectChanges();
  }

  private removeFromPreviousList(digimonId: string, from: string) {
    if (from === 'inTraining') {
      this.removeDigimonFromTraining(digimonId);
    }
    if (from === 'bitFarm') {
      this.removeDigimonFromFarm(digimonId);
    }
    if (from === 'storage') {
      this.removeDigimonFromStorage(digimonId);
    }
    if (from === 'team') {
      this.removeDigimonFromList(digimonId);
    }
  }
}
