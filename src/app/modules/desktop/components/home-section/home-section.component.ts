import { Component, inject } from '@angular/core';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { GlobalStateDataSource } from '../../../../global-state.datasource';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { ModalService } from '../../../../shared/components/modal/modal.service';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [DigiStatusCardComponent],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.scss',
})
export class HomeSectionComponent {
  digimonDetailsModalId = 'digimon-details-modal';
  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);

  onRightClick(event: MouseEvent, digimon: Digimon): void {
    event.preventDefault();
    if (!digimon.id) return;
    this.globalState.removeDigimonFromList(digimon.id!);
  }

  openDigimonDetailsModal(digimon: Digimon): void {
    console.log(digimon);
    this.modalService.open(this.digimonDetailsModalId);
  }
}
