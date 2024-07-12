import { Digimon } from "./digimon.interface";

export interface PlayerData {
  name: string;
  level: number;
  exp: number;
  digimonList: Digimon[];
  bitFarmDigimonList: Digimon[];
  inTrainingDigimonList: Digimon[];
  digimonStorageList: Digimon[];
  digimonStorageCapacity: number;
  bits: number;
}
