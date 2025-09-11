import { inject, Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { ToastService } from '@shared/components/toast/toast.service';
import { TranslocoService } from '@jsverse/transloco';
import { applyCaps } from '@core/utils/digimon.utils';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private modifiableAttributes = ['maxHp', 'maxMp', 'atk', 'def', 'speed'] as const;

  private baseGain = 5;
  private breakthroughChance = 0.05;
  private fatigueLimit = 80;
  private fatigueGainPerTick = 8;
  private fatigueDecayPerTick = 1;

  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);

  trainDigimons(playerData: PlayerData): PlayerData {
    playerData.inTrainingDigimonList.forEach((digimon: Digimon) => {
      if (digimon.currentHp <= 0) return;

      let fatigue = digimon.fatigue ?? 0;

      if (fatigue > this.fatigueLimit) {
        fatigue = Math.max(0, fatigue - this.fatigueDecayPerTick);
        digimon.fatigue = fatigue;
        return;
      }

      fatigue = Math.min(100, fatigue + this.fatigueGainPerTick);
      digimon.fatigue = fatigue;

      const numAttributesToTrain = Math.random() < 0.5 ? 1 : 2;
      const focusedAttributes = this.getRandomAttributes(numAttributesToTrain);

      const gains: Record<string, number> = {};

      focusedAttributes.forEach((attr) => {
        const tempDigimon = { ...digimon, [attr]: 999999 };
        applyCaps(digimon.rank, tempDigimon);
        const cap = tempDigimon[attr];
        const current = digimon[attr];

        const multiplier = 1 - (current / (cap || 1));

        let gain = Math.floor(this.baseGain * multiplier);

        if (Math.random() < this.breakthroughChance && gain > 0) {
          gain += Math.floor(Math.random() * 3) + 3;
        }

        gain = Math.max(0, gain);

        if (attr === 'maxHp' || attr === 'maxMp') {
          const originalGain = gain;
          gain = Math.floor(gain * 1.2);
          if (originalGain !== gain) {
          }
        }

        if (gain > 0) {
          const newValue = Math.min(cap, current + gain);
          digimon[attr] = newValue;
          gains[attr] = gain;

        } else {
          gains[attr] = 0;
        }
      });

      applyCaps(digimon.rank, digimon);
    });

    return playerData;
  }

  private getRandomAttributes(count: number): string[] {
    const shuffled = [...this.modifiableAttributes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  addDigimonToTraining(
    playerData: PlayerData,
    currentTrainingLimit: number,
    digimon?: Digimon
  ) {
    if (!digimon || !digimon.id) return;
    if (playerData.inTrainingDigimonList.length >= currentTrainingLimit) {
      this.toastService.showToast(this.translocoService.translate('MODULES.DESKTOP.COMPONENTS.HOME_SECTION.TOAST.TRAINING_LIMIT_REACHED'), 'error');
      throw new Error('Training limit reached!');
    }
    playerData.inTrainingDigimonList.push(digimon);
    return playerData;
  }

  removeDigimonFromTraining(playerData: PlayerData, digimonId?: string) {
    if (!digimonId) return;

    const index = playerData.inTrainingDigimonList.findIndex(
      (digimon: Digimon) => digimon.id === digimonId
    );

    playerData.inTrainingDigimonList.splice(index, 1);

    return playerData;
  }
}
