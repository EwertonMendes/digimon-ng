import { DigimonSeeds } from "@core/enums/digimon-seeds.enum";

export interface Encounter {
  seed: DigimonSeeds;
  levelRange: { min: number; max: number };
  rarity: number;
}

export interface Boss {
  seed: DigimonSeeds;
  level: number;
}

export interface Stage {
  possibleEncounters?: Encounter[];
  boss?: Boss[];
}

export interface Location {
  id: string;
  name: string;
  img: string;
  stages: Stage[];
  levelRange: { min: number; max: number };
}

export const LOCATIONS = [
  {
    id: 'login-mountain',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_LOGIN_MOUNTAIN',
    img: 'assets/environments/loginmountain.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.POYOMON, levelRange: { min: 1, max: 3 }, rarity: 0.3 },
          { seed: DigimonSeeds.TOKOMON, levelRange: { min: 1, max: 4 }, rarity: 0.3 },
          { seed: DigimonSeeds.TSUNOMON, levelRange: { min: 2, max: 5 }, rarity: 0.3 },
          { seed: DigimonSeeds.PUTTIMON, levelRange: { min: 1, max: 3 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.AGUMON, levelRange: { min: 3, max: 6 }, rarity: 0.3 },
          { seed: DigimonSeeds.GABUMON, levelRange: { min: 3, max: 6 }, rarity: 0.3 },
          { seed: DigimonSeeds.PATAMON, levelRange: { min: 4, max: 7 }, rarity: 0.2 },
          { seed: DigimonSeeds.FALCOMON, levelRange: { min: 4, max: 7 }, rarity: 0.2 },
          { seed: DigimonSeeds.GOBURIMON, levelRange: { min: 3, max: 6 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MONODRAMON, levelRange: { min: 5, max: 8 }, rarity: 0.3 },
          { seed: DigimonSeeds.HAWKMON, levelRange: { min: 5, max: 8 }, rarity: 0.3 },
          { seed: DigimonSeeds.ARMADILLOMON, levelRange: { min: 5, max: 8 }, rarity: 0.2 },
          { seed: DigimonSeeds.GOTSUMON, levelRange: { min: 6, max: 9 }, rarity: 0.2 },
          { seed: DigimonSeeds.VEEMON, levelRange: { min: 5, max: 8 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GREYMON, levelRange: { min: 7, max: 10 }, rarity: 0.4 },
          { seed: DigimonSeeds.GARURUMON, levelRange: { min: 7, max: 10 }, rarity: 0.4 },
          { seed: DigimonSeeds.ANGEMON, levelRange: { min: 8, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.AQUILAMON, levelRange: { min: 8, max: 10 }, rarity: 0.2 },
          { seed: DigimonSeeds.BIRDRAMON, levelRange: { min: 7, max: 10 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.DRIMOGEMON, level: 10 },
          { seed: DigimonSeeds.DORUGAMON, level: 10 },
        ],
      },
    ],
    levelRange: { min: 1, max: 10 },
  },
  {
    id: 'pixel-desert',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_PIXEL_DESERT',
    img: 'assets/environments/pixeldesert.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.KOROMON, levelRange: { min: 5, max: 7 }, rarity: 0.3 },
          { seed: DigimonSeeds.SUNMON, levelRange: { min: 5, max: 7 }, rarity: 0.3 },
          { seed: DigimonSeeds.CORONAMON, levelRange: { min: 6, max: 8 }, rarity: 0.2 },
          { seed: DigimonSeeds.CHICCHIMON, levelRange: { min: 5, max: 7 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.AGUMON, levelRange: { min: 7, max: 9 }, rarity: 0.3 },
          { seed: DigimonSeeds.GUILMON, levelRange: { min: 7, max: 9 }, rarity: 0.3 },
          { seed: DigimonSeeds.BLACKAGUMON, levelRange: { min: 7, max: 9 }, rarity: 0.2 },
          { seed: DigimonSeeds.BIYOMON, levelRange: { min: 8, max: 10 }, rarity: 0.2 },
          { seed: DigimonSeeds.RENAMON, levelRange: { min: 7, max: 9 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GEO_GREYMON, levelRange: { min: 9, max: 12 }, rarity: 0.4 },
          { seed: DigimonSeeds.GROWLMON, levelRange: { min: 9, max: 12 }, rarity: 0.4 },
          { seed: DigimonSeeds.TYRANNOMON, levelRange: { min: 10, max: 13 }, rarity: 0.3 },
          { seed: DigimonSeeds.APEMON, levelRange: { min: 10, max: 13 }, rarity: 0.2 },
          { seed: DigimonSeeds.SHAMAMON, levelRange: { min: 9, max: 12 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METAL_GREYMON, levelRange: { min: 11, max: 14 }, rarity: 0.4 },
          { seed: DigimonSeeds.WAR_GROWLMON, levelRange: { min: 11, max: 14 }, rarity: 0.4 },
          { seed: DigimonSeeds.SKULL_GREYMON, levelRange: { min: 12, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.SANDYANMAMON, levelRange: { min: 12, max: 15 }, rarity: 0.2 },
          { seed: DigimonSeeds.FIRAMON, levelRange: { min: 11, max: 14 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.SEASARMON, level: 15 },
          { seed: DigimonSeeds.NISEDRIMOGEMON, level: 15 },
        ],
      },
    ],
    levelRange: { min: 5, max: 15 },
  },
  {
    id: 'label-forest',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_LABEL_FOREST',
    img: 'assets/environments/labelforest.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.TANEMON, levelRange: { min: 10, max: 12 }, rarity: 0.3 },
          { seed: DigimonSeeds.BUDMON, levelRange: { min: 10, max: 12 }, rarity: 0.3 },
          { seed: DigimonSeeds.MINOMON, levelRange: { min: 10, max: 12 }, rarity: 0.2 },
          { seed: DigimonSeeds.GUMMYMON, levelRange: { min: 11, max: 13 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.PALMON, levelRange: { min: 12, max: 14 }, rarity: 0.3 },
          { seed: DigimonSeeds.LALAMON, levelRange: { min: 12, max: 14 }, rarity: 0.3 },
          { seed: DigimonSeeds.TENTOMON, levelRange: { min: 12, max: 14 }, rarity: 0.2 },
          { seed: DigimonSeeds.KUNEMON, levelRange: { min: 13, max: 15 }, rarity: 0.2 },
          { seed: DigimonSeeds.WORMMON, levelRange: { min: 12, max: 14 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.TOGEMON, levelRange: { min: 14, max: 17 }, rarity: 0.4 },
          { seed: DigimonSeeds.SUNFLOWMON, levelRange: { min: 14, max: 17 }, rarity: 0.4 },
          { seed: DigimonSeeds.KABUTERIMON, levelRange: { min: 15, max: 18 }, rarity: 0.3 },
          { seed: DigimonSeeds.DOKUNEMON, levelRange: { min: 15, max: 18 }, rarity: 0.2 },
          { seed: DigimonSeeds.ARURAUMON, levelRange: { min: 14, max: 17 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.LILLYMON, levelRange: { min: 16, max: 19 }, rarity: 0.4 },
          { seed: DigimonSeeds.BLOSSOMON, levelRange: { min: 16, max: 19 }, rarity: 0.4 },
          { seed: DigimonSeeds.MEGA_KABUTERIMON_RED, levelRange: { min: 17, max: 20 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGA_KABUTERIMON_BLUE, levelRange: { min: 17, max: 20 }, rarity: 0.2 },
          { seed: DigimonSeeds.STINGMON, levelRange: { min: 16, max: 19 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.KUWAGAMON, level: 20 },
          { seed: DigimonSeeds.OKUWAMON, level: 20 },
        ],
      },
    ],
    levelRange: { min: 10, max: 20 },
  },
  {
    id: 'register-jungle',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_REGISTER_JUNGLE',
    img: 'assets/environments/registerjungle.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GABUMON, levelRange: { min: 15, max: 17 }, rarity: 0.3 },
          { seed: DigimonSeeds.RENAMON, levelRange: { min: 15, max: 17 }, rarity: 0.3 },
          { seed: DigimonSeeds.KUMAMON, levelRange: { min: 16, max: 18 }, rarity: 0.2 },
          { seed: DigimonSeeds.MUCHOMON, levelRange: { min: 15, max: 17 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GARURUMON, levelRange: { min: 17, max: 19 }, rarity: 0.3 },
          { seed: DigimonSeeds.KYUBIMON, levelRange: { min: 17, max: 19 }, rarity: 0.3 },
          { seed: DigimonSeeds.KOKATORIMON, levelRange: { min: 17, max: 19 }, rarity: 0.2 },
          { seed: DigimonSeeds.SHAMAMON, levelRange: { min: 17, max: 19 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.WERE_GARURUMON, levelRange: { min: 19, max: 22 }, rarity: 0.4 },
          { seed: DigimonSeeds.TAOMON, levelRange: { min: 19, max: 22 }, rarity: 0.4 },
          { seed: DigimonSeeds.DINOHUMON, levelRange: { min: 20, max: 23 }, rarity: 0.3 },
          { seed: DigimonSeeds.KIWIMON, levelRange: { min: 19, max: 22 }, rarity: 0.2 },
          { seed: DigimonSeeds.FUGAMON, levelRange: { min: 19, max: 22 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METAL_GARURUMON, levelRange: { min: 21, max: 24 }, rarity: 0.4 },
          { seed: DigimonSeeds.SAKUYAMON, levelRange: { min: 21, max: 24 }, rarity: 0.4 },
          { seed: DigimonSeeds.GRAPLEOMON, levelRange: { min: 22, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.OGREMON, levelRange: { min: 21, max: 24 }, rarity: 0.2 },
          { seed: DigimonSeeds.KOTEMON, levelRange: { min: 21, max: 24 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.MACHGAOGAMON, level: 25 },
          { seed: DigimonSeeds.KYUKIMON, level: 25 },
        ],
      },
    ],
    levelRange: { min: 15, max: 25 },
  },
  {
    id: 'proxy-island',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_PROXY_ISLAND',
    img: 'assets/environments/proxyisland.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.PUKAMON, levelRange: { min: 5, max: 8 }, rarity: 0.3 },
          { seed: DigimonSeeds.SYAKOMON, levelRange: { min: 15, max: 20 }, rarity: 0.3 },
          { seed: DigimonSeeds.GOMAMON, levelRange: { min: 15, max: 20 }, rarity: 0.2 },
          { seed: DigimonSeeds.BETAMON, levelRange: { min: 15, max: 20 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SEADRAMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.GESOMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.IKKAKUMON, levelRange: { min: 20, max: 25 }, rarity: 0.2 },
          { seed: DigimonSeeds.CRABMON, levelRange: { min: 20, max: 25 }, rarity: 0.2 },
          { seed: DigimonSeeds.GIZAMON, levelRange: { min: 20, max: 25 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MEGASEADRAMON, levelRange: { min: 25, max: 30 }, rarity: 0.4 },
          { seed: DigimonSeeds.SHELLMON, levelRange: { min: 25, max: 30 }, rarity: 0.4 },
          { seed: DigimonSeeds.EBIDRAMON, levelRange: { min: 25, max: 30 }, rarity: 0.3 },
          { seed: DigimonSeeds.COELAMON, levelRange: { min: 25, max: 30 }, rarity: 0.2 },
          { seed: DigimonSeeds.DOLPHMON, levelRange: { min: 25, max: 30 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ZUDOMON, levelRange: { min: 30, max: 35 }, rarity: 0.4 },
          { seed: DigimonSeeds.SHELLMON, levelRange: { min: 1, max: 10 }, rarity: 0.1 },
          { seed: DigimonSeeds.TYLOMON, levelRange: { min: 1, max: 10 }, rarity: 0.1 },
          { seed: DigimonSeeds.SEAHOMON, levelRange: { min: 1, max: 10 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.DRAGOMON, level: 10 },
          { seed: DigimonSeeds.WHAMON, level: 10 },
          { seed: DigimonSeeds.DIVERMON, level: 10 },
          { seed: DigimonSeeds.DIVERMON, level: 10 },
        ],
      },
    ],
    levelRange: { min: 20, max: 30 },
  },
  {
    id: 'limit-valley',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_LIMIT_VALLEY',
    img: 'assets/environments/limitvalley.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DODOMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.GOTSUMON, levelRange: { min: 15, max: 25 }, rarity: 0.2 },
          { seed: DigimonSeeds.MONOCHROMON, levelRange: { min: 25, max: 35 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DORUMON, levelRange: { min: 15, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.REPTILEDRAMON, levelRange: { min: 28, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.GREYMON, levelRange: { min: 28, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.TYRANNOMON, levelRange: { min: 28, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.BLUE_GREYMON, levelRange: { min: 28, max: 35 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DORUGAMON, levelRange: { min: 30, max: 35 }, rarity: 0.4 },
          { seed: DigimonSeeds.GEO_GREYMON, levelRange: { min: 30, max: 35 }, rarity: 0.4 },
          { seed: DigimonSeeds.DKTYRANNOMON, levelRange: { min: 31, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.SANDYANMAMON, levelRange: { min: 30, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.NISEDRIMOGEMON, levelRange: { min: 30, max: 35 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DORUGREYMON, levelRange: { min: 32, max: 35 }, rarity: 0.4 },
          { seed: DigimonSeeds.RIZE_GREYMON, levelRange: { min: 32, max: 35 }, rarity: 0.4 },
          { seed: DigimonSeeds.TRICERAMON, levelRange: { min: 33, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGADRAMON, levelRange: { min: 32, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.SEASARMON, levelRange: { min: 32, max: 35 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.SHINE_GREYMON, level: 20 },
          { seed: DigimonSeeds.ZEKE_GREYMON, level: 15 },
        ],
      },
    ],
    levelRange: { min: 25, max: 35 },
  },
  {
    id: 'loop-swamp',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_LOOP_SWAMP',
    img: 'assets/environments/loopswamp.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MOCHIMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.OTAMAMON, levelRange: { min: 15, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.GEKOMON, levelRange: { min: 25, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.NUMEMON, levelRange: { min: 25, max: 35 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.COELAMON, levelRange: { min: 30, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.GESOMON, levelRange: { min: 30, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.SHELLMON, levelRange: { min: 30, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.RAREMON, levelRange: { min: 30, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.SUKAMON, levelRange: { min: 30, max: 35 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SEADRAMON, levelRange: { min: 35, max: 40 }, rarity: 0.4 },
          { seed: DigimonSeeds.EBIDRAMON, levelRange: { min: 35, max: 40 }, rarity: 0.4 },
          { seed: DigimonSeeds.DOLPHMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.GAWAPPAMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.OCTOMON, levelRange: { min: 35, max: 40 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SHOGUNGEKOMON, levelRange: { min: 36, max: 40 }, rarity: 0.4 },
          { seed: DigimonSeeds.ZUDOMON, levelRange: { min: 36, max: 40 }, rarity: 0.4 },
          { seed: DigimonSeeds.BLOSSOMON, levelRange: { min: 37, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.WEEDMON, levelRange: { min: 36, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.YANMAMON, levelRange: { min: 36, max: 40 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.LILLYMON, level: 35 },
          { seed: DigimonSeeds.MACHINEDRAMON, level: 38 },
        ],
      },
    ],
    levelRange: { min: 30, max: 40 },
  },
  {
    id: 'access-glacier',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_ACCESS_GLACIER',
    img: 'assets/environments/accessglacier.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MOJYAMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.FRIGIMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.ICEMON, levelRange: { min: 36, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.TSUCHIDARUMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GARURUMON, levelRange: { min: 37, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.HYOGAMON, levelRange: { min: 37, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.ICEDEVIMON, levelRange: { min: 38, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.GRIZZMON, levelRange: { min: 37, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.SNOWGOBURIMON, levelRange: { min: 37, max: 40 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.WERE_GARURUMON, levelRange: { min: 39, max: 42 }, rarity: 0.4 },
          { seed: DigimonSeeds.ZUDOMON, levelRange: { min: 39, max: 42 }, rarity: 0.4 },
          { seed: DigimonSeeds.MAMMOTHMON, levelRange: { min: 40, max: 43 }, rarity: 0.3 },
          { seed: DigimonSeeds.CYBERDRAMON, levelRange: { min: 39, max: 42 }, rarity: 0.2 },
          { seed: DigimonSeeds.MAMETYRAMON, levelRange: { min: 39, max: 42 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METAL_GARURUMON, levelRange: { min: 41, max: 44 }, rarity: 0.4 },
          { seed: DigimonSeeds.VIKEMON, levelRange: { min: 41, max: 44 }, rarity: 0.4 },
          { seed: DigimonSeeds.METALTYRANNOMON, levelRange: { min: 42, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.DARKDRAMON, levelRange: { min: 41, max: 44 }, rarity: 0.2 },
          { seed: DigimonSeeds.SNOWAGUMON, levelRange: { min: 18, max: 25 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BLACK_WERE_GARURUMON, levelRange: { min: 43, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.ICEDEVIMON, levelRange: { min: 35, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.HYOGAMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.MOJYAMON, levelRange: { min: 35, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.METALTYRANNOMON, level: 20 },
          { seed: DigimonSeeds.MAMMOTHMON, level: 20 },
        ],
      },
    ],
    levelRange: { min: 35, max: 45 },
  },
  {
    id: 'sunken-tunnel',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_SUNKEN_TUNNEL',
    img: 'assets/environments/anglertunnel.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.RAREMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.HOOKMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.SUKAMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.KOGAMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MEKANORIMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.GUARDROMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.STARMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.ETEMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.ANDROMON, levelRange: { min: 35, max: 40 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METALMAMEMON, levelRange: { min: 40, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.PANDAMON, levelRange: { min: 40, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.HIANDROMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.METALETEMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.GARBAGEMON, levelRange: { min: 40, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 45, max: 50 }, rarity: 0.4 },
          { seed: DigimonSeeds.CANNONDRAMON, levelRange: { min: 45, max: 50 }, rarity: 0.4 },
          { seed: DigimonSeeds.METALTYRANNOMON, levelRange: { min: 45, max: 50 }, rarity: 0.3 },
          { seed: DigimonSeeds.LAMPMON, levelRange: { min: 45, max: 50 }, rarity: 0.2 },
          { seed: DigimonSeeds.GARBAGEMON, levelRange: { min: 45, max: 50 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GIROMON, levelRange: { min: 45, max: 50 }, rarity: 0.3 },
          { seed: DigimonSeeds.BIG_MAMEMON, levelRange: { min: 45, max: 50 }, rarity: 0.3 },
          { seed: DigimonSeeds.KENKIMON, levelRange: { min: 45, max: 50 }, rarity: 0.2 },
          { seed: DigimonSeeds.PRINCEMAMEMON, levelRange: { min: 45, max: 50 }, rarity: 0.2 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.OMEKAMON, level: 50 },
          { seed: DigimonSeeds.METALMAMEMON, level: 45 },
          { seed: DigimonSeeds.HIANDROMON, level: 45 },
        ],
      },
    ],
    levelRange: { min: 40, max: 50 },
  },
  {
    id: 'magnet-mine',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_MAGNET_MINE',
    img: 'assets/environments/magnetmine.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.HAGURUMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.SOLARMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEKANORIMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.GUARDROMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.TANKMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.STARMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.KURISARIMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.GIROMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.ANDROMON, levelRange: { min: 35, max: 40 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METAL_GREYMON, levelRange: { min: 40, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.SKULL_GREYMON, levelRange: { min: 40, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.METALMAMEMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.VADEMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.HIANDROMON, levelRange: { min: 40, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METALTYRANNOMON, levelRange: { min: 45, max: 50 }, rarity: 0.4 },
          { seed: DigimonSeeds.LAMPMON, levelRange: { min: 45, max: 50 }, rarity: 0.4 },
          { seed: DigimonSeeds.METALETEMON, levelRange: { min: 45, max: 50 }, rarity: 0.3 },
          { seed: DigimonSeeds.CANNONDRAMON, levelRange: { min: 45, max: 50 }, rarity: 0.2 },
          { seed: DigimonSeeds.BIG_MAMEMON, levelRange: { min: 45, max: 50 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METAL_GREYMON, levelRange: { min: 45, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.BLUE_METAL_GREYMON, levelRange: { min: 45, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.SKULL_GREYMON, levelRange: { min: 45, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.BLACKRAPIDMON, levelRange: { min: 45, max: 45 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.WAR_GREYMON, levelRange: { min: 50, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.GIGADRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGADRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.ROCKCHESSMON, levelRange: { min: 45, max: 45 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METEORMON, levelRange: { min: 45, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.ETEMON, levelRange: { min: 45, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.ANDROMON, levelRange: { min: 45, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.METALMAMEMON, levelRange: { min: 45, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.HIANDROMON, levelRange: { min: 45, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.KENKIMON, levelRange: { min: 45, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.CANNONDRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.HIANDROMON, level: 45 },
          { seed: DigimonSeeds.MACHINEDRAMON, level: 55 },
          { seed: DigimonSeeds.METALETEMON, level: 45 },
          { seed: DigimonSeeds.CANNONDRAMON, level: 55 },
        ],
      },
    ],
    levelRange: { min: 45, max: 55 },
  },
  {
    id: 'packet-coast',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_PACKET_COAST',
    img: 'assets/environments/packetcoast.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.PUKUMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.GOMAMON, levelRange: { min: 15, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.SYAKOMON, levelRange: { min: 15, max: 25 }, rarity: 0.2 },
          { seed: DigimonSeeds.BETAMON, levelRange: { min: 15, max: 25 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SEADRAMON, levelRange: { min: 25, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.GESOMON, levelRange: { min: 25, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.IKKAKUMON, levelRange: { min: 25, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.CRABMON, levelRange: { min: 25, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.GIZAMON, levelRange: { min: 25, max: 35 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MEGASEADRAMON, levelRange: { min: 35, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.SHELLMON, levelRange: { min: 35, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.EBIDRAMON, levelRange: { min: 35, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.COELAMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.DOLPHMON, levelRange: { min: 35, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METALSEADRAMON, levelRange: { min: 45, max: 55 }, rarity: 0.4 },
          { seed: DigimonSeeds.ZUDOMON, levelRange: { min: 45, max: 55 }, rarity: 0.4 },
          { seed: DigimonSeeds.WHAMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.DRAGOMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.DIVERMON, levelRange: { min: 45, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MARINE_DEVIMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.MARINEANGEMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.GIGASEADRAMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.JUMBOGAMEMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.NEPTUNMON, levelRange: { min: 50, max: 60 }, rarity: 0.3 },
          { seed: DigimonSeeds.GIGADRAMON, levelRange: { min: 50, max: 60 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGADRAMON, levelRange: { min: 50, max: 60 }, rarity: 0.2 },
          { seed: DigimonSeeds.SHINE_GREYMON, levelRange: { min: 50, max: 60 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.JUMBOGAMEMON, level: 60 },
          { seed: DigimonSeeds.NEPTUNMON, level: 60 },
          { seed: DigimonSeeds.MARINEANGEMON, level: 60 },
        ],
      },
    ],
    levelRange: { min: 50, max: 60 },
  },
  {
    id: 'pallete-amazon',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_PALLETE_AMAZON',
    img: 'assets/environments/paletteamazon.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.TANEMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.BUDMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.MINOMON, levelRange: { min: 10, max: 15 }, rarity: 0.2 },
          { seed: DigimonSeeds.GUMMYMON, levelRange: { min: 10, max: 15 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.PALMON, levelRange: { min: 15, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.LALAMON, levelRange: { min: 15, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.TENTOMON, levelRange: { min: 15, max: 25 }, rarity: 0.2 },
          { seed: DigimonSeeds.KUNEMON, levelRange: { min: 15, max: 25 }, rarity: 0.2 },
          { seed: DigimonSeeds.WORMMON, levelRange: { min: 15, max: 25 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.TOGEMON, levelRange: { min: 25, max: 35 }, rarity: 0.4 },
          { seed: DigimonSeeds.SUNFLOWMON, levelRange: { min: 25, max: 35 }, rarity: 0.4 },
          { seed: DigimonSeeds.KABUTERIMON, levelRange: { min: 25, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.DOKUNEMON, levelRange: { min: 25, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.ARURAUMON, levelRange: { min: 25, max: 35 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.LILLYMON, levelRange: { min: 35, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.BLOSSOMON, levelRange: { min: 35, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.MEGA_KABUTERIMON_RED, levelRange: { min: 35, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGA_KABUTERIMON_BLUE, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.STINGMON, levelRange: { min: 35, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.CHERRYMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.PARROTMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.DERAMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.LILAMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.ARUKENIMON, levelRange: { min: 45, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GRAPLEOMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.SINDURAMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.DINOBEEMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.ALLOMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.OKUWAMON, levelRange: { min: 45, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.HERCULES_KABUTERIMON, levelRange: { min: 55, max: 65 }, rarity: 0.3 },
          { seed: DigimonSeeds.ROSEMON, levelRange: { min: 55, max: 65 }, rarity: 0.3 },
          { seed: DigimonSeeds.LOTOSMON, levelRange: { min: 55, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 55, max: 65 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.HERCULES_KABUTERIMON, level: 65 },
          { seed: DigimonSeeds.GRANKUWAGAMON, level: 65 },
          { seed: DigimonSeeds.DINOBEEMON, level: 55 },
        ],
      },
    ],
    levelRange: { min: 55, max: 65 },
  },
  {
    id: 'thriller-ruins',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_THRILLER_RUINS',
    img: 'assets/environments/thrillerruins.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DEVIDRAMON, levelRange: { min: 35, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.ICEDEVIMON, levelRange: { min: 35, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.DEVIMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.VILEMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MYOTISMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.PHANTOMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.BAKEMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.LADYDEVIMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.MAMMOTHMON, levelRange: { min: 45, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.VENOMMYOTISMON, levelRange: { min: 55, max: 65 }, rarity: 0.4 },
          { seed: DigimonSeeds.LILITHMON, levelRange: { min: 55, max: 65 }, rarity: 0.4 },
          { seed: DigimonSeeds.ANUBISMON, levelRange: { min: 55, max: 65 }, rarity: 0.3 },
          { seed: DigimonSeeds.GHOULMON, levelRange: { min: 55, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.BOLTMON, levelRange: { min: 55, max: 65 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BEELZEMON, levelRange: { min: 65, max: 75 }, rarity: 0.4 },
          { seed: DigimonSeeds.CHAOS_GALLANTMON, levelRange: { min: 65, max: 75 }, rarity: 0.4 },
          { seed: DigimonSeeds.DARKDRAMON, levelRange: { min: 65, max: 75 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 65, max: 75 }, rarity: 0.2 },
          { seed: DigimonSeeds.KUZUHAMON, levelRange: { min: 65, max: 75 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BLACK_WAR_GREYMON, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.BLACK_WERE_GARURUMON, levelRange: { min: 45, max: 65 }, rarity: 0.3 },
          { seed: DigimonSeeds.INFERMON, levelRange: { min: 45, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.ARGOMON_ULTIMATE, levelRange: { min: 45, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.DIGITAMAMON, levelRange: { min: 45, max: 65 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 65, max: 70 }, rarity: 0.3 },
          { seed: DigimonSeeds.SHINE_GREYMON_RUIN_MODE, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.GULFMON, levelRange: { min: 70, max: 80 }, rarity: 0.2 },
          { seed: DigimonSeeds.GHOULMON, levelRange: { min: 65, max: 70 }, rarity: 0.2 },
          { seed: DigimonSeeds.CHERUBIMON_EVIL, levelRange: { min: 65, max: 70 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GALLANTMON, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.ZEKE_GREYMON, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.VENOMMYOTISMON, levelRange: { min: 55, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.METALSEADRAMON, levelRange: { min: 65, max: 70 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DEVITAMAMON, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.LILITHMON, levelRange: { min: 65, max: 70 }, rarity: 0.3 },
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 65, max: 70 }, rarity: 0.2 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 65, max: 70 }, rarity: 0.2 },
          { seed: DigimonSeeds.CHAOS_GALLANTMON, levelRange: { min: 70, max: 80 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.GULFMON, level: 70 },
          { seed: DigimonSeeds.SHINE_GREYMON_RUIN_MODE, level: 70 },
          { seed: DigimonSeeds.CHERUBIMON_EVIL, level: 65 },
          { seed: DigimonSeeds.LILITHMON, level: 65 },
        ],
      },
    ],
    levelRange: { min: 70, max: 80 },
  },
  {
    id: 'risk-factory',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_RISK_FACTORY',
    img: 'assets/environments/riskfactory.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.HAGURUMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEKANORIMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.GUARDROMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.TANKMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ANDROMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.GIROMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.METALMAMEMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.STARMON, levelRange: { min: 35, max: 40 }, rarity: 0.2 },
          { seed: DigimonSeeds.KURISARIMON, levelRange: { min: 35, max: 40 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.HIANDROMON, levelRange: { min: 40, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.METALETEMON, levelRange: { min: 40, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.CANNONDRAMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.BIG_MAMEMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.KENKIMON, levelRange: { min: 40, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 45, max: 50 }, rarity: 0.4 },
          { seed: DigimonSeeds.METALTYRANNOMON, levelRange: { min: 45, max: 50 }, rarity: 0.4 },
          { seed: DigimonSeeds.VADEMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.LAMPMON, levelRange: { min: 45, max: 50 }, rarity: 0.2 },
          { seed: DigimonSeeds.GARBAGEMON, levelRange: { min: 45, max: 50 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METAL_GREYMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.BLUE_METAL_GREYMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.SKULL_GREYMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.BLACKRAPIDMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.WAR_GREYMON, levelRange: { min: 50, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.GIGADRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGADRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.ROCKCHESSMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METEORMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.ETEMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.ANDROMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.METALMAMEMON, levelRange: { min: 40, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.HIANDROMON, levelRange: { min: 40, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.KENKIMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.HIANDROMON, level: 45 },
          { seed: DigimonSeeds.MACHINEDRAMON, level: 55 },
          { seed: DigimonSeeds.METALETEMON, level: 45 },
          { seed: DigimonSeeds.CANNONDRAMON, level: 55 },
        ],
      },
    ],
    levelRange: { min: 65, max: 75 },
  },
  {
    id: 'shadow-abyss',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_SHADOW_ABYSS',
    img: 'assets/environments/shadowabyss.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DEVIDRAMON, levelRange: { min: 35, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.ICEDEVIMON, levelRange: { min: 35, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.DEVIMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.VILEMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MYOTISMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.PHANTOMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.BAKEMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.LADYDEVIMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.MAMMOTHMON, levelRange: { min: 45, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.VENOMMYOTISMON, levelRange: { min: 55, max: 65 }, rarity: 0.4 },
          { seed: DigimonSeeds.LILITHMON, levelRange: { min: 55, max: 65 }, rarity: 0.4 },
          { seed: DigimonSeeds.ANUBISMON, levelRange: { min: 55, max: 65 }, rarity: 0.3 },
          { seed: DigimonSeeds.GHOULMON, levelRange: { min: 55, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.BOLTMON, levelRange: { min: 55, max: 65 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BEELZEMON, levelRange: { min: 65, max: 75 }, rarity: 0.4 },
          { seed: DigimonSeeds.CHAOS_GALLANTMON, levelRange: { min: 65, max: 75 }, rarity: 0.4 },
          { seed: DigimonSeeds.DARKDRAMON, levelRange: { min: 65, max: 75 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 65, max: 75 }, rarity: 0.2 },
          { seed: DigimonSeeds.KUZUHAMON, levelRange: { min: 65, max: 75 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BLACK_WAR_GREYMON, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.BLACK_WERE_GARURUMON, levelRange: { min: 45, max: 65 }, rarity: 0.3 },
          { seed: DigimonSeeds.INFERMON, levelRange: { min: 45, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.ARGOMON_ULTIMATE, levelRange: { min: 45, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.DIGITAMAMON, levelRange: { min: 45, max: 65 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 65, max: 70 }, rarity: 0.3 },
          { seed: DigimonSeeds.SHINE_GREYMON_RUIN_MODE, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.GHOULMON, levelRange: { min: 65, max: 70 }, rarity: 0.2 },
          { seed: DigimonSeeds.CHERUBIMON_EVIL, levelRange: { min: 65, max: 70 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GALLANTMON, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.ZEKE_GREYMON, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.VENOMMYOTISMON, levelRange: { min: 55, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.METALSEADRAMON, levelRange: { min: 65, max: 70 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DEVITAMAMON, levelRange: { min: 70, max: 80 }, rarity: 0.3 },
          { seed: DigimonSeeds.LILITHMON, levelRange: { min: 65, max: 70 }, rarity: 0.3 },
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 65, max: 70 }, rarity: 0.2 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 65, max: 70 }, rarity: 0.2 },
          { seed: DigimonSeeds.CHAOS_GALLANTMON, levelRange: { min: 70, max: 80 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.GULFMON, level: 70 },
          { seed: DigimonSeeds.SHINE_GREYMON_RUIN_MODE, level: 70 },
          { seed: DigimonSeeds.CHERUBIMON_EVIL, level: 65 },
          { seed: DigimonSeeds.LILITHMON, level: 65 },
        ],
      },
    ],
    levelRange: { min: 70, max: 80 },
  },
  {
    id: 'wizard-temple',
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_WIZARD_TEMPLE',
    img: 'assets/environments/wizardtemple.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SALAMON, levelRange: { min: 15, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.KUDAMON, levelRange: { min: 15, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.LUNAMON, levelRange: { min: 15, max: 25 }, rarity: 0.2 },
          { seed: DigimonSeeds.LUCEMON_CHAOS_MODE, levelRange: { min: 15, max: 25 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GATOMON, levelRange: { min: 25, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.REPPAMON, levelRange: { min: 25, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.LEKISMON, levelRange: { min: 25, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.WIZARDMON, levelRange: { min: 25, max: 35 }, rarity: 0.2 },
          { seed: DigimonSeeds.SORCERYMON, levelRange: { min: 25, max: 35 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ANGEWOMON, levelRange: { min: 35, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.TYILINMON, levelRange: { min: 35, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.CRESCEMON, levelRange: { min: 35, max: 45 }, rarity: 0.3 },
          { seed: DigimonSeeds.MYOTISMON, levelRange: { min: 35, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.PHANTOMON, levelRange: { min: 35, max: 45 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.OPHANIMON, levelRange: { min: 45, max: 55 }, rarity: 0.4 },
          { seed: DigimonSeeds.CHERUBIMON_GOOD, levelRange: { min: 45, max: 55 }, rarity: 0.4 },
          { seed: DigimonSeeds.SERAPHIMON, levelRange: { min: 45, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.DIANAMON, levelRange: { min: 45, max: 55 }, rarity: 0.2 },
          { seed: DigimonSeeds.KUZUHAMON, levelRange: { min: 45, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.HOLYDRAMON, levelRange: { min: 55, max: 65 }, rarity: 0.3 },
          { seed: DigimonSeeds.GOLDRAMON, levelRange: { min: 55, max: 65 }, rarity: 0.3 },
          { seed: DigimonSeeds.ALPHAMON, levelRange: { min: 55, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.PHOENIXMON, levelRange: { min: 55, max: 65 }, rarity: 0.2 },
          { seed: DigimonSeeds.ROSEMON, levelRange: { min: 55, max: 65 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.IMPERIALDRAMON_DRAGON_MODE, levelRange: { min: 65, max: 75 }, rarity: 0.3 },
          { seed: DigimonSeeds.OMNIMON, levelRange: { min: 65, max: 75 }, rarity: 0.3 },
          { seed: DigimonSeeds.BEELZEMON, levelRange: { min: 65, max: 75 }, rarity: 0.2 },
          { seed: DigimonSeeds.GALLANTMON, levelRange: { min: 65, max: 75 }, rarity: 0.2 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 65, max: 75 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SUSANOOMON, levelRange: { min: 75, max: 85 }, rarity: 0.3 },
          { seed: DigimonSeeds.CHAOSMON, levelRange: { min: 75, max: 85 }, rarity: 0.3 },
          { seed: DigimonSeeds.LUCEMON_CHAOS_MODE, levelRange: { min: 75, max: 85 }, rarity: 0.2 },
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 65, max: 75 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BLACK_WAR_GREYMON, levelRange: { min: 80, max: 90 }, rarity: 0.3 },
          { seed: DigimonSeeds.WAR_GREYMON, levelRange: { min: 80, max: 90 }, rarity: 0.3 },
          { seed: DigimonSeeds.SHINE_GREYMON, levelRange: { min: 80, max: 90 }, rarity: 0.2 },
          { seed: DigimonSeeds.ZEKE_GREYMON, levelRange: { min: 80, max: 90 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ALPHAMON, levelRange: { min: 85, max: 95 }, rarity: 0.3 },
          { seed: DigimonSeeds.OMNIMON, levelRange: { min: 85, max: 95 }, rarity: 0.3 },
          { seed: DigimonSeeds.IMPERIALDRAMON_PALADIN_MODE, levelRange: { min: 85, max: 95 }, rarity: 0.2 },
          { seed: DigimonSeeds.SUSANOOMON, levelRange: { min: 85, max: 95 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BEELZEMON, levelRange: { min: 90, max: 100 }, rarity: 0.3 },
          { seed: DigimonSeeds.GALLANTMON, levelRange: { min: 90, max: 100 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 90, max: 100 }, rarity: 0.2 },
          { seed: DigimonSeeds.KUZUHAMON, levelRange: { min: 90, max: 100 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.OPHANIMON, level: 100 },
          { seed: DigimonSeeds.OMNIMON, level: 100 },
          { seed: DigimonSeeds.SERAPHIMON, level: 100 },
          { seed: DigimonSeeds.CHERUBIMON_GOOD, level: 100 },
        ],
      },
    ],
    levelRange: { min: 80, max: 100 },
  },
];
