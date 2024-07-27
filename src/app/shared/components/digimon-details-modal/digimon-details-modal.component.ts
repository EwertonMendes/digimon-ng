import { Component, effect, inject, signal } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { Digimon } from '../../../core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-digimon-details-modal',
  templateUrl: './digimon-details-modal.component.html',
  styleUrl: './digimon-details-modal.component.scss',
  imports: [ModalComponent, CommonModule],
})
export class DigimonDetailsModalComponent {
  digimonDetailsModalId = 'digimon-details-modal';

  globalState = inject(GlobalStateDataSource);

  evolutions = signal<Digimon[]>([]);

  constructor() {
    effect(
      () => {
        this.globalState.selectedDigimonOnDetailsAccessor;
        const evolutionList = this.globalState.getDigimonEvolutions();

        if (!evolutionList) return;

        this.evolutions.set(evolutionList);
      },
      {
        allowSignalWrites: true,
      }
    );
  }
}
