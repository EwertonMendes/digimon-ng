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
  hospitalLevel: number;
  digimonStorageList: Digimon[];
  digimonStorageCapacity: number;
  bits: number;
  digiData: Record<string, DigiData>;
  teams?: Team[];
  [key: string]: any;
}

export interface DigiData {
  amount: number;
  obtained: boolean;
}

export interface Team {
  name: string;
  members: string[];
}
