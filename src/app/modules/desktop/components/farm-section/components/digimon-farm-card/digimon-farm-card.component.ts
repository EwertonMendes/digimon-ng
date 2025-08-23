import { Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Digimon } from '@core/interfaces/digimon.interface';

@Component({
  selector: 'app-digimon-farm-card',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './digimon-farm-card.component.html',
  styleUrl: './digimon-farm-card.component.scss'
})
export class DigimonFarmCardComponent {
  digimon = input<Digimon>();
}
