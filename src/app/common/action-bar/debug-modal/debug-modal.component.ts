import { Component, inject, input } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { ToastService } from '@shared/components/toast/toast.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { ModalComponent } from 'app/shared/components/modal/modal.component';
import { GiveSelectedDigimonModalComponent } from './components/give-selected-digimon-modal/give-selected-digimon-modal.component';
import { SeeEvolutionTreeModalComponent } from './components/see-evolution-tree-modal/see-evolution-tree-modal.component';
import { LOCATIONS } from '@core/consts/locations';

@Component({
  selector: 'app-debug-modal',
  standalone: true,
  imports: [
    ModalComponent,
    ButtonComponent,
    TranslocoModule
  ],
  templateUrl: './debug-modal.component.html',
  styleUrl: './debug-modal.component.scss',
})
export class DebugModalComponent {
  id = input('debug-modal');
  giveSelectedDigimonModalId = 'give-selected-digimon-modal-debug';
  seeEvolutionTreeModalId = 'see-evolution-tree-modal-debug';

  private globalState = inject(GlobalStateDataSource);
  private toastService = inject(ToastService);
  private modalService = inject(ModalService)
  private translocoService = inject(TranslocoService);

  tools = [
    { name: 'SHARED.COMPONENTS.DEBUG_MODAL.GIVE_RANDOM_DIGIMON', action: this.giveRandomDigimon.bind(this) },
    {
      name: 'SHARED.COMPONENTS.DEBUG_MODAL.GIVE_CERTAIN_DIGIMON',
      action: this.openGivenCertainDigimonModal.bind(this),
    },
    { name: 'SHARED.COMPONENTS.DEBUG_MODAL.RESET_STORAGE', action: this.resetStorage.bind(this) },
    { name: 'SHARED.COMPONENTS.DEBUG_MODAL.SEE_EVOLUTION_LINES', action: this.openSeeEvolutionLinesDigimonModal.bind(this) },
    { name: 'SHARED.COMPONENTS.DEBUG_MODAL.INFO_TOAST_TEST', action: this.toastService.showToast.bind(this.toastService, 'Info!', 'info') },
    { name: 'SHARED.COMPONENTS.DEBUG_MODAL.SUCCESS_TOAST_TEST', action: this.toastService.showToast.bind(this.toastService, 'Success!', 'success') },
    { name: 'SHARED.COMPONENTS.DEBUG_MODAL.ERROR_TOAST_TEST', action: this.toastService.showToast.bind(this.toastService, 'Error!', 'error') },
    { name: 'SHARED.COMPONENTS.DEBUG_MODAL.KILL_ALL_DIGIMON', action: () => this.globalState.killAllDigimon() },
    {
      name: 'SHARED.COMPONENTS.DEBUG_MODAL.GIVE_1_MILLION_BITS', action: () => this.globalState.addBits(1000000)
    },
    {
      name: 'SHARED.COMPONENTS.DEBUG_MODAL.UNLOCK_ALL_LOCATIONS',
      action: this.unlockAllLocations.bind(this),
    },
    {
      name: 'SHARED.COMPONENTS.DEBUG_MODAL.LOCK_ALL_LOCATIONS',
      action: this.lockAllLocations.bind(this),
    }
  ];

  giveRandomDigimon() {
    const digimon = this.globalState.generateRandomDigimon();
    this.globalState.addDigiData(digimon.seed, 10, true);
    this.globalState.addDigimonToStorage(digimon);
    this.globalState.trackDigimonForList(digimon);
    this.toastService.showToast(
      this.translocoService.translate('SHARED.COMPONENTS.DEBUG_MODAL.ADDED_TO_STORAGE', { name: digimon.name }),
      'success'
    );
  }

  resetStorage() {
    this.globalState.resetStorage();
    this.toastService.showToast(this.translocoService.translate('SHARED.COMPONENTS.DEBUG_MODAL.STORAGE_RESET'), 'success');
  }

  openGivenCertainDigimonModal() {
    this.modalService.open(this.giveSelectedDigimonModalId, GiveSelectedDigimonModalComponent);
  }

  openSeeEvolutionLinesDigimonModal() {
    this.modalService.open(this.seeEvolutionTreeModalId, SeeEvolutionTreeModalComponent);
  }

  unlockAllLocations() {
    LOCATIONS.forEach(location => {
      this.globalState.unlockSpecificLocation(location);
    });
  }

  lockAllLocations() {
    LOCATIONS.forEach(location => {
      this.globalState.lockSpecificLocation(location);
    });
  }
}
