import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-farm-section',
  standalone: true,
  imports: [ButtonComponent, DigiStatusCardComponent],
  templateUrl: './farm-section.component.html',
  styleUrl: './farm-section.component.scss'
})
export class FarmSectionComponent {

  globalState = inject(GlobalStateDataSource);

  addDigimonToTraining() {

  }

  onRightClick(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    this.globalState.removeDigimonFromTraining(digimon.id!);
  }
}
