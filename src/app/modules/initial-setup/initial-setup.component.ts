import { Component, inject, model, signal } from '@angular/core';
import { GlobalStateDataSource } from '../../state/global-state.datasource';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';
import { BaseDigimon, Digimon } from '../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-initial-setup',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './initial-setup.component.html',
  styleUrl: './initial-setup.component.scss'
})
export class InitialSetupComponent {

  tamerName = model('');

  //change this to get the digimon list from the database for better consistency
  teams = [
    {
      name: 'Dragon Force',
      members: [
        {
          seed: 'edc9812f-82a6-487f-9a4d-52b845643176',
          name: 'Koromon',
          img: '/assets/digimons/Koromon.webp',
          rank: 'In-Training',
          species: 'Dragon',
          attribute: 'Vaccine',
          hp: 66,
          mp: 67,
          atk: 47,
          def: 35,
          speed: 28,
          bitFarmingRate: 2,
          digiEvolutionSeedList: [
            '96c23ff9-d6b4-43da-91e6-f0c9799c65d7',
            'lmn3456o-789p-qr01-stuv-wxyzabcd34',
            'xyz5678a-123b-cdef-456g-hijklmn7890',
            'uvw1234a-567b-cdef-890g-hijklmn1234',
            'xyz5678a-123b-cdef-456g-hijklmn5678'
          ],
          degenerateSeedList: ['b5ac222a-e653-4543-923e-77355dd24686'],
          evolutionRequirements: [
            {
              type: 'level',
              value: 7
            }
          ]
        },
        {
          seed: '96c23ff9-d6b4-43da-91e6-f0c9799c65d7',
          name: 'Agumon',
          img: '/assets/digimons/Agumon.webp',
          rank: 'Rookie',
          species: 'Dragon',
          attribute: 'Vaccine',
          hp: 111,
          mp: 115,
          atk: 83,
          def: 62,
          speed: 57,
          bitFarmingRate: 2,
          digiEvolutionSeedList: [
            '70dbb38a-690e-45b3-bfc5-eccba64fbd9b',
            '67cd2d63-4299-446e-a851-6f04e9b51bc5',
            'a351a4ab-a5bf-42df-8a27-bb2d8ce06d0b'
          ],
          degenerateSeedList: [
            'edc9812f-82a6-487f-9a4d-52b845643176',
            'ijk9012l-3456-789m-nopq-rstuvwxyz23'
          ],
          evolutionRequirements: [
            {
              type: 'level',
              value: 15
            }
          ]
        },
        {
          seed: 'def5678a-9012-345b-cdef-6789012345gh',
          name: 'Airdramon',
          img: '/assets/digimons/Airdramon.webp',
          rank: 'Champion',
          species: 'Dragon',
          attribute: 'Vaccine',
          hp: 147,
          mp: 180,
          atk: 85,
          def: 93,
          speed: 94,
          bitFarmingRate: 6,
          digiEvolutionSeedList: [],
          degenerateSeedList: ['abc1234d-5678-efgh-9101-ijklmnopqrst'],
          evolutionRequirements: [
            {
              type: 'level',
              value: 30
            }
          ]
        }
      ]
    },
    {
      "name": "Aqua Guardians",
      "members": [
        {
          "seed": "277edb81-7051-4a5e-8f5d-369e70cd18e5",
          "name": "Pukamon",
          "img": "/assets/digimons/Pukamon.webp",
          "rank": "In-Training",
          "species": "Aquan",
          "attribute": "Data",
          "hp": 70,
          "mp": 64,
          "atk": 40,
          "def": 52,
          "speed": 33,
          "bitFarmingRate": 3,
          "digiEvolutionSeedList": [
            "6ce78264-cbb0-4e10-8f55-89336f93d8dd"
          ],
          "degenerateSeedList": [
            "e7f074b5-2979-4a45-b6a3-3b07f6965f7d"
          ],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 7
            }
          ]
        },
        {
          "seed": "xyz5678a-123b-cdef-456g-hijklmn7890",
          "name": "Betamon",
          "img": "/assets/digimons/Betamon.webp",
          "rank": "Rookie",
          "species": "Aquan",
          "attribute": "Data",
          "hp": 85,
          "mp": 121,
          "atk": 76,
          "def": 66,
          "speed": 53,
          "bitFarmingRate": 2,
          "digiEvolutionSeedList": ["a03b8672-59d7-4f2e-9b5d-b0e2a3e7f9b8"],
          "degenerateSeedList": ["edc9812f-82a6-487f-9a4d-52b845643176"],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 15
            }
          ]
        },
        {
          "seed": "a03b8672-59d7-4f2e-9b5d-b0e2a3e7f9b8",
          "name": "Seadramon",
          "img": "/assets/digimons/Seadramon.webp",
          "rank": "Champion",
          "species": "Aquan",
          "attribute": "Virus",
          "hp": 151,
          "mp": 172,
          "atk": 105,
          "def": 94,
          "speed": 73,
          "bitFarmingRate": 8,
          "digiEvolutionSeedList": [],
          "degenerateSeedList": ["xyz5678a-123b-cdef-456g-hijklmn7890"],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 30
            }
          ]
        }
      ]
    },
    {
      "name": "Storm Strikers",
      "members": [
        {
          "seed": "25acac95-1107-484a-8dfc-f4f8139bc164",
          "name": "Dorimon",
          "img": "/assets/digimons/Dorimon.webp",
          "rank": "In-Training",
          "species": "Beast",
          "attribute": "Data",
          "hp": 75,
          "mp": 24,
          "atk": 52,
          "def": 41,
          "speed": 37,
          "bitFarmingRate": 5,
          "digiEvolutionSeedList": [
            "083241cc-fcf8-4101-a58d-09b0e6b375b6"
          ],
          "degenerateSeedList": [
            "9fb1302d-6916-4237-a80f-fa4e5e69decc"
          ],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 7
            }
          ]
        },
        {
          "seed": "083241cc-fcf8-4101-a58d-09b0e6b375b6",
          "name": "Armadillomon",
          "img": "/assets/digimons/Armadillomon.webp",
          "rank": "Rookie",
          "species": "Beast",
          "attribute": "Vaccine",
          "hp": 124,
          "mp": 105,
          "atk": 81,
          "def": 70,
          "speed": 53,
          "bitFarmingRate": 10,
          "digiEvolutionSeedList": ["cd52bdf0-80a8-4b19-b738-ed6acf1f0b14"],
          "degenerateSeedList": ["25acac95-1107-484a-8dfc-f4f8139bc164"],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 20
            }
          ]
        },
        {
          "seed": "a351a4ab-a5bf-42df-8a27-bb2d8ce06d0b",
          "name": "Blue Greymon",
          "img": "/assets/digimons/BlueGreymon.webp",
          "rank": "Champion",
          "species": "Dragon",
          "attribute": "Vaccine",
          "hp": 178,
          "mp": 150,
          "atk": 118,
          "def": 90,
          "speed": 81,
          "bitFarmingRate": 2,
          "digiEvolutionSeedList": [
            "34af8b92-9237-4f39-b45d-0d6c073d98c1"
          ],
          "degenerateSeedList": [
            "96c23ff9-d6b4-43da-91e6-f0c9799c65d7"
          ],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 30
            }
          ]
        }
      ]
    },
    {
      name: "Beast Brigade",
      "members": [
        {
          "seed": "4f2a5a34-f37e-4e2e-9429-5fa6a7b36c1b",
          "name": "Puttimon",
          "img": "/assets/digimons/Puttimon.webp",
          "rank": "In-Training",
          "species": "Holy",
          "attribute": "Vaccine",
          "hp": 69,
          "mp": 70,
          "atk": 45,
          "def": 28,
          "speed": 36,
          "bitFarmingRate": 3,
          "digiEvolutionSeedList": [
            "986f4b59-c234-44fa-b5bc-456736578f67"
          ],
          "degenerateSeedList": [],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 7
            }
          ]
        },
        {
          "seed": "uvw1234a-567b-cdef-890g-hijklmn1234",
          "name": "Goburimon",
          "img": "/assets/digimons/Goburimon.webp",
          "rank": "Rookie",
          "species": "Beast",
          "attribute": "Data",
          "hp": 118,
          "mp": 118,
          "atk": 82,
          "def": 72,
          "speed": 50,
          "bitFarmingRate": 1,
          "digiEvolutionSeedList": [
            "87a9e123-4f23-42b3-9d83-3c7e4382c3d5",
            "f3c12345-6b7d-4e89-9ef7-89c4672c34ab"
          ],
          "degenerateSeedList": [
            "edc9812f-82a6-487f-9a4d-52b845643176"
          ],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 15
            }
          ]
        },
        {
          "seed": "cd52bdf0-80a8-4b19-b738-ed6acf1f0b14",
          "name": "Apemon",
          "img": "/assets/digimons/Apemon.webp",
          "rank": "Champion",
          "species": "Beast",
          "attribute": "Data",
          "hp": 159,
          "mp": 188,
          "atk": 97,
          "def": 77,
          "speed": 91,
          "bitFarmingRate": 15,
          "digiEvolutionSeedList": [
            "c67f1a0b-f889-438b-9cc0-885f9f711a26"
          ],
          "degenerateSeedList": [
            "083241cc-fcf8-4101-a58d-09b0e6b375b6"
          ],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 30
            }
          ]
        }
      ]
    },
    {
      name: 'Claw Masters',
      members: [
        {
          "seed": "ijk9012l-3456-789m-nopq-rstuvwxyz23",
          "name": "Gigimon",
          "img": "/assets/digimons/Gigimon.webp",
          "rank": "In-Training",
          "species": "Dragon",
          "attribute": "Vaccine",
          "hp": 72,
          "mp": 61,
          "atk": 50,
          "def": 39,
          "speed": 29,
          "bitFarmingRate": 1,
          "digiEvolutionSeedList": ["lmn3456o-789p-qr01-stuv-wxyzabcd34"],
          "degenerateSeedList": [],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 7
            }
          ]
        },
        {
          "seed": "768e6d1a-5c3b-4ed2-991f-e4a1c16357a6",
          "name": "Gabumon",
          "img": "/assets/digimons/Gabumon.webp",
          "rank": "Rookie",
          "species": "Beast",
          "attribute": "Data",
          "hp": 113,
          "mp": 102,
          "atk": 86,
          "def": 59,
          "speed": 63,
          "bitFarmingRate": 2,
          "digiEvolutionSeedList": ["80c6f1b9-648a-49b3-92c9-01d6e2f4bc8e"],
          "degenerateSeedList": ["5f42c392-4f8e-4fc2-9202-44225bc0936b"],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 15
            }
          ]
        },
        {
          "seed": "67cd2d63-4299-446e-a851-6f04e9b51bc5",
          "name": "Geo Greymon",
          "img": "/assets/digimons/GeoGreymon.webp",
          "rank": "Champion",
          "species": "Dragon",
          "attribute": "Vaccine",
          "hp": 173,
          "mp": 175,
          "atk": 116,
          "def": 98,
          "speed": 80,
          "bitFarmingRate": 2,
          "digiEvolutionSeedList": [
            "529f424a-7efe-49bd-90dc-58286aaa9fb5",
            "66e5a6ea-93a5-47f8-91d9-8601857496f6"
          ],
          "degenerateSeedList": ["96c23ff9-d6b4-43da-91e6-f0c9799c65d7"],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 30
            }
          ]
        }
      ]
    },
    {
      name: 'Mystic Warriors',
      members: [
        {
          "seed": "def5678g-9012-34hi-jk56-7890123lmnop",
          "name": "Minomon",
          "img": "/assets/digimons/Minomon.webp",
          "rank": "In-Training",
          "species": "Insect",
          "attribute": "Data",
          "hp": 63,
          "mp": 69,
          "atk": 41,
          "def": 42,
          "speed": 26,
          "bitFarmingRate": 2,
          "digiEvolutionSeedList": [
            "ghi9012j-3456-kl78-mn90-1234567opqrs",
            "abc1234d-5678-efgh-9101-ijklmnopqrst",
            "xyz1234a-5678-bc90-defg-1234567890ab"
          ],
          "degenerateSeedList": [],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 7
            }
          ]
        },
        {
          "seed": "xyz5678a-123b-cdef-456g-hijklmn5678",
          "name": "Falcomon",
          "img": "/assets/digimons/Falcomon.webp",
          "rank": "Rookie",
          "species": "Bird",
          "attribute": "Data",
          "hp": 109,
          "mp": 114,
          "atk": 72,
          "def": 63,
          "speed": 71,
          "bitFarmingRate": 5,
          "digiEvolutionSeedList": [],
          "degenerateSeedList": ["edc9812f-82a6-487f-9a4d-52b845643176"],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 15
            }
          ]
        },
        {
          "seed": "80c6f1b9-648a-49b3-92c9-01d6e2f4bc8e",
          "name": "Garurumon",
          "img": "/assets/digimons/Garurumon.webp",
          "rank": "Champion",
          "species": "Beast",
          "attribute": "Data",
          "hp": 166,
          "mp": 165,
          "atk": 101,
          "def": 80,
          "speed": 83,
          "bitFarmingRate": 3,
          "digiEvolutionSeedList": ["a5e0bfb7-8d2a-4ef1-9636-cbb9db1fe1d0"],
          "degenerateSeedList": ["768e6d1a-5c3b-4ed2-991f-e4a1c16357a6"],
          "evolutionRequirements": [
            {
              "type": "level",
              "value": 30
            }
          ]
        }
      ]
    }
  ];

  selectedTeam = signal<BaseDigimon[]>([]);

  globalState = inject(GlobalStateDataSource);

  selectTeam(team: BaseDigimon[]) {
    this.selectedTeam.set(team);
  }

  confirmInitialSetup() {

    let selectedDigimons: Digimon[] = [];

    this.selectedTeam().forEach((digimon) => {
      selectedDigimons.push(this.globalState.generateDigimonBySeed(digimon.seed));
    });

    this.globalState.confirmInitialSetup(this.tamerName(), selectedDigimons);
  }
}
