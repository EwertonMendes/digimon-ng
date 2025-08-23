import { inject, Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { ToastService } from '@shared/components/toast/toast.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class HospitalService {
  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);

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

  fullHealHospitalDigimons(playerData: PlayerData) {
    playerData.hospitalDigimonList.forEach((digimon: Digimon) => {
      digimon.currentHp = digimon.maxHp;
      digimon.currentMp = digimon.maxMp;
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
      this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.HOSPITAL_LIMIT_REACHED'), 'error');
      throw new Error('Hospital limit reached!');
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
