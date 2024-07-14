import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { DigimonFarmCardComponent } from './components/digimon-farm-card/digimon-farm-card.component';

@Component({
  selector: 'app-farm-section',
  standalone: true,
  imports: [ButtonComponent, DigiStatusCardComponent, DigimonFarmCardComponent],
  templateUrl: './farm-section.component.html',
  styleUrl: './farm-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FarmSectionComponent {
  globalState = inject(GlobalStateDataSource);

  bitGenerationTotalRate = signal<number>(0);

  constructor() {
    effect(() => {
      this.bitGenerationTotalRate.set(this.globalState.getBitGenerationTotalRate())
    }, {
      allowSignalWrites: true
    })
  }

  removeDigimonFromTraining(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    this.globalState.removeDigimonFromTraining(digimon.id!);
  }

  removeDigimonFromFarm(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    this.globalState.removeDigimonFromFarm(digimon.id!);
  }
}
