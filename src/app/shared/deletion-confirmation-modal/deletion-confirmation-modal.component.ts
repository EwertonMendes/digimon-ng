import { Component, inject, input, signal, ViewEncapsulation } from "@angular/core";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { ToastService } from "@shared/components/toast/toast.service";
import { Digimon } from "app/core/interfaces/digimon.interface";
import { ButtonComponent } from "app/shared/components/button/button.component";
import { ModalComponent } from "app/shared/components/modal/modal.component";
import { ModalService } from "app/shared/components/modal/modal.service";
import { GlobalStateDataSource } from "app/state/global-state.datasource";

export interface DeletionConfirmationModalCloseEvent {
  refreshed: boolean
}

@Component({
  selector: 'app-deletion-confirmation-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, TranslocoModule],
  templateUrl: './deletion-confirmation-modal.component.html',
  styleUrl: './deletion-confirmation-modal.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DeletionConfirmationModalComponent {
  digimon = input.required<Digimon>();

  protected id = signal('deletion-confirmation-modal')
  protected isDeleting = signal<boolean>(false);
  protected globalState = inject(GlobalStateDataSource);

  private toastService = inject(ToastService);
  private translocoService = inject(TranslocoService);

  constructor(private modalService: ModalService) { }

  close() {
    this.modalService.close(this.id(), {
      refreshed: false
    });
  }

  async deleteDigimon() {
    if (!this.digimon()) return;

    this.isDeleting.set(true);

    this.globalState.deleteDigimon(this.digimon().id!);

    this.isDeleting.set(false);
    this.toastService.showToast(this.translocoService.translate('SHARED.COMPONENTS.DIGI_STATUS_CARD.COMPONENTS.DELETION_CONFIRMATION_MODAL.DIGIMON_REMOVED_TOAST', {
      name: this.digimon().nickName ? this.digimon().nickName : this.digimon().name
    }), 'info');

    this.modalService.close(this.id(), {
      refreshed: true
    });
  }
}
