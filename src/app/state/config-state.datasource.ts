import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { AudioService } from 'app/services/audio.service';
import { ThemeService } from 'app/services/theme.service';
import { WindowService } from '@services/window.service';
import { ConfigService } from 'app/services/config.service';
import { PlayerDataService } from 'app/services/player-data.service';
import { PlayerConfig } from 'app/core/interfaces/player-config.interface';

@Injectable({ providedIn: 'root' })
export class ConfigStateDataSource {
  private readonly translocoService = inject(TranslocoService);
  private readonly audioService = inject(AudioService);
  private readonly themeService = inject(ThemeService);
  private readonly windowService = inject(WindowService);
  private readonly configService = inject(ConfigService);
  private readonly playerDataService = inject(PlayerDataService);

  private readonly ready = signal(false);
  private readonly state = signal<PlayerConfig>(this.configService.defaultInitialConfig);

  readonly config = computed(() => this.state());
  readonly audioEnabled = computed(() => this.state().enableAudio);
  readonly fullscreenEnabled = computed(() => this.state().toggleFullscreen);
  readonly languageCode = computed(() => this.state().language);
  readonly themeName = computed(() => this.state().theme);


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
}
