import { Component, inject } from '@angular/core';
import { HomeSectionComponent } from './components/home-section/home-section.component';
import { FarmSectionComponent } from './components/farm-section/farm-section.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [HomeSectionComponent, FarmSectionComponent, ButtonComponent, ModalComponent],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.scss'
})
export class DesktopComponent {

  digimonStorageModalId = 'digimon-storage-modal';

  modalService = inject(ModalService);

  openDigimonStorageModal() {
    this.modalService.open(this.digimonStorageModalId);
  }
}
