import { ChangeDetectorRef, inject, Injectable, signal } from '@angular/core';
import { TrainingService } from './services/training.service';
import { FarmingService } from './services/farming.service';
import { BattleService } from './services/battle.service';
import { StorageService } from './services/storage.service';
import { Digimon } from '../core/interfaces/digimon.interface';
import { PlayerData } from '../core/interfaces/player-data.interface';
import { DigimonService } from '../services/digimon.service';
import { PlayerDataService } from '../services/player-data.service';
import { interval } from 'rxjs';
import { DigimonListLocation } from '../core/enums/digimon-list-location.enum';
import { HospitalService } from './services/hospital.service';

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
    hospitalDigimonList: [],
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
  hospitalService = inject(HospitalService);

  changeDectorRef = inject(ChangeDetectorRef);

  handlers: Record<string, Function> = {
    [DigimonListLocation.IN_TRAINING]:
      this.removeDigimonFromTraining.bind(this),
    [DigimonListLocation.BIT_FARM]: this.removeDigimonFromFarm.bind(this),
    [DigimonListLocation.STORAGE]: this.removeDigimonFromStorage.bind(this),
    [DigimonListLocation.TEAM]: this.removeDigimonFromList.bind(this),
    [DigimonListLocation.HOSPITAL]: this.removeDigimonFromHospital.bind(this),
  };

  async connect() {
    const playerData = await this.playerDataService.getPlayerData();

    this.playerData.set(playerData);

    this.initDigimonTraining();
    this.initBitFarmingGeneration();
    this.initHospitalHealing();
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

  initHospitalHealing() {
    interval(this.oneMinuteInterval).subscribe(() => {
      const updatedPlayerData = this.hospitalService.healDigimons(
        this.playerData()
      );
      this.updatePlayerData(updatedPlayerData);
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
    const playerData = this.trainingService.removeDigimonFromTraining(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(playerData);
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
    const playerData = this.storageService.removeDigimonFromList(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(playerData);
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
    const playerData = this.farmingService.removeDigimonFromFarm(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(playerData);
  }

  addDigimonToHospital(digimon: Digimon, from: string) {
    const updatedPlayerData = this.hospitalService.addDigimonToHospital(
      this.playerData(),
      digimon
    );
    this.updatePlayerData(updatedPlayerData);
    this.removeFromPreviousList(digimon.id!, from);
  }

  private removeDigimonFromHospital(digimonId?: string) {
    const playerData = this.hospitalService.removeDigimonFromHospital(
      this.playerData(),
      digimonId
    );
    this.updatePlayerData(playerData);
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

  getDigimonCompleteEvolutionTree(digimon: Digimon) {
    return this.digimonService.getDigimonCompleteEvolutionTree(digimon);
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
    const handler = this.handlers[from];
    if (handler) {
      handler(digimonId);
    }
  }
}
