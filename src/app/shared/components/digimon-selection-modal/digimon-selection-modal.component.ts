import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { BaseDigimon } from '../../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-digimon-selection-modal',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './digimon-selection-modal.component.html',
  styleUrl: './digimon-selection-modal.component.scss',
})
export class DigimonSelectionModalComponent {
  digimonSelectionModalId = 'digimon-selection-modal';

  digimonList = input.required<BaseDigimon[]>();

  onSelectDigimon = output<BaseDigimon>();
}
