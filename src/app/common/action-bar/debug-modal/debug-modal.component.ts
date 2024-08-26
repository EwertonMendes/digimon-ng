import { Component, inject, OnInit, signal } from '@angular/core';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DigimonSelectionModalComponent } from '../../../shared/components/digimon-selection-modal/digimon-selection-modal.component';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { DigimonService } from '../../../services/digimon.service';
import { Digimon } from '../../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-debug-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, DigimonSelectionModalComponent],
  templateUrl: './debug-modal.component.html',
  styleUrl: './debug-modal.component.scss',
})
export class DebugModalComponent implements OnInit {
  debugModalId = 'debug-modal';
  digimonSelectionModalId = 'digimon-selection-modal';
  selectableDigimonList = signal<Digimon[]>([]);
  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);
  modalService = inject(ModalService);
  digimonService = inject(DigimonService);

  tools = [
    { name: 'Give Random Digimon', action: this.giveRandomDigimon.bind(this) },
    {
      name: 'Give Certain Digimon',
      action: this.openDigimonSelectionModal.bind(this),
    },
    { name: 'Reset Storage', action: this.resetStorage.bind(this) },
  ];

  ngOnInit(): void {
    this.digimonService.baseDigimonData$.subscribe((data) => {
      this.selectableDigimonList.set(
        data.sort((a, b) => a.name.localeCompare(b.name))
      );
    });
  }

  giveRandomDigimon() {
    const digimon = this.globalState.generateRandomDigimon();
    this.globalState.addDigimonToStorage(digimon);
    this.toastService.showToast(
      `${digimon.name} was added to storage!`,
      'success'
    );
  }

  giveSelectedDigimon(digimon: Digimon) {
    const newDigimon = this.globalState.generateNewDigimon(digimon);

    this.globalState.addDigimonToStorage(newDigimon);

    this.toastService.showToast(
      `${digimon.name} was added to storage!`,
      'success'
    );

    this.modalService.close(this.digimonSelectionModalId);
  }

  resetStorage() {
    this.globalState.resetStorage();
    this.toastService.showToast('Storage reset!', 'success');
  }

  openDigimonSelectionModal() {
    this.modalService.open(this.digimonSelectionModalId);
  }
}
