import { Component, inject } from '@angular/core';
import { GlobalStateDataSource } from '../../state/global-state.datasource';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-initial-setup',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './initial-setup.component.html',
  styleUrl: './initial-setup.component.scss'
})
export class InitialSetupComponent {

  globalState = inject(GlobalStateDataSource);

  confirmInitialSetup() {
    this.globalState.confirmInitialSetup('Player Name', [
      {
        "id": "5ea81ebd-de18-42bf-be3c-fbebb89ea702",
        "seed": "df67cc96-4a69-4f26-88d6-2c98ccaecfe6",
        "name": "War Greymon",
        "birthDate": new Date(),
        "img": "/assets/digimons/WarGreymon.webp",
        "rank": "Mega",
        "species": "Dragon",
        "attribute": "Vaccine",
        "currentHp": 320,
        "maxHp": 320,
        "currentMp": 335,
        "maxMp": 335,
        "atk": 171,
        "def": 146,
        "speed": 122,
        "exp": 0,
        "totalExp": 0,
        "level": 1,
        "bitFarmingRate": 5,
        "digiEvolutionSeedList": [],
        "degenerateSeedList": ["25fc7b61-17ae-453b-94f7-4fa4f9171633"],
        "currentEvolutionRoute": [
          {
            "seed": "b5ac222a-e653-4543-923e-77355dd24686",
            "rank": "Fresh"
          },
          {
            "seed": "edc9812f-82a6-487f-9a4d-52b845643176",
            "rank": "In-Training"
          },
          {
            "seed": "96c23ff9-d6b4-43da-91e6-f0c9799c65d7",
            "rank": "Rookie"
          },
          {
            "seed": "70dbb38a-690e-45b3-bfc5-eccba64fbd9b",
            "rank": "Champion"
          },
          {
            "seed": "25fc7b61-17ae-453b-94f7-4fa4f9171633",
            "rank": "Ultimate"
          }
        ]
      }
    ]);
  }
}
