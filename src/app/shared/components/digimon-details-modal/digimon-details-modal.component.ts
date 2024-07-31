import { Component, effect, inject, signal } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { Digimon } from '../../../core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';
import { EvolutionTreeComponent } from '../evolution-tree/evolution-tree.component';

@Component({
  standalone: true,
  selector: 'app-digimon-details-modal',
  templateUrl: './digimon-details-modal.component.html',
  styleUrl: './digimon-details-modal.component.scss',
  imports: [ModalComponent, CommonModule, EvolutionTreeComponent],
})
export class DigimonDetailsModalComponent {
  digimonDetailsModalId = 'digimon-details-modal';

  globalState = inject(GlobalStateDataSource);

  evolutions = signal<Digimon[]>([]);

  constructor() {
    effect(
      () => {
        this.globalState.selectedDigimonOnDetailsAccessor;
        const evolutionList = this.globalState.getDigimonCompleteEvolutionTree(
          this.globalState.selectedDigimonOnDetailsAccessor!
        );

        if (!evolutionList) return;

        this.evolutions.set(evolutionList.mainEvolutionTree);
      },
      {
        allowSignalWrites: true,
      }
    );
  }
}
