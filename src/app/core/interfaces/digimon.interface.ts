export interface Digimon {
  id?: string;
  seed: string
  name: string;
  nickName?: string;
  img: string;
  rank: string;
  hp: number;
  mp: number;
  atk: number;
  def: number;
  exp?: number;
  totalExp?: number;
  level: number;
  bitFarmingRate?: number;
  digiEvolutionSeedList: string[];
  degenerateSeedList: string[];
}
