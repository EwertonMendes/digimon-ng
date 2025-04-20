import { Component, effect, inject, signal } from '@angular/core';
import { ButtonComponent } from "../../shared/components/button/button.component";
import { GlobalStateDataSource } from '../../state/global-state.datasource';
import { BaseDigimon } from '../../core/interfaces/digimon.interface';
import { DigimonService } from '../../services/digimon.service';

type LabDigimon = BaseDigimon & { amount: number };

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.scss'
})
export class LabComponent {

  labDigimons = signal<LabDigimon[]>([]);
  globalState = inject(GlobalStateDataSource);
  digimonService = inject(DigimonService);

  constructor() {
    effect(() => {
      console.log(this.globalState.playerDataAcessor.digiData);

      let digimons: LabDigimon[] = [];
      Object.entries(this.globalState.playerDataAcessor.digiData).forEach(([seed, amount]) => {
        const digimon = this.digimonService.getBaseDigimonDataBySeed(seed) as LabDigimon;
        digimon.amount = amount;
        if (digimon) {
          digimons.push(digimon);
        }
      });
      this.labDigimons.set(digimons);
    }, {
      allowSignalWrites: true,
    });
  }
}
