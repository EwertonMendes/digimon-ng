import { Component, effect, inject, signal } from '@angular/core';
import { ButtonComponent } from "../../shared/components/button/button.component";
import { GlobalStateDataSource } from '../../state/global-state.datasource';
import { BaseDigimon } from '../../core/interfaces/digimon.interface';
import { DigimonService } from '../../services/digimon.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { CommonModule } from '@angular/common';

type LabDigimon = BaseDigimon & { amount: number };

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule,ButtonComponent],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.scss'
})
export class LabComponent {

  labDigimons = signal<LabDigimon[]>([]);
  globalState = inject(GlobalStateDataSource);
  digimonService = inject(DigimonService);
  toastService = inject(ToastService);

  constructor() {
    effect(() => {
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

  convertDigiData(digimon: LabDigimon) {

    const newDigimon = this.digimonService.generateDigimonBySeed(digimon.seed);

    if(!newDigimon) return;

    this.globalState.convertDigiData(newDigimon);

  }
}
