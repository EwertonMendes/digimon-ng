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

    this.globalState.addDigimonToTraining({
      id: '7b8d5e6f-9ca0-4d7b-af21-cb25d8e9fa06',
      name: 'Greymon',
      img: '/assets/digimons/Greymon.webp',
      rank: 'Champion',
      hp: 100,
      mp: 50,
      atk: 30,
      def: 20,
      exp: 0,
      level: 1
    });
  }

  onRightClick(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    this.globalState.removeDigimonFromTraining(digimon.id);
  }
}
