import { inject, Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';
import { ToastService } from '../../shared/components/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class HospitalService {
  toastService = inject(ToastService);

  healDigimons(playerData: PlayerData) {
    playerData.hospitalDigimonList.forEach((digimon: Digimon) => {
      if (digimon.currentHp < digimon.maxHp)
        digimon.currentHp += Math.floor(Math.random() * 10);
      if (digimon.currentHp > digimon.maxHp) digimon.currentHp = digimon.maxHp;

      if (digimon.currentMp < digimon.maxMp)
        digimon.currentMp += Math.floor(Math.random() * 10);
      if (digimon.currentMp > digimon.maxMp) digimon.currentMp = digimon.maxMp;
    });

    return playerData;
  }

  addDigimonToHospital(
    playerData: PlayerData,
    currentHospitalLimit: number,
    digimon?: Digimon
  ) {
    if (!digimon || !digimon.id) return;

    if (playerData.hospitalDigimonList.length >= currentHospitalLimit) {
      this.toastService.showToast('Hospital limit reached!', 'error');
      throw Error('Hospital limit reached!');
    }

    playerData.hospitalDigimonList.push(digimon);
    return playerData;
  }

  removeDigimonFromHospital(playerData: PlayerData, digimonId?: string) {
    if (!digimonId) return;

    const index = playerData.hospitalDigimonList.findIndex(
      (digimon: Digimon) => digimon.id === digimonId
    );

    playerData.hospitalDigimonList.splice(index, 1);

    return playerData;
  }
}
