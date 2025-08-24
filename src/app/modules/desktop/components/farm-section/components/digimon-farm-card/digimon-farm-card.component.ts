import { Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Digimon } from '@core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-digimon-farm-card',
  standalone: true,
  imports: [TranslocoModule, CommonModule],
  templateUrl: './digimon-farm-card.component.html',
  styleUrl: './digimon-farm-card.component.scss'
})
export class DigimonFarmCardComponent {
  digimon = input.required<Digimon>();
}
