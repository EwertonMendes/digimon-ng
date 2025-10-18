import { inject, Injectable } from "@angular/core";
import { exists, writeTextFile, mkdir, readTextFile, remove } from "@tauri-apps/plugin-fs";
import { appDataDir, BaseDirectory, join } from "@tauri-apps/api/path";
import { PlayerConfig } from "app/core/interfaces/player-config.interface";
import { PlayerDataService } from "./player-data.service";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  private readonly baseDir = BaseDirectory.AppData;
  private readonly playerDataService = inject(PlayerDataService)

  private defaultConfig: PlayerConfig = {
    enableAudio: true,
    toggleFullscreen: false,
    language: "en",
    theme: "default",
    enableLocalAi: false,
  };

  get defaultInitialConfig() {
    return this.defaultConfig;
  }

  private async getFilePath(playerId: string): Promise<string> {
    const dir = await appDataDir();
    return join(dir, `${playerId}--configs.json`);
  }

  private async ensureAppDataDirExists(): Promise<void> {
    const dir = await appDataDir();
    const appDirExists = await exists(dir, { baseDir: this.baseDir });

    if (!appDirExists) {
      await mkdir(dir, { recursive: true });
    }
  }

  async loadConfig(customDefaultConfig: PlayerConfig | null = null): Promise<PlayerConfig> {
    try {
      const filePath = await this.getFilePath(this.playerDataService.currentPlayerId);
      const fileExists = await exists(filePath, { baseDir: this.baseDir });

      if (!fileExists) {
        console.warn("Config file not found, creating default...");
        await this.saveConfig(this.playerDataService.currentPlayerId, customDefaultConfig ?? this.defaultConfig);
        return customDefaultConfig ?? this.defaultConfig;
      }

      const fileContent = await readTextFile(filePath, { baseDir: this.baseDir });
      return JSON.parse(fileContent) as PlayerConfig;
    } catch (err) {
      console.error("Error loading config:", err);

      return customDefaultConfig ?? this.defaultConfig;
    }
  }

  async saveConfig(playerId: string, config: PlayerConfig): Promise<void> {
    try {
      await this.ensureAppDataDirExists();
      const filePath = await this.getFilePath(playerId);
      await writeTextFile(filePath, JSON.stringify(config), { baseDir: this.baseDir });
    } catch (err) {
      console.error("Error saving config:", err);
    }
  }

  async updateConfig<K extends keyof PlayerConfig>(
    key: K,
    value: PlayerConfig[K]
  ): Promise<void> {
    const config = await this.loadConfig();
    const newConfig: PlayerConfig = { ...config, [key]: value };
    await this.saveConfig(this.playerDataService.currentPlayerId, newConfig);
  }

  async deleteConfigFile(): Promise<void> {
    const filePath = await this.getFilePath(this.playerDataService.currentPlayerId);
    await remove(filePath, { baseDir: this.baseDir });
  }
}
