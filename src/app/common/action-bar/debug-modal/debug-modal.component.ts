import { ChangeDetectorRef, Component, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DigimonSelectionModalComponent } from '../../../shared/components/digimon-selection-modal/digimon-selection-modal.component';
import { DigimonService } from '../../../services/digimon.service';
import { BaseDigimon } from '../../../core/interfaces/digimon.interface';
import { TranslocoModule } from '@jsverse/transloco';
import { ModalV2Service } from 'app/shared/components/modalV2/modal.service';
import { EvolutionTreeModalComponent } from 'app/shared/components/evolution-tree-modal/evolution-tree-modal.component';
import { ModalV2Component } from 'app/shared/components/modalV2/modal.component';
import { GiveSelectedDigimonModalComponent } from './components/give-selected-digimon-modal/give-selected-digimon-modal.component';

@Component({
  selector: 'app-debug-modal',
  standalone: true,
  imports: [
    ModalV2Component,
    ButtonComponent,
    DigimonSelectionModalComponent,

    TranslocoModule
  ],
  templateUrl: './debug-modal.component.html',
  styleUrl: './debug-modal.component.scss',
})
export class DebugModalComponent {
  id = input('debug-modal');
  giveSelectedDigimonModalId = 'give-selected-digimon-modal-debug';
  seeEvolutionTreeModalId = 'see-evolution-tree-modal-debug';
  evolutionTreeModalId = 'evolution-tree-modal-debug';

  selectedEvolutionLineDigimon = signal<BaseDigimon>({} as BaseDigimon);
  selectableDigimonList = signal<BaseDigimon[]>([]);

  private globalState = inject(GlobalStateDataSource);
  private toastService = inject(ToastService);
  private modalService = inject(ModalV2Service);
  private modalServiceV2 = inject(ModalV2Service)
  private digimonService = inject(DigimonService);
  private changeDetectorRef = inject(ChangeDetectorRef);

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
  ];


  async refreshDigimonList() {
    await this.digimonService.readBaseDigimonDatabase();
    this.changeDetectorRef.detectChanges();
  }

  giveRandomDigimon() {
    const digimon = this.globalState.generateRandomDigimon();
    this.globalState.addDigimonToStorage(digimon);
    this.toastService.showToast(
      this.globalState.translocoService.translate('SHARED.COMPONENTS.DEBUG_MODAL.ADDED_TO_STORAGE', { name: digimon.name }),
      'success'
    );
  }

  openEvolutionTreeModal(digimon: BaseDigimon) {
    this.selectedEvolutionLineDigimon.set(digimon);
    this.changeDetectorRef.detectChanges();
    this.modalServiceV2.open(this.evolutionTreeModalId, EvolutionTreeModalComponent, {
      mainDigimon: digimon
    });
  }

  resetStorage() {
    this.globalState.resetStorage();
    this.toastService.showToast(this.globalState.translocoService.translate('SHARED.COMPONENTS.DEBUG_MODAL.STORAGE_RESET'), 'success');
  }

  openGivenCertainDigimonModal() {
    this.modalService.open(this.giveSelectedDigimonModalId, GiveSelectedDigimonModalComponent);
  }

  openSeeEvolutionLinesDigimonModal() {
    this.modalService.open(this.seeEvolutionTreeModalId, DigimonSelectionModalComponent);
  }
}
