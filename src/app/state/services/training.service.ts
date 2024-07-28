import { Injectable } from '@angular/core';
import { Digimon } from '../../core/interfaces/digimon.interface';
import { PlayerData } from '../../core/interfaces/player-data.interface';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  modifiableAttributes = ['maxHp', 'maxMp', 'atk', 'def'];
  oneMinuteInterval = 60000;

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

  addDigimonToTraining(playerData: PlayerData, digimon?: Digimon) {
    if (!digimon || !digimon.id) return;
    playerData.inTrainingDigimonList.push(digimon);
    return playerData;
  }

  removeDigimonFromTraining(playerData: PlayerData, digimonId?: string) {
    if (!digimonId) return;
    const digimon = playerData.inTrainingDigimonList.find(
      (digimon: Digimon) => digimon.id === digimonId
    );

    const index = playerData.inTrainingDigimonList.findIndex(
      (digimon: Digimon) => digimon.id === digimonId
    );

    playerData.inTrainingDigimonList.splice(index, 1);

    return {
      playerData,
      digimon,
    };
  }
}
