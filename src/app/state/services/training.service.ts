import { inject, Injectable } from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { PlayerData } from '@core/interfaces/player-data.interface';
import { ToastService } from '@shared/components/toast/toast.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  modifiableAttributes = ['maxHp', 'maxMp', 'atk', 'def'];
  oneMinuteInterval = 60000;
  toastService = inject(ToastService);
  translocoService = inject(TranslocoService);

  trainDigimons(playerData: PlayerData) {
    playerData.inTrainingDigimonList.forEach((digimon: Digimon) => {
      if(digimon.currentHp <= 0) return;
      const randomAttributeToTrainIndex = Math.floor(
        Math.random() * this.modifiableAttributes.length
      );
      const randomAttributeToTrain =
        this.modifiableAttributes[randomAttributeToTrainIndex];
      let randomAttributeTrainingValue = Math.floor(Math.random() * 10);

      if (
        randomAttributeToTrain === 'maxHp' ||
        randomAttributeToTrain === 'maxMp'
      )
        randomAttributeTrainingValue += 10;

      digimon[randomAttributeToTrain] += randomAttributeTrainingValue;
    });

    return playerData;
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
