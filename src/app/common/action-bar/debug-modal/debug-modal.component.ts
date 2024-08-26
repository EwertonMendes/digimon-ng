import { Component, inject } from '@angular/core';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-debug-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  templateUrl: './debug-modal.component.html',
  styleUrl: './debug-modal.component.scss',
})
export class DebugModalComponent {
  debugModalId = 'debug-modal';

  globalState = inject(GlobalStateDataSource);
  toastService = inject(ToastService);

  giveRandomDigimon() {
    const digimon = this.globalState.generateRandomDigimon();
    this.globalState.addDigimonToStorage(digimon);
    this.toastService.showToast(`${digimon.name} was added to storage!`, 'success');
  }
}
