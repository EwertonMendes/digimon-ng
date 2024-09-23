export interface Digimon {
  id?: string;
  seed: string;
  name: string;
  nickName?: string;
  birthDate?: Date;
  img: string;
  rank: string;
  species: string;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  atk: number;
  def: number;
  speed: number;
  exp?: number;
  totalExp?: number;
  level: number;
  bitFarmingRate?: number;
  digiEvolutionSeedList: string[];
  degenerateSeedList: string[];
  currentEvolutionRoute?: Array<{ seed: string; rank: string }>;
  [key: string]: any;
}

export interface BaseDigimon {
  seed: string;
  name: string;
  img: string;
  rank: string;
  species: string;
  hp: number;
  mp: number;
  atk: number;
  def: number;
  speed: number;
  bitFarmingRate: number;
  digiEvolutionSeedList: string[];
  degenerateSeedList: string[];
  evolutionRequirements?: Array<{ type: string; value: any }>;
  [key: string]: any;
}
