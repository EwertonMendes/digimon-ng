import { Injectable } from "@angular/core";
import { PlayerData } from "../core/interfaces/player-data.interface";

@Injectable({
  providedIn: 'root'
})
export class PlayerDataService {

  async getPlayerData(): Promise<PlayerData> {
    return await fetch('database/player-data.json').then(res => res.json());;
  }
}
