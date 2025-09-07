import { Component, computed, effect, inject, signal } from '@angular/core';
import { ButtonComponent } from "@shared/components/button/button.component";
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { BaseDigimon } from '@core/interfaces/digimon.interface';
import { DigimonService } from '@services/digimon.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { IconComponent } from "@shared/components/icon/icon.component";
import { TooltipDirective } from 'app/directives/tooltip.directive';

type LabDigimon = BaseDigimon & { amount: number; cost: number, obtained: boolean };

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TranslocoModule, IconComponent, TooltipDirective],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.scss',
})
export class LabComponent {
  protected labDigimons = signal<LabDigimon[]>([]);
  protected obtainedDigimonsAmount = computed(() => this.labDigimons().filter(d => d.obtained).length);

  protected globalState = inject(GlobalStateDataSource);
  private digimonService = inject(DigimonService);

  constructor() {
    effect(() => {
      let digimons: LabDigimon[] = [];

      Object.entries(this.globalState.playerDataAcessor.digiData).forEach(([seed, digiData]) => {
        const digimon = this.digimonService.getBaseDigimonDataBySeed(seed) as LabDigimon;
        digimon.amount = digiData.amount;
        digimon.cost = this.globalState.getBitCost(digimon.rank);
        digimon.obtained = digiData.obtained;
        if (digimon) {
          digimons.push(digimon);
        }
      });
      this.labDigimons.set(digimons);
    });
  }

  convertDigiData(digimon: LabDigimon) {

    const newDigimon = this.digimonService.generateDigimonBySeed(digimon.seed);

    if (!newDigimon) return;

    this.globalState.convertDigiData(newDigimon);

  }
}
