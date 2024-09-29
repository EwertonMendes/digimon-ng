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
import { ToastService } from '../shared/components/toast/toast.service';
import { AudioService } from '../services/audio.service';
import { AudioEffects, AudioTracks } from '../core/enums/audio-tracks.enum';

type EndBattleState = 'victory' | 'defeat' | 'draw';
type DigimonWithOwner = Digimon & { owner: string };
@Injectable({
  providedIn: 'root',
})
export class GlobalStateDataSource {
  toastService = inject(ToastService);
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

  listsLimits = {
    [DigimonListLocation.TEAM]: 4,
    [DigimonListLocation.IN_TRAINING]: 10,
    [DigimonListLocation.BIT_FARM]: 10,
    [DigimonListLocation.STORAGE]: 5,
    [DigimonListLocation.HOSPITAL]: 10,
  };

  get playerDataAcessor() {
    return this.playerData();
  }

  get totalDigimonCount() {
    return (
      this.playerDataAcessor.digimonList.length +
      this.playerDataAcessor.inTrainingDigimonList.length +
      this.playerDataAcessor.bitFarmDigimonList.length +
      this.playerDataAcessor.hospitalDigimonList.length +
      this.playerDataAcessor.digimonStorageList.length
    );
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

  baseTurnOrder: Array<DigimonWithOwner> = [];
  actualTurnOrder: Array<DigimonWithOwner> = [];

  currentAttackingDigimon = signal<DigimonWithOwner | null>(null);
  currentDefendingDigimon = signal<DigimonWithOwner | null>(null);

  isBattleActive = false;
  showPlayerAttackButton = signal<boolean>(false);

  private trainingDigimonIntervalDurationInSeconds = signal<number>(30);
  trainingDigimonCountdown = signal<number>(0);

  private bitFarmingIntervalDurationInSeconds = signal<number>(60);
  bitFarmingCountdown = signal<number>(0);

  private hospitalHealingIntervalDurationInSeconds = signal<number>(20);
  hospitalHealingCountdown = signal<number>(0);

  digimonService = inject(DigimonService);
  playerDataService = inject(PlayerDataService);
  audioService = inject(AudioService);

  trainingService = inject(TrainingService);
  farmingService = inject(FarmingService);
  battleService = inject(BattleService);
  storageService = inject(StorageService);
  hospitalService = inject(HospitalService);

  changeDectorRef = inject(ChangeDetectorRef);

  listHandlers: Record<string, Function> = {
    [DigimonListLocation.IN_TRAINING]:
      this.removeDigimonFromTraining.bind(this),
    [DigimonListLocation.BIT_FARM]: this.removeDigimonFromFarm.bind(this),
    [DigimonListLocation.STORAGE]: this.removeDigimonFromStorage.bind(this),
    [DigimonListLocation.TEAM]: this.removeDigimonFromList.bind(this),
    [DigimonListLocation.HOSPITAL]: this.removeDigimonFromHospital.bind(this),
  };

  intervalConfigurations: Record<string, any> = {
    digimonTraining: {
      intervalDurationInSeconds:
        this.trainingDigimonIntervalDurationInSeconds.bind(this),
      countdownSetter: this.trainingDigimonCountdown.set.bind(
        this.trainingDigimonCountdown
      ),
      action: () => {
        const updatedPlayerData = this.trainingService.trainDigimons(
          this.playerData()
        );
        this.updatePlayerData(updatedPlayerData);
      },
    },
    bitFarmingGeneration: {
      intervalDurationInSeconds:
        this.bitFarmingIntervalDurationInSeconds.bind(this),
      countdownSetter: this.bitFarmingCountdown.set.bind(
        this.bitFarmingCountdown
      ),
      action: () => {
        const updatedPlayerData =
          this.farmingService.generateBitsBasedOnGenerationTotalRate(
            this.playerData()
          );
        this.updatePlayerData(updatedPlayerData);
      },
    },
    hospitalHealing: {
      intervalDurationInSeconds:
        this.hospitalHealingIntervalDurationInSeconds.bind(this),
      countdownSetter: this.hospitalHealingCountdown.set.bind(
        this.hospitalHealingCountdown
      ),
      action: () => {
        const updatedPlayerData = this.hospitalService.healDigimons(
          this.playerData()
        );
        this.updatePlayerData(updatedPlayerData);
      },
    },
  };

  async connect() {
    const playerData = await this.playerDataService.getPlayerData();

    this.playerData.set(playerData);

    this.initDigimonTraining();
    this.initBitFarmingGeneration();
    this.initHospitalHealing();
  }

  initDigimonTraining() {
    this.initIntervalCountdown('digimonTraining');
  }

  initBitFarmingGeneration() {
    this.initIntervalCountdown('bitFarmingGeneration');
  }

  initHospitalHealing() {
    this.initIntervalCountdown('hospitalHealing');
  }

  log(message: string) {
    this.battleLog().push(message);
  }

  addDigimonToTraining(digimon: Digimon, from: string) {
    const updatedPlayerData = this.trainingService.addDigimonToTraining(
      this.playerData(),
      this.listsLimits[DigimonListLocation.IN_TRAINING],
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
      this.listsLimits[DigimonListLocation.TEAM],
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

  addDigimonToStorage(digimon: Digimon, from?: string) {
    const updatedPlayerData = this.storageService.addDigimonToStorage(
      this.playerData(),
      digimon
    );
    this.updatePlayerData(updatedPlayerData);

    if (!from) return;

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
      this.listsLimits[DigimonListLocation.BIT_FARM],
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
      this.listsLimits[DigimonListLocation.HOSPITAL],
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

  startBattle() {
    this.generateBaseTurnOrder();
    this.isBattleActive = true;
    this.nextTurn();
  }

  endBattle(endState?: EndBattleState) {
    this.isBattleActive = false;
    this.currentAttackingDigimon.set(null);
    this.currentDefendingDigimon.set(null);

    if (endState === 'victory') {
      this.audioService.playAudio(AudioTracks.VICTORY);
      const expAmount = this.calculateTotalGainedExp(this.enemyTeam());
      this.log('Victory! Opponent Digimons were defeated.');
      this.log(`You gained ${expAmount} exp.`);
      this.toastService.showToast(
        'Victory! Opponent Digimons were defeated.',
        'success'
      );
    }

    if (endState === 'defeat') {
      this.audioService.playAudio(AudioTracks.DEFEAT);
      this.log('All player Digimon are defeated. Battle lost.');
      this.toastService.showToast(
        'All player Digimon are defeated. Battle lost.',
        'error',
        'ph-skull'
      );
    }
    this.log('Battle ended.');
  }

  private enemyAttack(digimon: Digimon) {
    if (!this.isBattleActive) return;
    const target = this.playerDataAcessor.digimonList.find(
      (d) => d.currentHp > 0
    );
    if (!target) return;

    this.currentDefendingDigimon.set({ ...target, owner: 'player' });

    setTimeout(() => {
      const dealtDamage = this.attack(digimon, target);
      this.log(
        `Enemy ${digimon.name} attacks! Damage: ${dealtDamage}. Player ${target.name} has ${target.currentHp} health left.`
      );

      if (dealtDamage === 0) {
        this.audioService.playAudio(AudioEffects.MISS);
      }

      if (dealtDamage > 0) {
        this.audioService.playAudio(AudioEffects.HIT);
      }

      this.actualTurnOrder.shift();

      if (target.currentHp <= 0) {
        this.log(`Player ${target.name} has been defeated.`);
        this.baseTurnOrder = this.baseTurnOrder.filter(
          (d) => d.id !== target.id
        );
        this.actualTurnOrder = this.actualTurnOrder.filter(
          (d) => d.id !== target.id
        );
      }

      this.nextTurn();
    }, 1000);
  }

  private getTurnOrder() {
    const playerTeam = this.playerDataAcessor.digimonList
      .filter((d) => d.currentHp > 0)
      .map((d) => ({ ...d, owner: 'player' }));

    const enemyTeam = this.enemyTeamAccessor
      .filter((d) => d.currentHp > 0)
      .map((d) => ({ ...d, owner: 'enemy' }));

    return [...playerTeam, ...enemyTeam].sort(() => Math.random() - 0.5);
  }

  resetTurnOrder() {
    this.baseTurnOrder = [];
    this.actualTurnOrder = [];
  }

  repopulateTurnOrder() {
    for (let i = 0; i < 5; i++) {
      this.actualTurnOrder.push(...this.baseTurnOrder);
    }
  }

  generateBaseTurnOrder() {
    this.baseTurnOrder = this.getTurnOrder();
    this.repopulateTurnOrder();
  }

  nextTurn() {
    if (!this.isBattleActive) {
      this.showPlayerAttackButton.set(false);
      this.endBattle();
      return;
    }

    if (this.enemyTeamAccessor.every((d) => d.currentHp <= 0)) {
      this.isBattleActive = false;
      this.showPlayerAttackButton.set(false);
      this.endBattle('victory');
      return;
    }

    if (this.playerDataAcessor.digimonList.every((d) => d.currentHp <= 0)) {
      this.isBattleActive = false;
      this.showPlayerAttackButton.set(false);
      this.endBattle('defeat');
      return;
    }

    if (this.actualTurnOrder.length <= 5) {
      this.repopulateTurnOrder();
    }

    const digimon = this.actualTurnOrder[0];

    if (!digimon) {
      this.showPlayerAttackButton.set(false);
      this.endBattle();
      return;
    }

    if (digimon.owner === 'player') {
      this.currentAttackingDigimon.set(digimon);
      this.showPlayerAttackButton.set(true);
    }

    if (digimon.owner === 'enemy') {
      this.currentAttackingDigimon.set(digimon);
      this.showPlayerAttackButton.set(false);
      this.enemyAttack(digimon);
    }
  }

  attack(attacker: Digimon, defender: Digimon) {
    return this.battleService.attack(attacker, defender);
  }

  getBitGenerationTotalRate() {
    return this.farmingService.getBitGenerationTotalRate(this.playerData());
  }

  generateRandomDigimon(level?: number) {
    let digimon = this.digimonService.generateRandomDigimon();

    if (level) {
      digimon = this.battleService.levelUpDigimonToLevel(digimon, level)!;
    }

    return digimon;
  }

  getDigimonEvolutions() {
    return this.digimonService.getDigimonEvolutions(
      this.selectedDigimonOnDetails()
    );
  }

  generateDigimonBySeed(seed: string, level?: number) {
    let digimon = this.digimonService.generateDigimonBySeed(seed);
    if (!digimon) throw Error('Digimon not found');
    if (level) {
      digimon = this.battleService.levelUpDigimonToLevel(digimon, level)!;
    }

    return digimon;
  }

  getDigimonCurrentEvolutionRoute(digimon: Digimon) {
    return this.digimonService.getDigimonCurrentEvolutionRoute(digimon);
  }

  resetBattleState() {
    this.enemyTeam.set([]);
    this.battleLog.set([]);
  }

  resetStorage() {
    this.playerData.set({
      ...this.playerData(),
      digimonStorageList: [],
    });
  }

  calculateTotalGainedExp(defeatedDigimons: Digimon[]) {
    const { playerData, totalExp } = this.battleService.calculateTotalGainedExp(
      this.playerData(),
      defeatedDigimons
    );

    this.updatePlayerData(playerData);

    return totalExp;
  }

  getDigimonNeededExpForNextLevel() {
    return this.battleService.calculateRequiredExpForLevel(
      this.selectedDigimonOnDetailsAccessor?.level ?? 1
    );
  }

  getPlayerNeededExpForNextLevel() {
    return this.battleService.calculateRequiredExpForPlayerLevel(
      this.playerDataAcessor.level
    );
  }

  async evolveDigimon(digimon: Digimon, targetSeed: string) {
    await this.audioService.playAudio(AudioEffects.EVOLUTION);

    const evolvedDigimon = this.digimonService.evolveDigimon(
      digimon,
      targetSeed
    );

    if (!evolvedDigimon) return;

    const playerData = this.playerData();
    const lists = this.getAllDigimonLists(playerData);

    this.updateDigimonInLists(lists, digimon, evolvedDigimon);
    this.updateSelectedDigimonDetails(evolvedDigimon);

    this.changeDectorRef.detectChanges();
  }

  private getAllDigimonLists(playerData: PlayerData): Digimon[][] {
    return [
      playerData.digimonList,
      playerData.hospitalDigimonList,
      playerData.inTrainingDigimonList,
      playerData.bitFarmDigimonList,
    ];
  }

  private updateDigimonInLists(
    lists: Digimon[][],
    digimon: Digimon,
    evolvedDigimon: Digimon
  ): void {
    const allDigimons = lists.flatMap((list) => list);
    const digimonToUpdate = allDigimons.find((d) => d.id === digimon.id);

    if (digimonToUpdate) {
      Object.assign(digimonToUpdate, evolvedDigimon);
    }
  }

  private updateSelectedDigimonDetails(evolvedDigimon: Digimon): void {
    this.selectedDigimonOnDetails.set({ ...evolvedDigimon });
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
    const handler = this.listHandlers[from];
    if (handler) {
      handler(digimonId);
    }
  }

  private initIntervalCountdown(
    configKey: keyof typeof this.intervalConfigurations
  ) {
    const config = this.intervalConfigurations[configKey];
    let isFirstRun = true;
    interval(1000).subscribe((secondsPassed) => {
      const remainingTime =
        config.intervalDurationInSeconds() -
        (secondsPassed % config.intervalDurationInSeconds());
      config.countdownSetter(remainingTime);

      if (remainingTime === config.intervalDurationInSeconds() && !isFirstRun) {
        config.action();
      }

      isFirstRun = false;
      this.changeDectorRef.detectChanges();
    });
  }
}
