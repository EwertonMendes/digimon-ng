import { Component, input } from '@angular/core';
import { BaseDigimon } from '@core/interfaces/digimon.interface';

@Component({
  selector: 'app-evolution-route',
  standalone: true,
  imports: [],
  templateUrl: './evolution-route.component.html',
  styleUrl: './evolution-route.component.scss',
})
export class EvolutionRouteComponent {
  evolutionRoute = input<BaseDigimon[]>([]);
}
