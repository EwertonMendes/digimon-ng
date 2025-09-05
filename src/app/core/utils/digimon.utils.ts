import { Digimon } from '@core/interfaces/digimon.interface';

export const RANK_STAT_CAPS: Record<string, { hp: number; mp: number; atk: number; def: number; speed: number }> = {
  Fresh: { hp: 500, mp: 500, atk: 50, def: 50, speed: 50 },
  'In-Training': { hp: 1000, mp: 1000, atk: 100, def: 100, speed: 100 },
  Rookie: { hp: 2000, mp: 2000, atk: 200, def: 200, speed: 200 },
  Champion: { hp: 4000, mp: 4000, atk: 400, def: 400, speed: 400 },
  Ultimate: { hp: 6000, mp: 6000, atk: 600, def: 600, speed: 600 },
  Mega: { hp: 9999, mp: 9999, atk: 999, def: 999, speed: 999 },
};

export const RANK_DEFAULT_POTENTIAL: Record<string, number> = {
  Fresh: 10,
  'In-Training': 15,
  Rookie: 25,
  Champion: 45,
  Ultimate: 65,
  Mega: 100,
};

export function calculateGains(): { hp: number; mp: number; atk: number; def: number; speed: number } {
  return {
    hp: Math.floor(Math.random() * 5) + 4,
    mp: Math.floor(Math.random() * 5) + 4,
    atk: Math.floor(Math.random() * 4),
    def: Math.floor(Math.random() * 4),
    speed: Math.floor(Math.random() * 4),
  };
}

export function applyCaps(rank: string, stats: Partial<Digimon>): void {
  const caps = RANK_STAT_CAPS[rank] || RANK_STAT_CAPS['Mega'];
  if (stats.maxHp !== undefined) stats.maxHp = Math.min(stats.maxHp, caps.hp);
  if (stats.maxMp !== undefined) stats.maxMp = Math.min(stats.maxMp, caps.mp);
  if (stats.atk !== undefined) stats.atk = Math.min(stats.atk, caps.atk);
  if (stats.def !== undefined) stats.def = Math.min(stats.def, caps.def);
  if (stats.speed !== undefined) stats.speed = Math.min(stats.speed, caps.speed);
  if (stats.bitFarmingRate !== undefined) stats.bitFarmingRate = Math.min(stats.bitFarmingRate, 2000);
}

export function getDefaultPotential(rank: string): number {
  return RANK_DEFAULT_POTENTIAL[rank] ?? 99;
}
