import {
  ChangeDetectorRef,
  computed,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { TrainingService } from './services/training.service';
import { FarmingService } from './services/farming.service';
import { BattleService } from './services/battle.service';
import { StorageService } from './services/storage.service';
import { BaseDigimon, Digimon } from '../core/interfaces/digimon.interface';
import { PlayerData } from '../core/interfaces/player-data.interface';
import { DigimonService } from '../services/digimon.service';
import { PlayerDataService } from '../services/player-data.service';
import { interval, Subject } from 'rxjs';
import { DigimonListLocation } from '../core/enums/digimon-list-location.enum';
import { HospitalService } from './services/hospital.service';
import { ToastService } from '../shared/components/toast/toast.service';
import { AudioService } from '../services/audio.service';
import { AudioEffects, AudioTracks } from '../core/enums/audio-tracks.enum';
import { TranslocoService } from '@jsverse/transloco';

type EndBattleState = 'victory' | 'defeat' | 'draw';
type DigimonWithOwner = Digimon & { owner: string };
@Injectable({
  providedIn: 'root',
})
export class GlobalStateDataSource {
  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);
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
    digiData: {},
  });

  showInitialSetupScreen = signal<boolean>(false);

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
  turnOrder: Array<DigimonWithOwner> = [];

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

  digimonHpChanges$ = new Subject<{
    digimonId: string;
    previousHp: number;
    currentHp: number;
    difference: number;
    isPositive: boolean;
  }>();

  digimonMpChanges$ = new Subject<{
    digimonId: string;
    previousMp: number;
    currentMp: number;
    difference: number;
    isPositive: boolean;
  }>();

  allPlayerDigimonList = computed(() =>
    [
      this.playerDataAcessor.digimonList,
      this.playerDataAcessor.inTrainingDigimonList,
      this.playerDataAcessor.bitFarmDigimonList,
      this.playerDataAcessor.hospitalDigimonList,
    ].flat()
  );

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

  private createDigimonProxy(digimon: Digimon): Digimon {
    return new Proxy(digimon, {
      set: (target, property, value) => {
        if (property === 'currentHp' && target.currentHp !== value) {
          this.handleHpChange(target, value);
        } else if (property === 'currentMp' && target.currentMp !== value) {
          this.handleMpChange(target, value);
        }
        target[property as keyof Digimon] = value;
        return true;
      },
    });
  }

  private handleHpChange(digimon: Digimon, newHp: number) {
    const previousHp = digimon.currentHp;
    this.digimonHpChanges$.next({
      digimonId: digimon.id!,
      previousHp,
      currentHp: newHp,
      difference: Math.abs(previousHp - newHp),
      isPositive: previousHp < newHp,
    });
  }

  private handleMpChange(digimon: Digimon, newMp: number) {
    const previousMp = digimon.currentMp;
    this.digimonMpChanges$.next({
      digimonId: digimon.id!,
      previousMp,
      currentMp: newMp,
      difference: Math.abs(previousMp - newMp),
      isPositive: previousMp < newMp,
    });
  }

  private updatePlayerDataList(listName: keyof PlayerData, digimon: Digimon) {
    const list = this.playerData()[listName];
    const digimonIndex = list.findIndex((d: Digimon) => d.id === digimon.id);

    if (digimonIndex !== -1) {
      const updatedList = [...list];
      updatedList[digimonIndex] = digimon;
      this.playerData.set({
        ...this.playerData(),
        [listName]: updatedList,
      });
    }
  }

  private trackDigimon(digimon: Digimon) {
    const proxy = this.createDigimonProxy(digimon);
    const found = this.findDigimonInLists(digimon.id!);

    if (found) {
      this.updatePlayerDataList(found.listName, proxy);
    }
  }

  initializeGame(playerData: PlayerData) {
    this.playerData.set(playerData);

    this.allPlayerDigimonList().forEach((digimon) => {
      this.trackDigimon(digimon);
    });

    this.initDigimonTraining();
    this.initBitFarmingGeneration();
    this.initHospitalHealing();
  }

  confirmInitialSetup(playerName: string, selectedDigimons: Digimon[]) {
    const newPlayerData: PlayerData = {
      name: playerName,
      level: 1,
      exp: 0,
      totalExp: 0,
      digimonList: selectedDigimons,
      bitFarmDigimonList: [],
      inTrainingDigimonList: [],
      hospitalDigimonList: [],
      digimonStorageList: [],
      digimonStorageCapacity: 10,
      digimonTrainingCapacity: 10,
      bits: 0,
      digiData: {
        [selectedDigimons[0].seed!]: 10,
        [selectedDigimons[1].seed!]: 10,
        [selectedDigimons[2].seed!]: 10,
      },
    };

    this.playerDataService.savePlayerData(newPlayerData);

    this.initializeGame(newPlayerData);

    this.showInitialSetupScreen.set(false);;
  }

  async saveCurrentPlayerData() {
    await this.playerDataService.savePlayerData(this.playerData());
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

  findDigimonInLists(
    digimonId: string
  ): { digimon: Digimon; listName: string } | undefined {
    const lists = [
      { name: 'digimonList', list: this.playerData().digimonList },
      {
        name: 'bitFarmDigimonList',
        list: this.playerData().bitFarmDigimonList,
      },
      {
        name: 'inTrainingDigimonList',
        list: this.playerData().inTrainingDigimonList,
      },
      {
        name: 'hospitalDigimonList',
        list: this.playerData().hospitalDigimonList,
      },
      {
        name: 'digimonStorageList',
        list: this.playerData().digimonStorageList,
      },
    ];

    for (const { name, list } of lists) {
      const foundDigimon = list.find(
        (digimon: Digimon) => digimon.id === digimonId
      );

      if (foundDigimon) {
        return {
          digimon: foundDigimon,
          listName: name,
        };
      }
    }

    return undefined;
  }

  startBattle() {
    this.repopulateTurnOrder();
    this.isBattleActive = true;
    this.nextTurn();
  }

  endBattle(endState?: EndBattleState) {
    this.isBattleActive = false;
    this.currentAttackingDigimon.set(null);
    this.currentDefendingDigimon.set(null);

    if (endState === 'victory') {
      this.audioService.playAudio(AudioTracks.VICTORY);
      const { totalExp, totalBits, digiDataGains } = this.calculateRewards(this.enemyTeam());

      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.YOU_GAINED_LOG', {
        number: totalExp,
        type: 'exp'
      }));

      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.YOU_GAINED_LOG', {
        number: totalBits,
        type: 'bits'
      }));

      for (const gain of digiDataGains) {
        this.log(`You gained ${gain.amount} ${gain.name} Digi-Data.`);
        this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.DIGI_DATA_GAINED_LOG', {
          amount: gain.amount,
          name: gain.name
        }));
      }
      this.toastService.showToast(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.VICTORY_LOG'),
        'success'
      );
    }

    if (endState === 'defeat') {
      this.audioService.playAudio(AudioTracks.DEFEAT);
      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.DEFEAT_LOG'));
      this.toastService.showToast(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.DEFEAT_LOG'),
        'error',
        'ph-skull'
      );
    }
    this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.BATTLE_ENDED_LOG'));
  }

  private enemyAttack(digimon: Digimon) {
    if (!this.isBattleActive) return;

    const target = this.getTargetBasedOnStrategy();

    if (!target) return;

    this.currentDefendingDigimon.set({ ...target, owner: 'player' });

    setTimeout(() => {
      const dealtDamage = this.attack(digimon, target);
      this.log(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ENEMY_ATTACKS_LOG', {
          name: digimon.name,
          damage: dealtDamage,
          player: target.name,
          hp: target.currentHp
        })
      );

      if (dealtDamage === 0) {
        this.audioService.playAudio(AudioEffects.MISS);
      }

      if (dealtDamage > 0) {
        this.audioService.playAudio(AudioEffects.HIT);
      }

      this.turnOrder.shift();

      if (target.currentHp <= 0) {
        this.log(
          this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.PLAYER_DEFEATED_LOG', {
            player: target.name
          })
        );
        this.turnOrder = this.turnOrder.filter(
          (digimon) => digimon.id !== target.id
        );
      }

      this.nextTurn();
    }, 1000);
  }

  private getTargetBasedOnStrategy(): Digimon | null {
    const playerTeam = this.playerDataAcessor.digimonList.filter(
      (d) => d.currentHp > 0
    );

    if (playerTeam.length === 0) return null;

    const strategies: Record<string, () => Digimon> = {
      lowestHp: () =>
        playerTeam.reduce((lowest, digimon) =>
          digimon.currentHp < lowest.currentHp ? digimon : lowest
        ),
      highestThreat: () =>
        playerTeam.reduce((highest, digimon) =>
          digimon.atk > highest.atk ? digimon : highest
        ),
      random: () => playerTeam[Math.floor(Math.random() * playerTeam.length)],
      fastest: () =>
        playerTeam.reduce((fastest, digimon) =>
          digimon.speed > fastest.speed ? digimon : fastest
        ),
    };

    const strategyKeys = Object.keys(strategies);
    const randomStrategy = strategyKeys[Math.floor(Math.random() * strategyKeys.length)];

    return strategies[randomStrategy]();
  }

  private getTurnOrder() {
    const playerTeam = this.playerDataAcessor.digimonList
      .filter((playerDigimon) => playerDigimon.currentHp > 0)
      .map((playerDigimon) => ({ ...playerDigimon, owner: 'player' }));

    const enemyTeam = this.enemyTeamAccessor
      .filter((enemyDigimon) => enemyDigimon.currentHp > 0)
      .map((enemyDigimon) => ({ ...enemyDigimon, owner: 'enemy' }));

    const allDigimons = [...playerTeam, ...enemyTeam];

    allDigimons.sort((a, b) => b.speed - a.speed);

    const turnOrder: Array<DigimonWithOwner> = [];
    for (const digimon of allDigimons) {
      turnOrder.push(digimon);

      const averageSpeed = allDigimons.reduce((acc, d) => acc + d.speed, 0) / allDigimons.length;
      if (digimon.speed > averageSpeed * 1.5) {
        turnOrder.push(digimon);
      }
    }

    return turnOrder;
  }

  resetTurnOrder() {
    this.turnOrder = [];
  }

  repopulateTurnOrder() {
    this.turnOrder = [...this.turnOrder, ...this.getTurnOrder(), ...this.getTurnOrder()];
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

    if (this.turnOrder.length <= 5) {
      this.repopulateTurnOrder();
    }

    const digimon = this.turnOrder[0];

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

  attemptRunAway() {
    const playerScore = this.battleService.calculateTeamScore(this.playerData().digimonList);
    const enemyScore = this.battleService.calculateTeamScore(this.enemyTeam());

    const escapeChance = this.battleService.calculateEscapeChance(playerScore, enemyScore);
    const chance = Math.random();

    if (chance <= escapeChance) {
      this.toastService.showToast(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ESCAPE_SUCCESS_TOAST'),
        'info'
      );
      this.audioService.playAudio(AudioEffects.MISS);
      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ESCAPE_SUCCESS_LOG'));
      this.endBattle();
      return;
    }

    this.toastService.showToast(
      this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ESCAPE_FAIL_TOAST'),
      'error'
    );
    this.audioService.playAudio(AudioEffects.HIT);
    this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ESCAPE_FAIL_LOG'));

    const enemy = this.turnOrder[0];
    if (!enemy || enemy.owner !== 'enemy') {
      this.enemyAttack(enemy);
      return;
    }

    this.nextTurn();
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

  getBaseDigimonDataBySeed(seed: string) {
    return this.digimonService.getBaseDigimonDataBySeed(seed);
  }

  generateDigimonBySeed(seed: string, level = 1, withEvolutionRoute = false) {
    let digimon = this.digimonService.generateDigimonBySeed(seed);
    if (!digimon) throw Error('Digimon not found');

    if (withEvolutionRoute && digimon.degenerateSeedList[0]) {
      const baseDigimon = this.digimonService.getBaseDigimonDataBySeed(
        digimon.degenerateSeedList[0]
      );

      if (!baseDigimon) throw Error('Digimon not found');

      const evolutionRoute = this.generateEvolutionRoute(baseDigimon);

      digimon.currentEvolutionRoute = evolutionRoute;
    }

    if (level > 1) {
      digimon = this.battleService.levelUpDigimonToLevel(digimon, level)!;
    }

    return digimon;
  }

  private generateEvolutionRoute(baseDigimon: BaseDigimon) {
    const evolutionRoute = [];
    let currentDigimon: BaseDigimon | null = baseDigimon;

    while (currentDigimon) {
      evolutionRoute.unshift({
        seed: currentDigimon.seed,
        rank: currentDigimon.rank,
      });

      if (
        !currentDigimon.degenerateSeedList ||
        currentDigimon.degenerateSeedList.length === 0
      ) {
        break;
      }

      const nextSeed: string = currentDigimon.degenerateSeedList[0];
      currentDigimon =
        this.digimonService.getBaseDigimonDataBySeed(nextSeed) || null;
    }

    return evolutionRoute;
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

  calculateRewards(defeatedDigimons: Digimon[]) {
    const { playerData, totalExp } = this.battleService.calculateTotalGainedExp(
      this.playerData(),
      defeatedDigimons
    );

    const totalBits = this.battleService.calculateTotalGainedBits(defeatedDigimons);

    const digiDataGains = this.battleService.calculateGainedDigiData(defeatedDigimons);

    const updatedDigiData = { ...(playerData.digiData || {}) };

    for (const gain of digiDataGains) {
      const { seed, amount } = gain;
      updatedDigiData[seed] = Math.min((updatedDigiData[seed] || 0) + amount, 999);
    }

    this.updatePlayerData({
      ...playerData,
      bits: (playerData.bits || 0) + totalBits,
      digiData: updatedDigiData
    });

    return { totalExp, totalBits, digiDataGains };
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
    const evolvingDigimonName = digimon.name;
    await this.audioService.playAudio(AudioEffects.EVOLUTION);

    const evolvedDigimon = this.digimonService.evolveDigimon(
      digimon,
      targetSeed
    );

    if (!evolvedDigimon) return;

    this.toastService.showToast(
      `${evolvingDigimonName} evolved to ${evolvedDigimon.name}!`,
      'success'
    );

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

  addHpToDigimon(digimon: Digimon, amount: number) {
    const digimonInList = this.allPlayerDigimonList().find(
      (d) => d.id === digimon.id
    );
    if (!digimonInList) return;
    digimonInList.currentHp += amount;
    digimon.currentHp = digimonInList.currentHp;
  }

  removeHpFromDigimon(digimon: Digimon, amount: number) {
    const digimonInList = this.allPlayerDigimonList().find(
      (d) => d.id === digimon.id
    );
    if (!digimonInList) return;
    digimonInList.currentHp -= amount;
    digimon.currentHp = digimonInList.currentHp;
  }

  convertDigiData(digimon: Digimon) {
    this.addDigimonToStorage(digimon);

    const currentAmount = this.playerData().digiData?.[digimon.seed] || 0;

    const bitCost = this.getBitCost(digimon.rank);

    const updatedPlayerData = {
      ...this.playerData(),
      bits: this.playerData().bits - bitCost,
      digiData: {
        ...this.playerData().digiData,
        [digimon.seed]: currentAmount - 100,
      },
    };

    this.updatePlayerData(updatedPlayerData);

    this.toastService.showToast(
      this.translocoService.translate('MODULES.LAB.TOAST.CONVERSION_SUCCESS', {
        digimon: digimon.name,
      }),
      'success'
    );
  }

  getBitCost(rank: string): number {
    const costMap: Record<string, number> = {
      "Fresh": 100,
      "In-Training": 200,
      "Rookie": 500,
      "Champion": 1500,
      "Ultimate": 5000,
      "Mega": 15000
    };
    return costMap[rank] || 1000;
  }
}
