import { Injectable } from "@angular/core";
import { PlayerData } from "@core/interfaces/player-data.interface";
import { exists, writeTextFile, mkdir, readTextFile, remove } from '@tauri-apps/plugin-fs';
import { appDataDir, BaseDirectory, join } from '@tauri-apps/api/path';

@Injectable({
  providedIn: 'root'
})
export class PlayerDataService {

  private readonly fileName = 'player-data.json';
  private readonly baseDir = BaseDirectory.AppData;
  private playerId!: string;

  set currentPlayerId(value: string) {
    this.playerId = value
  }

  get currentPlayerId() {
    return this.playerId;
  }

  private async getFilePath(): Promise<string> {
    const dir = await appDataDir();
    return join(dir, this.fileName);
  }

  private async ensureAppDataDirExists(): Promise<void> {
    const dir = await appDataDir();
    const appDirExists = await exists(dir, { baseDir: this.baseDir });

    if (!appDirExists) {
      await mkdir(dir, { recursive: true });
    }
  }

  async loadPlayerData(): Promise<PlayerData | null> {
    try {
      const filePath = await this.getFilePath();
      const fileExists = await exists(filePath, { baseDir: this.baseDir });

      if (!fileExists) {
        console.warn('Player data file not found.');
        return null;
      }

      const fileContent = await readTextFile(filePath, { baseDir: this.baseDir });
      const loadedPlayerData = JSON.parse(fileContent) as PlayerData;
      this.playerId = loadedPlayerData.id;
      return loadedPlayerData;
    } catch (err) {
      console.error('Error loading player data:', err);
      return null;
    }
  }

  async savePlayerData(playerData: PlayerData): Promise<void> {
    try {
      await this.ensureAppDataDirExists();
      const filePath = await this.getFilePath();

      await writeTextFile(filePath, JSON.stringify(playerData), { baseDir: this.baseDir });
    } catch (err) {
      console.error('Error saving player data:', err);
    }
  }

  async deletePlayerData(): Promise<void> {
    try {
      await remove(await this.getFilePath(), { baseDir: this.baseDir });
    } catch (err) {
      console.error('Error deleting player data:', err);
    }
  }
}
