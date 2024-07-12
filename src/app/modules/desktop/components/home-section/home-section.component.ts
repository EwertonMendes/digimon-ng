import { Component, inject } from '@angular/core';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [DigiStatusCardComponent],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.scss'
})

export class HomeSectionComponent {
  globalState = inject(GlobalStateDataSource);

  onRightClick(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    this.globalState.removeDigimonFromList(digimon.id);
  }
}
