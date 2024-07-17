import { Component } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  standalone: true,
  selector: 'app-digimon-details-modal',
  templateUrl: './digimon-details-modal.component.html',
  styleUrl: './digimon-details-modal.component.scss',
  imports: [ModalComponent],
})
export class DigimonDetailsModalComponent {
  digimonDetailsModalId = 'digimon-details-modal';
}
