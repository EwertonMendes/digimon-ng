import { inject, Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { ToastService } from '@shared/components/toast/toast.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class HospitalService {

  private readonly MAX_HOSPITAL_LEVEL = 5;

  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);

  healDigimons(playerData: PlayerData): PlayerData {

    const hospitalLevel = playerData.hospitalLevel ?? 1;

    playerData.hospitalDigimonList.forEach((digimon: Digimon) => {
      const healAmount = this.calculateHealAmount(digimon.maxHp, digimon.maxMp, hospitalLevel);
      if (digimon.currentHp < digimon.maxHp) {
        digimon.currentHp = Math.min(digimon.currentHp + healAmount.hpHealAmount, digimon.maxHp);
      }

      if (digimon.currentMp < digimon.maxMp) {
        digimon.currentMp = Math.min(digimon.currentMp + healAmount.mpHealAmount, digimon.maxMp);
      }

      if (digimon.fatigue && digimon.fatigue > 0) {
        digimon.fatigue = Math.max(0, digimon.fatigue - 10);
      }
    });

    return playerData;
  }

  fullHealHospitalDigimons(playerData: PlayerData) {
    playerData.hospitalDigimonList.forEach((digimon: Digimon) => {
      digimon.currentHp = digimon.maxHp;
      digimon.currentMp = digimon.maxMp;
      digimon.fatigue = 0;
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

  isHospitalMaxLevel(playerData: PlayerData) {
    return playerData.hospitalLevel === this.MAX_HOSPITAL_LEVEL;
  }

  levelUpHospital(playerData: PlayerData) {
    const hospitalLevel = playerData.hospitalLevel ?? 1;

    if (!this.isHospitalMaxLevel(playerData)) {
      playerData.hospitalLevel = hospitalLevel + 1;
    }

    return playerData;
  }

  getHospitalHealingRateForLevel(level: number) {
    return Math.min(level, this.MAX_HOSPITAL_LEVEL) * 0.1;
  }

  private calculateHealAmount(digimonHp: number, digimonMp: number, hospitalLevel: number): { hpHealAmount: number, mpHealAmount: number } {

    const healPercentage = this.getHospitalHealingRateForLevel(hospitalLevel);

    const hpHealAmount = Math.floor(digimonHp * healPercentage);
    const mpHealAmount = Math.floor(digimonMp * healPercentage);

    return {
      hpHealAmount,
      mpHealAmount
    }
  }
}
