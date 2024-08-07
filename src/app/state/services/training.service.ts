import { inject, Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';
import { ToastService } from '../../shared/components/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  modifiableAttributes = ['maxHp', 'maxMp', 'atk', 'def'];
  oneMinuteInterval = 60000;
  toastService = inject(ToastService);

  trainDigimons(playerData: PlayerData) {
    playerData.inTrainingDigimonList.forEach((digimon: Digimon) => {
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
      this.toastService.showToast('Training limit reached!', 'error');
      throw Error('Training limit reached!');
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
