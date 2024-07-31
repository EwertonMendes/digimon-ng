import { Component, input } from '@angular/core';
import { Digimon } from '../../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-evolution-tree',
  standalone: true,
  imports: [],
  templateUrl: './evolution-tree.component.html',
  styleUrl: './evolution-tree.component.scss'
})
export class EvolutionTreeComponent {
  evolutionTree = input<Digimon[]>([]);
}
