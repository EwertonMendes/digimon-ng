import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { AudioService } from 'app/services/audio.service';
import { ThemeService } from 'app/services/theme.service';
import { WindowService } from '@services/window.service';
import { ConfigService } from 'app/services/config.service';
import { PlayerDataService } from 'app/services/player-data.service';
import { PlayerConfig } from 'app/core/interfaces/player-config.interface';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { ToastService } from '@shared/components/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class ConfigStateDataSource {
  private readonly translocoService = inject(TranslocoService);
  private readonly audioService = inject(AudioService);
  private readonly themeService = inject(ThemeService);
  private readonly windowService = inject(WindowService);
  private readonly configService = inject(ConfigService);
  private readonly playerDataService = inject(PlayerDataService);
  private readonly toastService = inject(ToastService);

  private readonly ready = signal(false);
  private readonly state = signal<PlayerConfig>(this.configService.defaultInitialConfig);

  readonly config = computed(() => this.state());
  readonly audioEnabled = computed(() => this.state().enableAudio ?? false);
  readonly fullscreenEnabled = computed(() => this.state().toggleFullscreen ?? false);
  readonly languageCode = computed(() => this.state().language ?? 'en');
  readonly themeName = computed(() => this.state().theme ?? 'default');
  readonly localAiEnabled = computed(() => this.state().enableLocalAi ?? false);

  readonly ollamaInstalled = signal(false);
  readonly modelInstalled = signal(false);
  readonly modelInstalling = signal(false);
  readonly modelProgress = signal<string | null>(null);
  readonly canToggleLocalAI = computed(() => this.ollamaInstalled() && this.modelInstalled());

  private eventsBound = false;
  protected unlistenProgress: UnlistenFn | null = null;
  protected unlistenDone: UnlistenFn | null = null;
  private static readonly INSTALL_FLAG = 'aiModelInstallInProgress';

  constructor() {
    effect(() => {
      if (!this.canToggleLocalAI() && this.localAiEnabled()) {
        this.patch({ enableLocalAi: false });
      }
    });
  }

  async initialize(newGame: boolean): Promise<void> {
    const defaultsWithLang: PlayerConfig = {
      ...this.configService.defaultInitialConfig,
      language:
        this.translocoService.getActiveLang() ??
        this.configService.defaultInitialConfig.language,
    };

    const persisted = await this.configService.loadConfig(defaultsWithLang);
    const chosen = newGame ? defaultsWithLang : persisted;

    this.state.set(chosen);
    await this.applyAllEffects(chosen);

    if (newGame) {
      await this.configService.saveConfig(this.playerDataService.currentPlayerId, chosen);
    }

    this.ready.set(true);
    await this.initOllamaDetection();

    if (!this.eventsBound) {
      this.bindInstallEvents();
    }

    const flag = localStorage.getItem(ConfigStateDataSource.INSTALL_FLAG);
    if (flag && !this.modelInstalled()) {
      this.modelInstalling.set(true);
      this.modelProgress.set('0%');
    }
    if (flag && this.modelInstalled()) {
      localStorage.removeItem(ConfigStateDataSource.INSTALL_FLAG);
      this.modelInstalling.set(false);
      this.modelProgress.set(null);
    }
  }

  patch(partial: Partial<PlayerConfig>): void {
    const previous = this.state();
    const next: PlayerConfig = { ...previous, ...partial };
    this.state.set(next);
    this.applyChangedEffects(previous, next);
  }

  setFullscreenEnabled(value: boolean): void {
    this.patch({ toggleFullscreen: value });
  }

  setAudioEnabled(value: boolean): void {
    this.patch({ enableAudio: value });
  }

  setLanguage(code: string): void {
    this.patch({ language: code });
  }

  setTheme(name: string): void {
    this.patch({ theme: name });
  }

  setLocalAiEnabled(value: boolean): void {
    this.patch({ enableLocalAi: value });
  }

  private async applyAllEffects(cfg: PlayerConfig): Promise<void> {
    await this.windowService.setFullscreen(cfg.toggleFullscreen);
    this.audioService.isAudioEnabled = cfg.enableAudio;
    this.themeService.setTheme(cfg.theme);
    this.translocoService.setActiveLang(cfg.language);
  }

  private applyChangedEffects(prev: PlayerConfig, next: PlayerConfig): void {
    if (next.toggleFullscreen !== prev.toggleFullscreen) {
      this.windowService.setFullscreen(next.toggleFullscreen);
    }
    if (next.enableAudio !== prev.enableAudio) {
      this.audioService.isAudioEnabled = next.enableAudio;
    }
    if (next.theme !== prev.theme) {
      this.themeService.setTheme(next.theme);
    }
    if (next.language !== prev.language) {
      this.translocoService.setActiveLang(next.language);
    }
  }

  async initOllamaDetection(interval = 3000) {
    await this.checkOllamaStatus();
    await this.checkModelStatus();
    setInterval(() => {
      this.checkOllamaStatus();
      this.checkModelStatus();
      if (!this.modelInstalled() && localStorage.getItem(ConfigStateDataSource.INSTALL_FLAG)) {
        this.modelInstalling.set(true);
      }
    }, interval);
  }

  private async checkOllamaStatus() {
    try {
      const installed = await invoke<boolean>('ollama_is_installed');
      this.ollamaInstalled.set(installed);
    } catch {
      this.ollamaInstalled.set(false);
    }
  }

  private async checkModelStatus() {
    try {
      const installed = await invoke<boolean>('ollama_has_model', { name: 'gemma3n:e4b' });
      this.modelInstalled.set(installed);
    } catch {
      this.modelInstalled.set(false);
    }
  }

  async installModel(name: string) {
    if (this.modelInstalling() || this.modelInstalled()) return;
    this.modelInstalling.set(true);
    this.modelProgress.set('0%');
    localStorage.setItem(ConfigStateDataSource.INSTALL_FLAG, '1');
    try {
      await invoke('ollama_install_model', { model: name });
    } catch {
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.CONFIG_MODAL.ENABLE_LOCAL_AI.INSTALL_MODEL_FAILED'), 'error');
      this.modelInstalling.set(false);
      this.modelProgress.set(null);
      localStorage.removeItem(ConfigStateDataSource.INSTALL_FLAG);
    }
  }

  private bindInstallEvents() {
    this.eventsBound = true;

    listen<string>('ollama_install_progress', (event) => {
      if (!localStorage.getItem(ConfigStateDataSource.INSTALL_FLAG)) {
        localStorage.setItem(ConfigStateDataSource.INSTALL_FLAG, '1');
      }
      if (!this.modelInstalling()) {
        this.modelInstalling.set(true);
      }
      this.modelProgress.set(event.payload);
    }).then((un) => (this.unlistenProgress = un));

    listen<string>('ollama_install_done', async () => {
      if (!this.modelInstalling()) return;
      this.modelInstalling.set(false);
      this.modelProgress.set(null);
      localStorage.removeItem(ConfigStateDataSource.INSTALL_FLAG);
      await this.checkModelStatus();
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.CONFIG_MODAL.ENABLE_LOCAL_AI.INSTALL_MODEL_SUCCESS'), 'success');
    }).then((un) => (this.unlistenDone = un));
  }
}
