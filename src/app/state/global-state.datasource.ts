import { computed, inject, Injectable, signal } from '@angular/core';
import { TrainingService } from './services/training.service';
import { FarmingService } from './services/farming.service';
import { BattleService } from './services/battle.service';
import { StorageService } from './services/storage.service';
import { BaseDigimon, Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData, Team } from '@core/interfaces/player-data.interface';
import { DigimonService } from '@services/digimon.service';
import { PlayerDataService } from '@services/player-data.service';
import { interval, Subject, takeUntil } from 'rxjs';
import { DigimonListLocation } from '@core/enums/digimon-list-location.enum';
import { HospitalService } from './services/hospital.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { AudioService } from '@services/audio.service';
import { AudioEffects, AudioTracks } from '@core/enums/audio-tracks.enum';
import { TranslocoService } from '@jsverse/transloco';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from 'app/services/config.service';
import { ThemeService } from 'app/services/theme.service';
import { PlayerConfig } from 'app/core/interfaces/player-config.interface';
import { getDefaultPotential } from '@core/utils/digimon.utils';
import { WindowService } from '@services/window.service';
import { Location } from '@core/consts/locations';
import { LOCATIONS } from '@core/consts/locations';
import { DesktopDataSource } from '@modules/desktop/desktop.datasource';
import { AttackAnimationService } from '@services/attack-animation.service';

type EndBattleState = 'victory' | 'defeat' | 'draw';
type DigimonWithOwner = Digimon & { owner: string };

const DIGIMON_LIST_KEYS: (keyof PlayerData)[] = [
  'digimonList',
  'inTrainingDigimonList',
  'bitFarmDigimonList',
  'hospitalDigimonList',
  'digimonStorageList',
];
@Injectable({
  providedIn: 'root',
})
export class GlobalStateDataSource {

  private toastService = inject(ToastService);
  private translocoService = inject(TranslocoService);
  private digimonService = inject(DigimonService);
  private playerDataService = inject(PlayerDataService);
  private windowService = inject(WindowService);
  private audioService = inject(AudioService);
  private configService = inject(ConfigService);
  private themeService = inject(ThemeService);
  private trainingService = inject(TrainingService);
  private farmingService = inject(FarmingService);
  private battleService = inject(BattleService);
  private storageService = inject(StorageService);
  private hospitalService = inject(HospitalService);
  private desktopDatasource = inject(DesktopDataSource);
  private attackAnimationService = inject(AttackAnimationService);

  private initialSetupPlayerData: PlayerData = {
    id: '',
    name: '',
    level: 0,
    exp: 0,
    totalExp: 0,
    digimonList: [],
    bitFarmDigimonList: [],
    inTrainingDigimonList: [],
    hospitalDigimonList: [],
    hospitalLevel: 1,
    digimonStorageList: [],
    digimonStorageCapacity: 0,
    bits: 0,
    digiData: {},
    teams: [],
    unlockedLocations: [],
  };

  private playerData = signal<PlayerData>(this.initialSetupPlayerData);
  showInitialSetupScreen = signal<boolean>(false);
  selectedDigimonOnDetails = signal<Digimon | undefined>(undefined);
  private enemyTeam = signal<Digimon[]>([]);
  private battleLog = signal<string[]>([]);
  turnOrder = signal<Array<DigimonWithOwner>>([]);
  currentAttackingDigimon = signal<DigimonWithOwner | null>(null);
  currentDefendingDigimon = signal<DigimonWithOwner | null>(null);
  isBattleActive = signal<boolean>(false);
  showPlayerAttackButton = signal<boolean>(false);
  private currentExploredLocation = signal<Location | null>(null);
  private battleStage = signal<number>(1);
  private trainingDigimonIntervalDurationInSeconds = signal<number>(30);
  trainingDigimonCountdown = signal<number>(0);
  private bitFarmingIntervalDurationInSeconds = signal<number>(60);
  bitFarmingCountdown = signal<number>(0);
  private hospitalHealingIntervalDurationInSeconds = signal<number>(20);
  hospitalHealingCountdown = signal<number>(0);

  private stopIntervals: Subject<void> = new Subject();

  public digimonHpChanges$ = new Subject<{
    digimonId: string;
    previousHp: number;
    currentHp: number;
    difference: number;
    isPositive: boolean;
  }>();

  public digimonMpChanges$ = new Subject<{
    digimonId: string;
    previousMp: number;
    currentMp: number;
    difference: number;
    isPositive: boolean;
  }>();

  get playerDataView() {
    return this.playerData.asReadonly();
  }

  get currentBattleStage() {
    return this.battleStage.asReadonly();
  }

