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
  name: string;
  img: string;
  stages: Stage[];
  levelRange: { min: number; max: number };
}

export const LOCATIONS = [
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_LOGIN_MOUNTAIN',
    img: 'assets/environments/loginmountain.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BOTAMON, levelRange: { min: 1, max: 5 }, rarity: 0.1 },
          { seed: DigimonSeeds.KOROMON, levelRange: { min: 1, max: 6 }, rarity: 0.1 },
          { seed: DigimonSeeds.PITCHMON, levelRange: { min: 1, max: 5 }, rarity: 0.1 },
          { seed: DigimonSeeds.PUTTIMON, levelRange: { min: 1, max: 5 }, rarity: 0.1 },
          { seed: DigimonSeeds.MINOMON, levelRange: { min: 1, max: 6 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.POYOMON, levelRange: { min: 1, max: 5 }, rarity: 0.1 },
          { seed: DigimonSeeds.TOKOMON, levelRange: { min: 2, max: 6 }, rarity: 0.1 },
          { seed: DigimonSeeds.TSUNOMON, levelRange: { min: 3, max: 7 }, rarity: 0.1 },
          { seed: DigimonSeeds.KAPURIMON, levelRange: { min: 3, max: 7 }, rarity: 0.1 },
          { seed: DigimonSeeds.FALCOMON, levelRange: { min: 4, max: 10 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GOBURIMON, levelRange: { min: 4, max: 8 }, rarity: 0.3 },
          { seed: DigimonSeeds.AGUMON, levelRange: { min: 5, max: 8 }, rarity: 0.3 },
          { seed: DigimonSeeds.PATAMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.MONODRAMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.HAWKMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.VEEMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.GOTSUMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.ARMADILLOMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.GREYMON, levelRange: { min: 6, max: 10 }, rarity: 0.4 },
          { seed: DigimonSeeds.AQUILAMON, levelRange: { min: 6, max: 10 }, rarity: 0.5 },
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
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_PIXEL_DESERT',
    img: 'assets/environments/pixeldesert.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.KOROMON, levelRange: { min: 5, max: 8 }, rarity: 0.1 },
          { seed: DigimonSeeds.AGUMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.KUNEMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.GABUMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.GUILMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SUNMON, levelRange: { min: 5, max: 8 }, rarity: 0.1 },
          { seed: DigimonSeeds.BIYOMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.RENAMON, levelRange: { min: 5, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.DODOMON, levelRange: { min: 5, max: 6 }, rarity: 0.8 },
          { seed: DigimonSeeds.PITCHMON, levelRange: { min: 5, max: 6 }, rarity: 0.8 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.CORONAMON, levelRange: { min: 6, max: 10 }, rarity: 0.3 },
          { seed: DigimonSeeds.BLACKAGUMON, levelRange: { min: 6, max: 11 }, rarity: 0.3 },
          { seed: DigimonSeeds.SHAMAMON, levelRange: { min: 7, max: 12 }, rarity: 0.3 },
          { seed: DigimonSeeds.GEO_GREYMON, levelRange: { min: 8, max: 12 }, rarity: 0.5 },
          { seed: DigimonSeeds.APEMON, levelRange: { min: 8, max: 12 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GROWLMON, levelRange: { min: 8, max: 12 }, rarity: 0.5 },
          { seed: DigimonSeeds.FIRAMON, levelRange: { min: 9, max: 14 }, rarity: 0.5 },
          { seed: DigimonSeeds.SKULL_GREYMON, levelRange: { min: 10, max: 15 }, rarity: 0.7 },
          { seed: DigimonSeeds.METAL_GREYMON, levelRange: { min: 10, max: 15 }, rarity: 0.7 },
          { seed: DigimonSeeds.TYRANNOMON, levelRange: { min: 10, max: 15 }, rarity: 0.5 },
          { seed: DigimonSeeds.SANDYANMAMON, levelRange: { min: 10, max: 15 }, rarity: 0.5 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.SEASARMON, level: 12 },
          { seed: DigimonSeeds.NISEDRIMOGEMON, level: 12 },
        ],
      },
    ],
    levelRange: { min: 5, max: 15 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_LABEL_FOREST',
    img: 'assets/environments/labelforest.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.TENTOMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.KUNEMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.MINOMON, levelRange: { min: 10, max: 14 }, rarity: 0.1 },
          { seed: DigimonSeeds.SALAMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.TANEMON, levelRange: { min: 10, max: 13 }, rarity: 0.1 },
          { seed: DigimonSeeds.BUDMON, levelRange: { min: 10, max: 13 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.WORMMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.GUMMYMON, levelRange: { min: 10, max: 13 }, rarity: 0.5 },
          { seed: DigimonSeeds.KOKOMON, levelRange: { min: 10, max: 13 }, rarity: 0.5 },
          { seed: DigimonSeeds.KUMAMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.GOBURIMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
          { seed: DigimonSeeds.NANIMON, levelRange: { min: 10, max: 15 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.PAGUMON, levelRange: { min: 10, max: 12 }, rarity: 0.6 },
          { seed: DigimonSeeds.PALMON, levelRange: { min: 11, max: 16 }, rarity: 0.3 },
          { seed: DigimonSeeds.LALAMON, levelRange: { min: 11, max: 15 }, rarity: 0.2 },
          { seed: DigimonSeeds.DOKUNEMON, levelRange: { min: 11, max: 16 }, rarity: 0.3 },
          { seed: DigimonSeeds.KABUTERIMON, levelRange: { min: 12, max: 18 }, rarity: 0.3 },
          { seed: DigimonSeeds.GATOMON, levelRange: { min: 12, max: 18 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DOKUGUMON, levelRange: { min: 12, max: 18 }, rarity: 0.3 },
          { seed: DigimonSeeds.ARURAUMON, levelRange: { min: 12, max: 17 }, rarity: 0.3 },
          { seed: DigimonSeeds.MUSHROOMON, levelRange: { min: 12, max: 18 }, rarity: 0.5 },
          { seed: DigimonSeeds.FLYMON, levelRange: { min: 12, max: 18 }, rarity: 0.5 },
          { seed: DigimonSeeds.SUNFLOWMON, levelRange: { min: 13, max: 18 }, rarity: 0.7 },
          { seed: DigimonSeeds.STINGMON, levelRange: { min: 13, max: 18 }, rarity: 0.5 },
          { seed: DigimonSeeds.TOGEMON, levelRange: { min: 14, max: 19 }, rarity: 0.5 },
          { seed: DigimonSeeds.KUWAGAMON, levelRange: { min: 14, max: 20 }, rarity: 0.5 },
          { seed: DigimonSeeds.OGREMON, levelRange: { min: 14, max: 20 }, rarity: 0.5 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.MEGA_KABUTERIMON_RED, level: 17 },
          { seed: DigimonSeeds.MEGA_KABUTERIMON_BLUE, level: 17 },
        ],
      },
    ],
    levelRange: { min: 10, max: 20 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_REGISTER_JUNGLE',
    img: 'assets/environments/registerjungle.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GABUMON, levelRange: { min: 15, max: 22 }, rarity: 0.3 },
          { seed: DigimonSeeds.GOBURIMON, levelRange: { min: 15, max: 20 }, rarity: 0.3 },
          { seed: DigimonSeeds.ARMADILLOMON, levelRange: { min: 15, max: 20 }, rarity: 0.3 },
          { seed: DigimonSeeds.KOTEMON, levelRange: { min: 15, max: 20 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MUCHOMON, levelRange: { min: 15, max: 20 }, rarity: 0.3 },
          { seed: DigimonSeeds.MONODRAMON, levelRange: { min: 16, max: 21 }, rarity: 0.3 },
          { seed: DigimonSeeds.KUMAMON, levelRange: { min: 16, max: 21 }, rarity: 0.3 },
          { seed: DigimonSeeds.RENAMON, levelRange: { min: 16, max: 21 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SHAMAMON, levelRange: { min: 17, max: 22 }, rarity: 0.3 },
          { seed: DigimonSeeds.GARURUMON, levelRange: { min: 18, max: 25 }, rarity: 0.5 },
          { seed: DigimonSeeds.FUGAMON, levelRange: { min: 18, max: 22 }, rarity: 0.5 },
          { seed: DigimonSeeds.OGREMON, levelRange: { min: 18, max: 22 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DINOHUMON, levelRange: { min: 18, max: 23 }, rarity: 0.5 },
          { seed: DigimonSeeds.KIWIMON, levelRange: { min: 18, max: 22 }, rarity: 0.5 },
          { seed: DigimonSeeds.KOKATORIMON, levelRange: { min: 18, max: 22 }, rarity: 0.5 },
          { seed: DigimonSeeds.KYUBIMON, levelRange: { min: 19, max: 24 }, rarity: 0.5 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.WERE_GARURUMON, level: 22 },
          { seed: DigimonSeeds.METAL_GARURUMON, level: 23 },
        ],
      },
    ],
    levelRange: { min: 15, max: 25 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_PROXY_ISLAND',
    img: 'assets/environments/proxyisland.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GOMAMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.GUILMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.BETAMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.SOLARMON, levelRange: { min: 20, max: 25 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SYAKOMON, levelRange: { min: 21, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.GIZAMON, levelRange: { min: 21, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.CRABMON, levelRange: { min: 21, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.IKKAKUMON, levelRange: { min: 22, max: 28 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GROWLMON, levelRange: { min: 22, max: 28 }, rarity: 0.5 },
          { seed: DigimonSeeds.GEO_GREYMON, levelRange: { min: 22, max: 28 }, rarity: 0.5 },
          { seed: DigimonSeeds.DIATRYMON, levelRange: { min: 22, max: 28 }, rarity: 0.5 },
          { seed: DigimonSeeds.SEADRAMON, levelRange: { min: 23, max: 28 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SHELLMON, levelRange: { min: 23, max: 28 }, rarity: 0.5 },
          { seed: DigimonSeeds.GESOMON, levelRange: { min: 24, max: 29 }, rarity: 0.5 },
          { seed: DigimonSeeds.EBIDRAMON, levelRange: { min: 24, max: 29 }, rarity: 0.5 },
          { seed: DigimonSeeds.WAR_GROWLMON, levelRange: { min: 25, max: 30 }, rarity: 0.7 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.TORTAMON, level: 27 },
          { seed: DigimonSeeds.SABERLEOMON, level: 27 },
        ],
      },
    ],
    levelRange: { min: 20, max: 30 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_LIMIT_VALLEY',
    img: 'assets/environments/limitvalley.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.AGUMON, levelRange: { min: 25, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.MONODRAMON, levelRange: { min: 25, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.DORUMON, levelRange: { min: 25, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.BIYOMON, levelRange: { min: 25, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.RENAMON, levelRange: { min: 25, max: 25 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SHAMAMON, levelRange: { min: 25, max: 25 }, rarity: 0.3 },
          { seed: DigimonSeeds.GEREMON, levelRange: { min: 25, max: 33 }, rarity: 0.3 },
          { seed: DigimonSeeds.GREYMON, levelRange: { min: 27, max: 32 }, rarity: 0.5 },
          { seed: DigimonSeeds.DOKUGUMON, levelRange: { min: 27, max: 32 }, rarity: 0.5 },
          { seed: DigimonSeeds.KABUTERIMON, levelRange: { min: 27, max: 32 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GEO_GREYMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
          { seed: DigimonSeeds.BLUE_GREYMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
          { seed: DigimonSeeds.DORUGAMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
          { seed: DigimonSeeds.REPTILEDRAMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
          { seed: DigimonSeeds.TYRANNOMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MONOCHROMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
          { seed: DigimonSeeds.SANDYANMAMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
          { seed: DigimonSeeds.SEASARMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
          { seed: DigimonSeeds.NISEDRIMOGEMON, levelRange: { min: 28, max: 33 }, rarity: 0.5 },
          { seed: DigimonSeeds.DKTYRANNOMON, levelRange: { min: 29, max: 34 }, rarity: 0.5 },
          { seed: DigimonSeeds.RIZE_GREYMON, levelRange: { min: 30, max: 35 }, rarity: 0.7 },
          { seed: DigimonSeeds.MEGA_KABUTERIMON_BLUE, levelRange: { min: 30, max: 35 }, rarity: 0.7 },
          { seed: DigimonSeeds.MEGA_KABUTERIMON_RED, levelRange: { min: 30, max: 35 }, rarity: 0.7 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.TRICERAMON, level: 32 },
          { seed: DigimonSeeds.SHINE_GREYMON, level: 33 },
        ],
      },
    ],
    levelRange: { min: 25, max: 35 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_LOOP_SWAMP',
    img: 'assets/environments/loopswamp.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BIRDRAMON, levelRange: { min: 30, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.CENTARUMON, levelRange: { min: 30, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.DEVIDRAMON, levelRange: { min: 30, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.FLAMEDRAMON, levelRange: { min: 30, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.FLARERIZAMON, levelRange: { min: 30, max: 35 }, rarity: 0.3 },
          { seed: DigimonSeeds.NUMEMON, levelRange: { min: 31, max: 36 }, rarity: 0.3 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SUKAMON, levelRange: { min: 31, max: 36 }, rarity: 0.3 },
          { seed: DigimonSeeds.SEADRAMON, levelRange: { min: 32, max: 38 }, rarity: 0.5 },
          { seed: DigimonSeeds.IKKAKUMON, levelRange: { min: 32, max: 38 }, rarity: 0.5 },
          { seed: DigimonSeeds.KYUKIMON, levelRange: { min: 32, max: 38 }, rarity: 0.5 },
          { seed: DigimonSeeds.GEKOMON, levelRange: { min: 32, max: 37 }, rarity: 0.5 },
          { seed: DigimonSeeds.COELAMON, levelRange: { min: 32, max: 37 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SHELLMON, levelRange: { min: 32, max: 37 }, rarity: 0.5 },
          { seed: DigimonSeeds.RAREMON, levelRange: { min: 32, max: 37 }, rarity: 0.5 },
          { seed: DigimonSeeds.YANMAMON, levelRange: { min: 32, max: 38 }, rarity: 0.5 },
          { seed: DigimonSeeds.WEEDMON, levelRange: { min: 32, max: 38 }, rarity: 0.5 },
          { seed: DigimonSeeds.KOGAMON, levelRange: { min: 32, max: 38 }, rarity: 0.5 },
          { seed: DigimonSeeds.GESOMON, levelRange: { min: 33, max: 38 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DOLPHMON, levelRange: { min: 33, max: 40 }, rarity: 0.5 },
          { seed: DigimonSeeds.EBIDRAMON, levelRange: { min: 33, max: 40 }, rarity: 0.5 },
          { seed: DigimonSeeds.GAWAPPAMON, levelRange: { min: 33, max: 40 }, rarity: 0.5 },
          { seed: DigimonSeeds.ZUDOMON, levelRange: { min: 34, max: 40 }, rarity: 0.7 },
          { seed: DigimonSeeds.OCTOMON, levelRange: { min: 34, max: 39 }, rarity: 0.5 },
          { seed: DigimonSeeds.MUSYAMON, levelRange: { min: 34, max: 40 }, rarity: 0.7 },
          { seed: DigimonSeeds.SHOGUNGEKOMON, levelRange: { min: 34, max: 40 }, rarity: 0.7 },
          { seed: DigimonSeeds.BLOSSOMON, levelRange: { min: 34, max: 40 }, rarity: 0.7 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.LILLYMON, level: 37 },
          { seed: DigimonSeeds.MACHINEDRAMON, level: 37 },
        ],
      },
    ],
    levelRange: { min: 30, max: 40 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_ACCESS_GLACIER',
    img: 'assets/environments/accessglacier.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.FRIGIMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.MOJYAMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.GRIZZMON, levelRange: { min: 35, max: 42 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ICEMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.TSUCHIDARUMON, levelRange: { min: 35, max: 40 }, rarity: 0.3 },
          { seed: DigimonSeeds.GARURUMON, levelRange: { min: 37, max: 42 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.HYOGAMON, levelRange: { min: 37, max: 42 }, rarity: 0.5 },
          { seed: DigimonSeeds.ICEDEVIMON, levelRange: { min: 37, max: 42 }, rarity: 0.5 },
          { seed: DigimonSeeds.ZUDOMON, levelRange: { min: 38, max: 43 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.WERE_GARURUMON, levelRange: { min: 39, max: 45 }, rarity: 0.7 },
          { seed: DigimonSeeds.METAL_GARURUMON, levelRange: { min: 40, max: 45 }, rarity: 0.9 },
          { seed: DigimonSeeds.VIKEMON, levelRange: { min: 40, max: 45 }, rarity: 0.9 },
          { seed: DigimonSeeds.MAMMOTHMON, levelRange: { min: 40, max: 45 }, rarity: 0.7 },
          { seed: DigimonSeeds.CYBERDRAMON, levelRange: { min: 40, max: 45 }, rarity: 0.7 },
          { seed: DigimonSeeds.MAMETYRAMON, levelRange: { min: 40, max: 45 }, rarity: 0.7 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.METALTYRANNOMON, level: 42 },
          { seed: DigimonSeeds.DARKDRAMON, level: 46 },
        ],
      },
    ],
    levelRange: { min: 35, max: 45 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_SUNKEN_TUNNEL',
    img: 'assets/environments/anglertunnel.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.RAREMON, levelRange: { min: 40, max: 45 }, rarity: 0.2 },
          { seed: DigimonSeeds.HOOKMON, levelRange: { min: 40, max: 42 }, rarity: 0.2 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SUKAMON, levelRange: { min: 40, max: 43 }, rarity: 0.1 },
          { seed: DigimonSeeds.PANDAMON, levelRange: { min: 40, max: 50 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.KOGAMON, levelRange: { min: 40, max: 43 }, rarity: 0.8 },
          { seed: DigimonSeeds.MEKANORIMON, levelRange: { min: 41, max: 45 }, rarity: 0.6 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GUARDROMON, levelRange: { min: 42, max: 45 }, rarity: 0.4 },
          { seed: DigimonSeeds.STARMON, levelRange: { min: 42, max: 45 }, rarity: 0.7 },
          { seed: DigimonSeeds.ETEMON, levelRange: { min: 43, max: 50 }, rarity: 0.4 },
          { seed: DigimonSeeds.ANDROMON, levelRange: { min: 44, max: 50 }, rarity: 0.7 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.METALMAMEMON, level: 47 },
          { seed: DigimonSeeds.OMEKAMON, level: 44 },
        ],
      },
    ],
    levelRange: { min: 40, max: 50 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_MAGNET_MINE',
    img: 'assets/environments/magnetmine.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.RIZE_GREYMON, levelRange: { min: 45, max: 50 }, rarity: 0.1 },
          { seed: DigimonSeeds.TANKMON, levelRange: { min: 45, max: 45 }, rarity: 0.1 },
          { seed: DigimonSeeds.STARMON, levelRange: { min: 45, max: 45 }, rarity: 0.8 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.KURISARIMON, levelRange: { min: 45, max: 45 }, rarity: 0.8 },
          { seed: DigimonSeeds.METAL_GREYMON, levelRange: { min: 46, max: 52 }, rarity: 0.1 },
          { seed: DigimonSeeds.MEKANORIMON, levelRange: { min: 46, max: 51 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SKULL_GREYMON, levelRange: { min: 47, max: 53 }, rarity: 0.1 },
          { seed: DigimonSeeds.METALMAMEMON, levelRange: { min: 48, max: 53 }, rarity: 0.1 },
          { seed: DigimonSeeds.GIROMON, levelRange: { min: 48, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.VADEMON, levelRange: { min: 49, max: 55 }, rarity: 0.1 },
          { seed: DigimonSeeds.HIANDROMON, levelRange: { min: 50, max: 55 }, rarity: 0.9 },
          { seed: DigimonSeeds.METALTYRANNOMON, levelRange: { min: 50, max: 55 }, rarity: 0.1 },
          { seed: DigimonSeeds.LAMPMON, levelRange: { min: 50, max: 55 }, rarity: 0.1 },
          { seed: DigimonSeeds.METALETEMON, levelRange: { min: 50, max: 55 }, rarity: 0.1 },
          { seed: DigimonSeeds.CANNONDRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.1 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.BIG_MAMEMON, level: 53 },
          { seed: DigimonSeeds.KENKIMON, level: 53 },
        ],
      },
    ],
    levelRange: { min: 45, max: 55 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_PACKET_COAST',
    img: 'assets/environments/packetcoast.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.GIGADRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.MEGADRAMON, levelRange: { min: 50, max: 55 }, rarity: 0.3 },
          { seed: DigimonSeeds.SEADRAMON, levelRange: { min: 52, max: 57 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SHINE_GREYMON, levelRange: { min: 55, max: 60 }, rarity: 0.9 },
          { seed: DigimonSeeds.MEGASEADRAMON, levelRange: { min: 55, max: 60 }, rarity: 0.7 },
          { seed: DigimonSeeds.DIVERMON, levelRange: { min: 55, max: 60 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DRAGOMON, levelRange: { min: 55, max: 60 }, rarity: 0.7 },
          { seed: DigimonSeeds.MARINE_DEVIMON, levelRange: { min: 55, max: 60 }, rarity: 0.7 },
          { seed: DigimonSeeds.WHAMON, levelRange: { min: 55, max: 60 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MARINEANGEMON, levelRange: { min: 55, max: 60 }, rarity: 0.9 },
          { seed: DigimonSeeds.METALSEADRAMON, levelRange: { min: 55, max: 60 }, rarity: 0.9 },
          { seed: DigimonSeeds.PUKUMON, levelRange: { min: 55, max: 60 }, rarity: 0.9 },
          { seed: DigimonSeeds.GIGASEADRAMON, levelRange: { min: 55, max: 60 }, rarity: 0.7 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.JUMBOGAMEMON, level: 57 },
          { seed: DigimonSeeds.NEPTUNMON, level: 57 },
        ],
      },
    ],
    levelRange: { min: 50, max: 60 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_PALLETE_AMAZON',
    img: 'assets/environments/paletteamazon.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ALLOMON, levelRange: { min: 55, max: 60 }, rarity: 0.3 },
          { seed: DigimonSeeds.ETEMON, levelRange: { min: 55, max: 60 }, rarity: 0.3 },
          { seed: DigimonSeeds.OKUWAMON, levelRange: { min: 57, max: 62 }, rarity: 0.5 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.SINDURAMON, levelRange: { min: 57, max: 62 }, rarity: 0.5 },
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 60, max: 65 }, rarity: 0.9 },
          { seed: DigimonSeeds.MEGA_KABUTERIMON_BLUE, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MEGA_KABUTERIMON_RED, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.LILLYMON, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.BLOSSOMON, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.CHERRYMON, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.PARROTMON, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.DERAMON, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.LILAMON, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.GRAPLEOMON, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.ARUKENIMON, levelRange: { min: 60, max: 65 }, rarity: 0.7 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.DINOBEEMON, level: 62 },
          { seed: DigimonSeeds.HERCULES_KABUTERIMON, level: 63 },
        ],
      },
    ],
    levelRange: { min: 55, max: 65 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_THRILLER_RUINS',
    img: 'assets/environments/thrillerruins.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BEELZEMON, levelRange: { min: 60, max: 65 }, rarity: 0.9 },
          { seed: DigimonSeeds.CHAOS_GALLANTMON, levelRange: { min: 60, max: 65 }, rarity: 0.9 },
          { seed: DigimonSeeds.DARKDRAMON, levelRange: { min: 60, max: 65 }, rarity: 0.9 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 60, max: 68 }, rarity: 0.9 },
          { seed: DigimonSeeds.DIGITAMAMON, levelRange: { min: 62, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.MUMMYMON, levelRange: { min: 62, max: 65 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.KUZUHAMON, levelRange: { min: 62, max: 70 }, rarity: 0.9 },
          { seed: DigimonSeeds.BLACK_WAR_GREYMON, levelRange: { min: 62, max: 70 }, rarity: 0.9 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 62, max: 70 }, rarity: 0.9 },
          { seed: DigimonSeeds.INFERMON, levelRange: { min: 62, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.BLACK_WERE_GARURUMON, levelRange: { min: 62, max: 65 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.PHANTOMON, levelRange: { min: 63, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.MYOTISMON, levelRange: { min: 64, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.BOLTMON, levelRange: { min: 64, max: 70 }, rarity: 0.9 },
          { seed: DigimonSeeds.PHARAOHMON, levelRange: { min: 65, max: 70 }, rarity: 0.9 },
          { seed: DigimonSeeds.ANUBISMON, levelRange: { min: 65, max: 70 }, rarity: 0.9 },
          { seed: DigimonSeeds.ARGOMON_ULTIMATE, levelRange: { min: 65, max: 65 }, rarity: 0.9 },
          { seed: DigimonSeeds.GHOULMON, levelRange: { min: 65, max: 70 }, rarity: 0.9 },
          { seed: DigimonSeeds.LILITHMON, levelRange: { min: 65, max: 70 }, rarity: 0.9 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.GULFMON, level: 67 },
          { seed: DigimonSeeds.SHINE_GREYMON_RUIN_MODE, level: 67 },
        ],
      },
    ],
    levelRange: { min: 60, max: 70 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_RISK_FACTORY',
    img: 'assets/environments/riskfactory.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.METAL_GREYMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.BLUE_METAL_GREYMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.SKULL_GREYMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ANDROMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.GIROMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.METALMAMEMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.BLACKRAPIDMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.GIGADRAMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.GARBAGEMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ROCKCHESSMON, levelRange: { min: 65, max: 65 }, rarity: 0.7 },
          { seed: DigimonSeeds.ANDROMON, levelRange: { min: 65, max: 65 }, rarity: 0.5 },
          { seed: DigimonSeeds.METEORMON, levelRange: { min: 65, max: 65 }, rarity: 0.5 },
          { seed: DigimonSeeds.MEGADRAMON, levelRange: { min: 65, max: 65 }, rarity: 0.5 },
          { seed: DigimonSeeds.WAR_GREYMON, levelRange: { min: 68, max: 75 }, rarity: 0.9 },
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 70, max: 75 }, rarity: 0.9 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.HIANDROMON, level: 72 },
        ],
      },
    ],
    levelRange: { min: 65, max: 75 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_SHADOW_ABYSS',
    img: 'assets/environments/shadowabyss.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DEVITAMAMON, levelRange: { min: 70, max: 80 }, rarity: 0.2 },
          { seed: DigimonSeeds.LILITHMON, levelRange: { min: 70, max: 85 }, rarity: 0.4 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 75, max: 85 }, rarity: 0.7 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 75, max: 80 }, rarity: 0.5 },
          { seed: DigimonSeeds.CHAOS_GALLANTMON, levelRange: { min: 75, max: 80 }, rarity: 0.9 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DARKDRAMON, levelRange: { min: 75, max: 80 }, rarity: 0.9 },
          { seed: DigimonSeeds.GALLANTMON, levelRange: { min: 75, max: 85 }, rarity: 0.9 },
          { seed: DigimonSeeds.ZEKE_GREYMON, levelRange: { min: 75, max: 85 }, rarity: 0.9 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.VENOMMYOTISMON, levelRange: { min: 77, max: 85 }, rarity: 0.8 },
          { seed: DigimonSeeds.METALSEADRAMON, levelRange: { min: 80, max: 85 }, rarity: 0.6 },
          { seed: DigimonSeeds.CHERUBIMON_EVIL, levelRange: { min: 70, max: 85 }, rarity: 0.8 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.GULFMON, level: 82 },
          { seed: DigimonSeeds.SHINE_GREYMON_RUIN_MODE, level: 85 },
        ],
      },
    ],
    levelRange: { min: 70, max: 85 },
  },
  {
    name: 'MODULES.ADVENTURE.EXPLORE_SECTION.LOCATION_WIZARD_TEMPLE',
    img: 'assets/environments/wizardtemple.png',
    stages: [
      {
        possibleEncounters: [
          { seed: DigimonSeeds.DIANAMON, levelRange: { min: 80, max: 90 }, rarity: 0.8 },
          { seed: DigimonSeeds.GALLANTMON, levelRange: { min: 80, max: 90 }, rarity: 0.9 },
          { seed: DigimonSeeds.KUZUHAMON, levelRange: { min: 80, max: 90 }, rarity: 0.5 },
          { seed: DigimonSeeds.LILITHMON, levelRange: { min: 80, max: 90 }, rarity: 0.4 },
          { seed: DigimonSeeds.MEGIDRAMON, levelRange: { min: 80, max: 90 }, rarity: 0.6 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.ROSEMON, levelRange: { min: 80, max: 90 }, rarity: 0.5 },
          { seed: DigimonSeeds.BLACK_WAR_GREYMON, levelRange: { min: 85, max: 100 }, rarity: 0.5 },
          { seed: DigimonSeeds.CHERUBIMON_GOOD, levelRange: { min: 85, max: 100 }, rarity: 0.9 },
          { seed: DigimonSeeds.GOLDRAMON, levelRange: { min: 85, max: 100 }, rarity: 0.9 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.HOLYDRAMON, levelRange: { min: 85, max: 100 }, rarity: 0.9 },
          { seed: DigimonSeeds.IMPERIALDRAMON_DRAGON_MODE, levelRange: { min: 85, max: 100 }, rarity: 0.3 },
          { seed: DigimonSeeds.MACHINEDRAMON, levelRange: { min: 85, max: 100 }, rarity: 0.9 },
          { seed: DigimonSeeds.OMNIMON, levelRange: { min: 85, max: 100 }, rarity: 0.9 },
        ],
      },
      {
        possibleEncounters: [
          { seed: DigimonSeeds.OPHANIMON, levelRange: { min: 80, max: 100 }, rarity: 0.9 },
          { seed: DigimonSeeds.PHOENIXMON, levelRange: { min: 85, max: 100 }, rarity: 0.7 },
          { seed: DigimonSeeds.ALPHAMON, levelRange: { min: 85, max: 100 }, rarity: 0.4 },
          { seed: DigimonSeeds.BEELZEMON, levelRange: { min: 85, max: 100 }, rarity: 0.3 },
        ],
      },
      {
        boss: [
          { seed: DigimonSeeds.OPHANIMON, level: 90 },
          { seed: DigimonSeeds.OMNIMON, level: 92 },
        ],
      },
    ],
    levelRange: { min: 80, max: 100 },
  },
];
