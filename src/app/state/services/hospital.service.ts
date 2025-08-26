import { inject, Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { ToastService } from '@shared/components/toast/toast.service';
import { TranslocoService } from '@jsverse/transloco';

interface HealingConfig {
  hpHealRate: number;
  mpHealRate: number;
  healVariance: number;
  minHeal: number;
}

@Injectable({
  providedIn: 'root',
})
export class HospitalService {
  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);

  healDigimons(playerData: PlayerData, config: HealingConfig = {
    hpHealRate: 10,
    mpHealRate: 8,
    healVariance: 0.3,
    minHeal: 1
  }): PlayerData {
    const {
      hpHealRate,
      mpHealRate,
      healVariance,
      minHeal
    } = config;

    playerData.hospitalDigimonList.forEach((digimon: Digimon) => {
      if (digimon.currentHp < digimon.maxHp) {
        const hpHealAmount = this.calculateHealAmount(hpHealRate, healVariance, minHeal);
        digimon.currentHp = Math.min(digimon.currentHp + hpHealAmount, digimon.maxHp);
      }

      if (digimon.currentMp < digimon.maxMp) {
        const mpHealAmount = this.calculateHealAmount(mpHealRate, healVariance, minHeal);
        digimon.currentMp = Math.min(digimon.currentMp + mpHealAmount, digimon.maxMp);
      }
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
      this.toastService.showToast(
        this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.HOSPITAL_LIMIT_REACHED'),
        'error'
      );
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

    if (index !== -1) {
      playerData.hospitalDigimonList.splice(index, 1);
    }

    return playerData;
  }

  private calculateHealAmount(baseAmount: number, variance: number, minHeal: number): number {
    const varianceAmount = baseAmount * variance;
    const randomVariance = Math.random() * varianceAmount - (varianceAmount / 2);
    return Math.max(minHeal, Math.floor(baseAmount + randomVariance));
  }
}