  get totalDigimonCount() {
    return (
      this.playerDataView().digimonList.length +
      this.playerDataView().inTrainingDigimonList.length +
      this.playerDataView().bitFarmDigimonList.length +
      this.playerDataView().hospitalDigimonList.length +
      this.playerDataView().digimonStorageList.length
    );
  }

  get enemyTeamAccessor() {
    return this.enemyTeam();
  }

  get battleLogAccessor() {
    return this.battleLog();
  }

  allPlayerDigimonList = computed(() =>
    [
      this.playerDataView().digimonList,
      this.playerDataView().inTrainingDigimonList,
      this.playerDataView().bitFarmDigimonList,
      this.playerDataView().hospitalDigimonList,
      this.playerDataView().digimonStorageList,
    ].flat()
  );

  getDigimonEvolutions() {
    return this.digimonService.getDigimonEvolutions(
      this.selectedDigimonOnDetails()
    );
  }

  getBaseDigimonDataBySeed(seed: string) {
    return this.digimonService.getBaseDigimonDataBySeed(seed);
  }

  getDigimonCurrentEvolutionRoute(digimon: Digimon) {
    return this.digimonService.getDigimonCurrentEvolutionRoute(digimon);
  }

  getBitGenerationTotalRate() {
    return this.farmingService.getBitGenerationTotalRate(this.playerData());
  }

  getPlayerNeededExpForNextLevel() {
    return this.battleService.calculateRequiredExpForPlayerLevel(
      this.playerDataView().level
    );
  }

  getDigimonNeededExpForNextLevel() {
    return this.battleService.calculateRequiredExpForLevel(
      this.selectedDigimonOnDetails()?.level ?? 1
    );
  }

  getDigimonById(id: string): Digimon | undefined {
    for (const listName of DIGIMON_LIST_KEYS) {
      const found = this.playerData()[listName].find((d: Digimon) => d.id === id);
      if (found) return found;
    }

    return undefined;
  }

