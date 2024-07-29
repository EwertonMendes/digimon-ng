import { Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';

@Injectable({
  providedIn: 'root',
})
export class HospitalService {

  healDigimons(playerData: PlayerData) {
    playerData.hospitalDigimonList.forEach((digimon: Digimon) => {
      if(digimon.currentHp < digimon.maxHp) digimon.currentHp += Math.floor(Math.random() * 10);
      if(digimon.currentHp > digimon.maxHp) digimon.currentHp = digimon.maxHp;

      if(digimon.currentMp < digimon.maxMp) digimon.currentMp += Math.floor(Math.random() * 10);
      if(digimon.currentMp > digimon.maxMp) digimon.currentMp = digimon.maxMp;
    });

    return playerData;
  }

  addDigimonToHospital(playerData: PlayerData, digimon?: Digimon) {
    if (!digimon || !digimon.id) return;
    playerData.hospitalDigimonList.push(digimon);
    return playerData;
  }

  removeDigimonFromHospital(playerData: PlayerData, digimonId?: string) {
    if (!digimonId) return;
    const digimon = playerData.hospitalDigimonList.find(
      (digimon: Digimon) => digimon.id === digimonId
    );

    const index = playerData.hospitalDigimonList.findIndex(
      (digimon: Digimon) => digimon.id === digimonId
    );

    playerData.hospitalDigimonList.splice(index, 1);

    playerData.hospitalDigimonList.filter((digimon: Digimon) => digimon.id !== digimonId);
    return {
      playerData,
      digimon,
    };
  }
}
