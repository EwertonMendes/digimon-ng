import { Digimon } from "./digimon.interface";

export interface PlayerData {
  id: string;
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
  digiData: Record<string, DigiData>;
  [key: string]: any;
}

interface DigiData {
  amount: number;
  obtained: boolean;
}