  changeDigimonName(newName: string) {
    this.getDigimonById(this.selectedDigimonOnDetails()?.id!)!.nickName = newName.trim();
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
  loadConfigs(newGame: boolean) {
    const initialConfig: PlayerConfig = {
      ...this.configService.defaultInitialConfig,
      language: this.translocoService.getActiveLang()

    };
    this.configService.loadConfig().then(config => {
      this.windowService.setFullscreen(newGame ? initialConfig.toggleFullscreen : config.toggleFullscreen);
      this.audioService.isAudioEnabled = newGame ? initialConfig.enableAudio : config.enableAudio;
      this.themeService.setTheme(newGame ? initialConfig.theme : config.theme);
      this.translocoService.setActiveLang(newGame ? initialConfig.language : config.language);
    });
  }

  initializeGame(playerData: PlayerData, newGame = false) {
    this.playerData.set(playerData);
    this.playerDataService.currentPlayerId = playerData.id;
    this.loadConfigs(newGame);
    this.allPlayerDigimonList().forEach((digimon) => {
      this.trackDigimonForList(digimon);
    });
    this.initDigimonTraining();
    this.initBitFarmingGeneration();
    this.initHospitalHealing();
  }

  resetGameToInitialSetup() {
    this.playerData.set(this.initialSetupPlayerData);
    this.stopIntervals.next();
    this.themeService.setTheme('default', false);
    this.desktopDatasource.resetLayouts();
    this.showInitialSetupScreen.set(true);
  }

  confirmInitialSetup(playerName: string, selectedDigimons: Digimon[]) {
    const newPlayerData: PlayerData = {
      id: uuidv4(),
      name: playerName,
      level: 1,
      exp: 0,
      totalExp: 0,
      digimonList: selectedDigimons,
      bitFarmDigimonList: [],
      inTrainingDigimonList: [],
      hospitalDigimonList: [],
      hospitalLevel: 1,
      digimonStorageList: [],
      digimonStorageCapacity: 10,
      digimonTrainingCapacity: 10,
      bits: 0,
      digiData: {
        [selectedDigimons[0].seed!]: {
          amount: 10,
          obtained: true
        },
        [selectedDigimons[1].seed!]: {
          amount: 10,
          obtained: true
        },
        [selectedDigimons[2].seed!]: {
          amount: 10,
          obtained: true
        },
      },
      teams: [],
      unlockedLocations: [],
    };
    this.playerDataService.savePlayerData(newPlayerData);
    this.initializeGame(newPlayerData, true);
    this.showInitialSetupScreen.set(false);
  }

  async saveCurrentPlayerData() {
    if (this.isBattleActive() || this.showInitialSetupScreen()) return;
    this.audioService.playAudio(AudioEffects.CLICK);
    try {
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.TOAST.GAME_SAVED_SUCCESSFULLY'), 'success');
      await this.playerDataService.savePlayerData(this.playerData());
    } catch (err) {
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.TOAST.GAME_SAVE_FAILED'), 'error');
    }
  }

  addBits(bits: number) {
    const updatedPlayerData = {
      ...this.playerData(),
      bits: this.playerData().bits + bits,
    };
    this.updatePlayerData(updatedPlayerData);
  }

  spendBits(bits: number) {
    const updatedPlayerData = {
      ...this.playerData(),
      bits: this.playerData().bits - bits,
    };
    this.updatePlayerData(updatedPlayerData);
  }

  addDigiData(seed: string, amount: number, obtained: boolean = false) {
    const digiData = { ...this.playerData().digiData };
    digiData[seed] = {
      amount: Math.min((digiData[seed]?.amount || 0) + amount, 999),
      obtained: obtained
    }

    const updatedPlayerData = {
      ...this.playerData(),
      digiData,
    };
    this.updatePlayerData(updatedPlayerData);
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
      this.translocoService.translate('SHARED.COMPONENTS.EVOLUTION_TREE_MODAL.EVOLUTION_SUCCESS', {
        main: evolvingDigimonName,
        target: evolvedDigimon.name
      }),
      'success'
    );
    this.addDigiData(evolvedDigimon.seed, 10, true);
    const playerData = this.playerData();
    const lists = this.getAllDigimonLists(playerData);
    this.updateDigimonInLists(lists, digimon, evolvedDigimon);
    this.updateSelectedDigimonDetails(evolvedDigimon);
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

  killAllDigimon() {
    this.playerData().digimonList.forEach(digimon => digimon.currentHp = 0);
    this.playerData().inTrainingDigimonList.forEach(digimon => digimon.currentHp = 0);
    this.playerData().bitFarmDigimonList.forEach(digimon => digimon.currentHp = 0);
    this.playerData().hospitalDigimonList.forEach(digimon => digimon.currentHp = 0);
    this.playerData().digimonStorageList.forEach(digimon => digimon.currentHp = 0);

    this.playerData.set({
      ...this.playerData(),
      digimonList: this.playerData().digimonList,
      inTrainingDigimonList: this.playerData().inTrainingDigimonList,
      hospitalDigimonList: this.playerData().hospitalDigimonList,
      digimonStorageList: this.playerData().digimonStorageList
    })
  }

  healAllDigimon() {
    this.playerData().digimonList.forEach(digimon => digimon.currentHp = digimon.maxHp);
    this.playerData().inTrainingDigimonList.forEach(digimon => digimon.currentHp = digimon.maxHp);
    this.playerData().bitFarmDigimonList.forEach(digimon => digimon.currentHp = digimon.maxHp);
    this.playerData().hospitalDigimonList.forEach(digimon => digimon.currentHp = digimon.maxHp);
    this.playerData().digimonStorageList.forEach(digimon => digimon.currentHp = digimon.maxHp);

    this.playerData.set({
      ...this.playerData(),
      digimonList: this.playerData().digimonList,
      inTrainingDigimonList: this.playerData().inTrainingDigimonList,
      hospitalDigimonList: this.playerData().hospitalDigimonList,
      digimonStorageList: this.playerData().digimonStorageList
    })
  }

  deleteDigimon(digimonId: string): void {
    this.untrackDigimonForList(digimonId);
    this.playerData.update((currentData) => {
      const updatedData = { ...currentData };

      for (const key of DIGIMON_LIST_KEYS) {
        const list = updatedData[key];
        if (list.some((d: Digimon) => d.id === digimonId)) {
          updatedData[key] = list.filter((d: Digimon) => d.id !== digimonId);
        }
      }
      return updatedData;
    });
  }

  levelUpDigimonToLevel(digimon: Digimon, level: number) {
    const potential = getDefaultPotential(digimon.rank);
    if (level <= digimon.level || digimon.level >= potential) return digimon;
    while (digimon.level < level && digimon.level < potential) {
      const expForNextLevel = this.battleService.calculateRequiredExpForLevel(digimon.level);
      if (!digimon.exp) digimon.exp = 0;
      digimon.exp += expForNextLevel;
      this.battleService.levelUpDigimon(digimon);
    }
    return digimon;
  }
  listsLimits = {
    [DigimonListLocation.TEAM]: 4,
    [DigimonListLocation.IN_TRAINING]: 10,
    [DigimonListLocation.BIT_FARM]: 10,
    [DigimonListLocation.STORAGE]: 5,
    [DigimonListLocation.HOSPITAL]: 10,
  };

  listHandlers: Record<string, Function> = {
    [DigimonListLocation.IN_TRAINING]:
      this.removeDigimonFromTraining.bind(this),
    [DigimonListLocation.BIT_FARM]: this.removeDigimonFromFarm.bind(this),
    [DigimonListLocation.STORAGE]: this.removeDigimonFromStorage.bind(this),
    [DigimonListLocation.TEAM]: this.removeDigimonFromList.bind(this),
    [DigimonListLocation.HOSPITAL]: this.removeDigimonFromHospital.bind(this),
  };

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

  resetStorage() {
    this.playerData.set({
      ...this.playerData(),
      digimonStorageList: [],
    });
  }

  convertDigiData(digimon: Digimon) {
    this.addDigimonToStorage(digimon);
    const currentAmount: number = this.playerData().digiData?.[digimon.seed].amount || 0;
    const bitCost = this.getBitCost(digimon.rank);
    const updatedPlayerData = {
      ...this.playerData(),
      bits: this.playerData().bits - bitCost,
      digiData: {
        ...this.playerData().digiData,
        [digimon.seed]: {
          amount: currentAmount - 100,
          obtained: true,
        },
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
  startBattle() {
    this.repopulateTurnOrder();
    this.isBattleActive.set(true);
    this.nextTurn();
  }

  endBattle(endState?: EndBattleState) {
    this.isBattleActive.set(false);
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
        this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.DIGI_DATA_GAINED_LOG', {
          amount: gain.amount,
          name: gain.name
        }));
      }
      this.toastService.showToast(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.VICTORY_LOG'),
        'success'
      );

      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.BATTLE_ENDED_VICTORY_LOG'));

      if (this.isBossStage(this.battleStage())) {
        this.unlockNextLocation();
      }

    }
    if (endState === 'defeat') {
      this.audioService.playAudio(AudioTracks.DEFEAT);
      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.DEFEAT_LOG'));
      this.toastService.showToast(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.DEFEAT_LOG'),
        'error',
        'skull'
      );
      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.BATTLE_ENDED_DEFEAT_LOG'));
    }
    this.enemyTeam().forEach(digimon => this.untrackDigimonForList(digimon.id!, false));
  }

  isBossStage(stage: number): boolean {
    const location = this.currentExploredLocation();
    if (!location) return false;
    return stage === location.stages.length;
  }

  canGoToNextStage(): boolean {
    const arePlayerDigimonsAlive = this.playerDataView().digimonList.some((d) => d.currentHp > 0);
    return !this.isBattleActive() && (this.currentExploredLocation() ?? false) && !this.isBossStage(this.battleStage()) && arePlayerDigimonsAlive;
  }

  goToBattleNextStage() {
    this.enemyTeam.set([]);
    this.battleLog.set([]);
    this.resetTurnOrder();
    this.battleStage.set(this.battleStage() + 1);

    if (!this.currentExploredLocation()) return;

    if (!this.isBossStage(this.battleStage())) {
      this.generateOpponentsForStageOnLocation(this.currentExploredLocation()!, this.battleStage());
    }

    if (this.isBossStage(this.battleStage())) {
      this.generateBossesOnExploreLocation(this.currentExploredLocation()!, this.battleStage());
    }

    this.startBattle();
  }

  nextTurn() {
    if (!this.isBattleActive()) {
      this.showPlayerAttackButton.set(false);
      this.endBattle();
      return;
    }
    if (this.enemyTeamAccessor.every((d) => d.currentHp <= 0)) {
      this.isBattleActive.set(false);
      this.showPlayerAttackButton.set(false);
      this.endBattle('victory');
      return;
    }
    if (this.playerDataView().digimonList.every((d) => d.currentHp <= 0)) {
      this.isBattleActive.set(false);
      this.showPlayerAttackButton.set(false);
      this.endBattle('defeat');
      return;
    }
    if (this.turnOrder.length <= 5) {
      this.repopulateTurnOrder();
    }
    const digimon = this.turnOrder()[0];
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

  attemptRunAway(): boolean {
    const playerScore = this.battleService.calculateTeamScore(this.playerData().digimonList);
    const enemyScore = this.battleService.calculateTeamScore(this.enemyTeam());
    const escapeChance = this.battleService.calculateEscapeChance(playerScore, enemyScore);
    const chance = Math.random();
    if (chance <= escapeChance) {
      this.toastService.showToast(
        this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ESCAPE_SUCCESS_TOAST'),
        'info',
        'run'
      );
      this.audioService.playAudio(AudioEffects.MISS);
      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ESCAPE_SUCCESS_LOG'));
      this.endBattle();
      return true;
    }
    this.toastService.showToast(
      this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ESCAPE_FAIL_TOAST'),
      'error'
    );
    this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ESCAPE_FAIL_LOG'));
    const enemy = this.turnOrder().find(d => d.owner === 'enemy');
    this.turnOrder().shift();
    if (enemy) {
      this.currentAttackingDigimon.set(enemy);
      this.enemyAttack(enemy);
    }
    return false;
  }

  repeatStage() {
    this.enemyTeam.set([]);
    this.battleLog.set([]);
    this.resetTurnOrder();
    this.generateOpponentsForStageOnLocation(this.currentExploredLocation()!, this.battleStage());
    this.startBattle();
  }

  unlockNextLocation() {
    const currentLocation = this.currentExploredLocation();
    if (!currentLocation) return;

    const nextLocation = LOCATIONS[LOCATIONS.findIndex(l => l.id === currentLocation.id) + 1];
    if (!nextLocation) return;

    this.playerData.update((currentData) => {
      const updatedData = { ...currentData };
      if (!updatedData.unlockedLocations) updatedData.unlockedLocations = [];
      updatedData.unlockedLocations = [...updatedData.unlockedLocations, nextLocation.id];
      return updatedData;
    });

    this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.LOCATION_UNLOCKED', { location: this.translocoService.translate(nextLocation.name) }));
    this.toastService.showToast(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.LOCATION_UNLOCKED', { location: this.translocoService.translate(nextLocation.name) }), 'success');
  }

  unlockSpecificLocation(location: Location) {
    this.playerData.update((currentData) => {
      const updatedData = { ...currentData };
      if (!updatedData.unlockedLocations) updatedData.unlockedLocations = [];
      updatedData.unlockedLocations = [...updatedData.unlockedLocations, location.id];
      return updatedData;
    });
  }

  lockSpecificLocation(location: Location) {
    this.playerData.update((currentData) => {
      const updatedData = { ...currentData };
      if (!updatedData.unlockedLocations) updatedData.unlockedLocations = [];
      updatedData.unlockedLocations = updatedData.unlockedLocations.filter(l => l !== location.id);
      return updatedData;
    });
  }

  isLocationUnlocked(location: Location): boolean {
    return this.playerDataView().unlockedLocations?.includes(location.id);
  }

  attack(attacker: Digimon, defender: Digimon, owner: string) {
    const dealtDamage = this.battleService.attack(attacker, defender);

    if (dealtDamage === 0) {
      this.audioService.playAudio(AudioEffects.MISS);

      this.log(this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.MISS_LOG', {
        attacker: attacker.nickName ?? attacker.name,
        defender: defender.nickName ?? defender.name
      }));

      this.digimonHpChanges$.next({
        digimonId: defender.id!,
        previousHp: defender.currentHp,
        currentHp: defender.currentHp,
        difference: 0,
        isPositive: false,
      });

      return 0;
    }

    if (dealtDamage > 0) {
      this.audioService.playAudio(AudioEffects.HIT);

      if (owner === 'enemy') {
        this.log(
          this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.ENEMY_ATTACKS_LOG', {
            name: attacker.nickName ?? attacker.name,
            damage: dealtDamage,
            player: this.playerData().name,
            digimon: defender.nickName ? defender.nickName : defender.name,
            hp: defender.currentHp
          })
        );
      }

      if (owner === 'player') {
        this.log(
          this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.PLAYER_ATTACKS_LOG', {
            player: this.playerDataView().name,
            digimon: attacker.nickName ?? attacker.name,
            damage: dealtDamage,
            enemy: defender.name,
            hp: defender.currentHp
          })
        );
      }
    }

    return dealtDamage;
  }

  resetBattleState() {
    this.enemyTeam.set([]);
    this.battleLog.set([]);
    this.currentExploredLocation.set(null);
    this.battleStage.set(1);
  }
  private enemyAttack(digimon: Digimon) {
    if (!this.isBattleActive) return;
    const target = this.getTargetBasedOnStrategy();
    if (!target) return;

    this.currentDefendingDigimon.set({ ...target, owner: 'player' });

    setTimeout(async () => {
      const attackingCard = document.querySelector(
        `app-digi-status-card[data-id="${digimon.id}"] `
      ) as HTMLElement;

      const targetCard = document.querySelector(
        `app-digi-status-card[data-id="${target.id}"]`
      ) as HTMLElement;

      this.showPlayerAttackButton.set(false);

      await this.attackAnimationService.animateAttackUsingElement(attackingCard, targetCard, digimon.id!);

      this.attack(digimon, target, 'enemy');

      this.turnOrder().shift();
      if (target.currentHp <= 0) {
        this.log(
          this.translocoService.translate('SHARED.COMPONENTS.BATTLE_MODAL.PLAYER_DEFEATED_LOG', {
            player: this.playerData().name,
            digimon: target.nickName ? target.nickName : target.name,
          })
        );
        this.turnOrder.set(this.turnOrder().filter(
          (digimon) => digimon.id !== target.id
        ));
      }
      this.nextTurn();
    }, 1000);
  }

  private getTargetBasedOnStrategy(): Digimon | null {
    const playerTeam = this.playerDataView().digimonList.filter(
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
    const playerTeam = this.playerDataView().digimonList
      .filter((playerDigimon) => playerDigimon.currentHp > 0)
      .map((playerDigimon) => ({ ...playerDigimon, owner: 'player' }));

    const enemyTeam = this.enemyTeamAccessor
      .filter((enemyDigimon) => enemyDigimon.currentHp > 0)
      .map((enemyDigimon) => ({ ...enemyDigimon, owner: 'enemy' }));
    const allDigimons = [...playerTeam, ...enemyTeam];

    allDigimons.sort((a, b) => b.speed - a.speed);

    const totalSpeed = allDigimons.reduce((acc, d) => acc + d.speed, 0);
    const averageSpeed = allDigimons.length > 0 ? totalSpeed / allDigimons.length : 0;
    const speedThreshold = averageSpeed * 1.5;

    const turnOrder = [];
    for (const digimon of allDigimons) {
      turnOrder.push(digimon);
      if (digimon.speed > speedThreshold) {
        turnOrder.push(digimon);
      }
    }
    return turnOrder;
  }

  resetTurnOrder() {
    this.turnOrder.set([]);
  }

  repopulateTurnOrder() {
    const newOrder = this.getTurnOrder();
    this.turnOrder.set([...this.turnOrder(), ...newOrder, ...newOrder]);
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
      updatedDigiData[seed] = {
        amount: Math.min((updatedDigiData[seed]?.amount || 0) + amount, 999),
        obtained: updatedDigiData[seed]?.obtained ?? false
      }
    }
    this.updatePlayerData({
      ...playerData,
      bits: (playerData.bits || 0) + totalBits,
      digiData: updatedDigiData
    });
    return { totalExp, totalBits, digiDataGains };
  }

  log(message: string) {
    this.battleLog().push(message);
  }

  generateRandomDigimon(level?: number) {
    let digimon = this.digimonService.generateRandomDigimon();
    if (level) {
      digimon = this.battleService.levelUpDigimonToLevel(digimon, level)!;
    }
    return digimon;
  }

  generateOpponentsForStageOnLocation(location: Location, stage: number) {
    const nonBossStages = location.stages.filter(s => !!s.possibleEncounters);
    const numNonBossStages = nonBossStages.length;

    if (stage < 1 || stage > numNonBossStages) {
      return;
    }

    const currentStage = nonBossStages[stage - 1];

    const randomNumber = Math.round(Math.random() * 3) + 1;

    const encounters = currentStage.possibleEncounters || [];

    if (encounters.length === 0) {
      for (let i = 0; i < randomNumber; i++) {
        const randomLevel = Math.floor(
          Math.random() * (location.levelRange.max - location.levelRange.min + 1) +
          location.levelRange.min
        );
        const opponentDigimon = this.generateRandomDigimon(randomLevel);
        this.trackDigimonForList(opponentDigimon, false);
        this.log(this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.ENEMY_FOUND', { name: opponentDigimon.name }));
      }
      return;
    }

    this.currentExploredLocation.set(location);
    this.battleStage.set(stage);

    const weights = encounters.map(encounter => 1 - encounter.rarity);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    for (let i = 0; i < randomNumber; i++) {
      let randomValue = Math.random() * totalWeight;
      let selectedIndex = -1;

      for (let j = 0; j < weights.length; j++) {
        randomValue -= weights[j];
        if (randomValue <= 0) {
          selectedIndex = j;
          break;
        }
      }

      if (selectedIndex === -1) {
        selectedIndex = Math.floor(Math.random() * encounters.length);
      }

      const selectedEncounter = encounters[selectedIndex];
      const randomLevel = Math.floor(
        Math.random() * (selectedEncounter.levelRange.max - selectedEncounter.levelRange.min + 1) +
        selectedEncounter.levelRange.min
      );
      const opponentDigimon = this.generateDigimonBySeed(
        selectedEncounter.seed,
        randomLevel
      );
      if (!opponentDigimon) continue;
      this.trackDigimonForList(opponentDigimon, false);
      this.log(this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.ENEMY_FOUND', { name: opponentDigimon.name }));
    }
  }

  private generateBossesOnExploreLocation(location: Location, stage: number) {
    const allStages = location.stages;
    const numStages = allStages.length;

    if (stage < 1 || stage > numStages) {
      return;
    }

    const currentStage = allStages[stage - 1];

    if (!currentStage.boss || currentStage.boss.length === 0) {
      return;
    }

    currentStage.boss.forEach(boss => {
      const opponentDigimon = this.generateDigimonBySeed(
        boss.seed,
        boss.level
      );
      if (!opponentDigimon) return;
      this.trackDigimonForList(opponentDigimon, false);
      this.log(this.translocoService.translate('MODULES.ADVENTURE.EXPLORE_SECTION.ENEMY_FOUND', { name: opponentDigimon.name }));
    });
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
    let previousHp = digimon.currentHp;
    let clampedNewHp = Math.max(0, newHp);
    let difference = clampedNewHp - previousHp;
    let isPositive = difference > 0;

    if (clampedNewHp <= 0) {
      isPositive = false;
      difference = -(previousHp - clampedNewHp);
    }

    this.digimonHpChanges$.next({
      digimonId: digimon.id!,
      previousHp,
      currentHp: clampedNewHp,
      difference: Math.abs(difference),
      isPositive,
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

  trackDigimonForList(digimon: Digimon, isPlayerDigimon: boolean = true): Digimon {
    const proxy = this.createDigimonProxy(digimon);

    if (!isPlayerDigimon) {
      const enemyIndex = this.enemyTeamAccessor.findIndex(d => d.id === digimon.id);
      if (enemyIndex !== -1) {
        this.enemyTeamAccessor[enemyIndex] = proxy;
        return proxy;
      }
      this.enemyTeamAccessor.push(proxy);
      return proxy;
    }

    const found = this.findDigimonInLists(digimon.id!);
    if (found) {
      this.updatePlayerDataList(found.listName, proxy);
    }

    return proxy;
  }

  untrackDigimonForList(digimonId: string, isPlayerDigimon: boolean = true): void {
    if (!isPlayerDigimon) {
      const enemyIndex = this.enemyTeamAccessor.findIndex(d => d.id === digimonId);
      if (enemyIndex !== -1) {
        const original = { ...this.enemyTeamAccessor[enemyIndex] };
        this.enemyTeamAccessor[enemyIndex] = original;
        return;
      }
      return;
    }

    const found = this.findDigimonInLists(digimonId);
    if (found) {
      const original = { ...found.digimon };
      this.updatePlayerDataList(found.listName, original);
    }
  }

  private getCurrentTeamDigimons(): Digimon[] {
    const currentTeam = [...this.playerData().digimonList];
    return currentTeam;
  }

  private getCurrentTeamMemberIds(): string[] {
    const currentTeam = this.getCurrentTeamDigimons();
    return currentTeam
      .map(digimon => digimon.id!)
      .filter((id): id is string => id !== undefined);
  }

  private getTeamByName(teamName: string): Team | undefined {
    return this.playerData().teams?.find(t => t.name.toLowerCase() === teamName.toLowerCase());
  }

  private getTeamIndex(teamName: string): number {
    return (this.playerData().teams || []).findIndex(t => t.name.toLowerCase() === teamName.toLowerCase());
  }

  private updateTeams(newTeams: Team[]): void {
    this.playerData.set({
      ...this.playerData(),
      teams: newTeams,
    });
  }

  private moveCurrentTeamToStorage(): void {
    const currentTeam = this.getCurrentTeamDigimons();
    currentTeam.forEach(digimon => {
      this.addDigimonToStorage(digimon, DigimonListLocation.TEAM);
    });
  }

  private loadTeamMembersToActive(memberIds: string[]): void {
    memberIds.forEach(memberId => {
      const foundDigimonInfo = this.findDigimonInAnyList(memberId);
      if (foundDigimonInfo) {
        this.addDigimonToList(foundDigimonInfo.digimon, foundDigimonInfo.listName);
      }
    });
  }

  private updateTeamMembersAtIndex(index: number, memberIds: string[]): void {
    const teams = [...(this.playerData().teams || [])];
    teams[index].members = memberIds;
    this.updateTeams(teams);
  }

  private removeTeamAtIndex(index: number): void {
    const teams = [...(this.playerData().teams || [])];
    teams.splice(index, 1);
    this.updateTeams(teams);
  }

  loadBattleTeam(teamName: string): void {
    const team = this.getTeamByName(teamName);
    if (!team) {
      return;
    }

    this.moveCurrentTeamToStorage();
    this.loadTeamMembersToActive(team.members);
  }

  createBattleTeam(teamName: string): void {
    const existingTeamIndex = this.getTeamIndex(teamName);
    if (existingTeamIndex !== -1) {
      this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.TEAM_ALREADY_EXISTS', { teamName }), 'error');
      return;
    }

    const memberIds = this.getCurrentTeamMemberIds();
    const newTeam: Team = {
      name: teamName,
      members: memberIds,
    };

    this.updateTeams([...(this.playerData().teams || []), newTeam]);
    this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.TEAM_CREATED', { teamName }), 'success');
  }

  updateBattleTeam(teamName: string): void {
    const teamIndex = this.getTeamIndex(teamName);
    if (teamIndex === -1) {
      this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.TEAM_NOT_FOUND', { teamName }), 'error');
      return;
    }

    const memberIds = this.getCurrentTeamMemberIds();
    this.updateTeamMembersAtIndex(teamIndex, memberIds);
    this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.TEAM_UPDATED', { teamName }), 'success');
  }

  removeBattleTeam(teamName: string): void {
    const teamIndex = this.getTeamIndex(teamName);
    if (teamIndex === -1) {
      this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.TEAM_NOT_FOUND', { teamName }), 'error');
      return;
    }

    this.removeTeamAtIndex(teamIndex);
    this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.TEAM_REMOVED', { teamName }), 'success');
  }

  private findDigimonInAnyList(digimonId: string): { digimon: Digimon; listName: string } | undefined {
    const digimonLists = [
      { name: DigimonListLocation.TEAM, list: this.playerData().digimonList },
      { name: DigimonListLocation.BIT_FARM, list: this.playerData().bitFarmDigimonList },
      { name: DigimonListLocation.IN_TRAINING, list: this.playerData().inTrainingDigimonList },
      { name: DigimonListLocation.HOSPITAL, list: this.playerData().hospitalDigimonList },
      { name: DigimonListLocation.STORAGE, list: this.playerData().digimonStorageList },
    ];

    for (const { name: listName, list } of digimonLists) {
      const foundDigimon = list.find(digimon => digimon.id === digimonId);
      if (foundDigimon) {
        return {
          digimon: foundDigimon,
          listName,
        };
      }
    }

    return undefined;
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
    this.selectedDigimonOnDetails.set(evolvedDigimon);
  }

  private updatePlayerData(playerData?: PlayerData) {
    if (!playerData) return;
    this.playerData.set({
      ...this.playerData(),
      ...playerData,
    });
  }

  private removeFromPreviousList(digimonId: string, from: string) {
    const handler = this.listHandlers[from];
    if (handler) {
      handler(digimonId);
    }
  }

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

        if (!this.selectedDigimonOnDetails()) return;

        const trainingDigimonSelectedOnDetails = updatedPlayerData.inTrainingDigimonList.find(d => d.id === this.selectedDigimonOnDetails()?.id);
        if (trainingDigimonSelectedOnDetails) this.selectedDigimonOnDetails.set({ ...trainingDigimonSelectedOnDetails });
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

        if (!this.selectedDigimonOnDetails()) return;

        const hospitalDigimonSelectedOnDetails = updatedPlayerData.hospitalDigimonList.find(d => d.id === this.selectedDigimonOnDetails()?.id);
        if (hospitalDigimonSelectedOnDetails) this.selectedDigimonOnDetails.set({ ...hospitalDigimonSelectedOnDetails });
      },
    },
  };

  initDigimonTraining() {
    this.initIntervalCountdown('digimonTraining');
  }

  initBitFarmingGeneration() {
    this.initIntervalCountdown('bitFarmingGeneration');
  }

  initHospitalHealing() {
    this.initIntervalCountdown('hospitalHealing');
  }

  private initIntervalCountdown(
    configKey: keyof typeof this.intervalConfigurations
  ) {
    const config = this.intervalConfigurations[configKey];
    let isFirstRun = true;
    interval(1000).pipe(takeUntil(this.stopIntervals)).subscribe((secondsPassed) => {
      const remainingTime =
        config.intervalDurationInSeconds() -
        (secondsPassed % config.intervalDurationInSeconds());
      config.countdownSetter(remainingTime);
      if (remainingTime === config.intervalDurationInSeconds() && !isFirstRun) {
        config.action();
      }
      isFirstRun = false;
    });
  }
}
