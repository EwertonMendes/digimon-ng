import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DigimonSelectionModalComponent } from '../../../shared/components/digimon-selection-modal/digimon-selection-modal.component';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { DigimonService } from '../../../services/digimon.service';
import { BaseDigimon } from '../../../core/interfaces/digimon.interface';

import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CheckboxComponent } from 'app/shared/components/checkbox/checkbox.component';
import { TranslocoModule } from '@jsverse/transloco';
import { ModalV2Service } from 'app/shared/components/modalV2/modal.service';
import { EvolutionTreeModalComponent } from 'app/shared/components/evolution-tree-modal/evolution-tree-modal.component';

@Component({
  selector: 'app-debug-modal',
  standalone: true,
  imports: [
    ModalComponent,
    ButtonComponent,
    DigimonSelectionModalComponent,
    FormsModule,
    CheckboxComponent,
    TranslocoModule
  ],
  templateUrl: './debug-modal.component.html',
  styleUrl: './debug-modal.component.scss',
})
export class DebugModalComponent {
  debugModalId = 'debug-modal';
  giveSelectedDigimonModalId = 'give-selected-digimon-modal-debug';
  seeEvolutionTreeModalId = 'see-evolution-tree-modal-debug';
  evolutionTreeModalId = 'evolution-tree-modal-debug';

  selectedEvolutionLineDigimon = signal<BaseDigimon>({} as BaseDigimon);
  selectableDigimonList = signal<BaseDigimon[]>([]);
  selectedLevel = 1;
  totalDigimonAmount = 0;
  generateEvolutionLine = false;
  $OnDestroy = new Subject<void>();

  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);
  modalService = inject(ModalService);
  modalServiceV2 = inject(ModalV2Service)
  digimonService = inject(DigimonService);
  changeDectorRef = inject(ChangeDetectorRef);

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

  onOpen() {
    if (this.selectableDigimonList().length !== 0) return;
    this.digimonService.baseDigimonData$.pipe(takeUntil(this.$OnDestroy)).subscribe((data) => {
      this.selectableDigimonList.set(
        data.sort((a, b) => a.name.localeCompare(b.name))
      );
      this.totalDigimonAmount = data.length;
    });
  }

  onClose() {
    this.selectableDigimonList.set([]);
    this.$OnDestroy.next();
    this.$OnDestroy.complete();
  }

  giveRandomDigimon() {
    const digimon = this.globalState.generateRandomDigimon();
    this.globalState.addDigimonToStorage(digimon);
    this.toastService.showToast(
      this.globalState.translocoService.translate('SHARED.COMPONENTS.DEBUG_MODAL.ADDED_TO_STORAGE', { name: digimon.name }),
      'success'
    );
  }

  giveSelectedDigimon(digimon: BaseDigimon) {
    const newDigimon = this.globalState.generateDigimonBySeed(
      digimon.seed,
      this.selectedLevel,
      this.generateEvolutionLine
    );

    this.globalState.addDigimonToStorage(newDigimon);

    this.toastService.showToast(
      this.globalState.translocoService.translate('SHARED.COMPONENTS.DEBUG_MODAL.ADDED_TO_STORAGE_LEVEL', { name: digimon.name, level: this.selectedLevel }),
      'success'
    );

    this.modalService.close(this.giveSelectedDigimonModalId);
  }

  openEvolutionTreeModal(digimon: BaseDigimon) {
    this.selectedEvolutionLineDigimon.set(digimon);
    this.changeDectorRef.detectChanges();
    this.modalServiceV2.open(this.evolutionTreeModalId, EvolutionTreeModalComponent, {
      mainDigimon: digimon
    });
  }

  async refreshDigimonList() {
    await this.digimonService.readBaseDigimonDatabase();
    this.changeDectorRef.detectChanges();
  }

  validateLevel(value: number): void {
    this.selectedLevel = Math.max(1, Math.min(value, 100));
  }

  resetStorage() {
    this.globalState.resetStorage();
    this.toastService.showToast(this.globalState.translocoService.translate('SHARED.COMPONENTS.DEBUG_MODAL.STORAGE_RESET'), 'success');
  }

  openGivenCertainDigimonModal() {
    this.modalService.open(this.giveSelectedDigimonModalId);
  }

  openSeeEvolutionLinesDigimonModal() {
    this.modalService.open(this.seeEvolutionTreeModalId);
  }
}
