import { Component, input } from '@angular/core';
import { Digimon } from '../../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-digi-status-card',
  standalone: true,
  imports: [],
  templateUrl: './digi-status-card.component.html',
  styleUrl: './digi-status-card.component.scss'
})
export class DigiStatusCardComponent {
  digimon = input.required<Digimon>();
}
