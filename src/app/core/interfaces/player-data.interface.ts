import { Digimon } from "./digimon.interface";

export interface PlayerData {
  name: string;
  level: number;
  exp: number;
  totalExp: number;
  digimonList: Digimon[];
  bitFarmDigimonList: Digimon[];
  inTrainingDigimonList: Digimon[];
  hospitalDigimonList: Digimon[];
  digimonStorageList: Digimon[];
  digimonStorageCapacity: number;
  bits: number;
  [key: string]: any;
}
