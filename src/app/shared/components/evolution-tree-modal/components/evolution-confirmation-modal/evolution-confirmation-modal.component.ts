import { Component, inject, input, signal } from "@angular/core";
import { TranslocoModule } from "@jsverse/transloco";
import { Digimon, BaseDigimon } from "app/core/interfaces/digimon.interface";
import { ButtonComponent } from "app/shared/components/button/button.component";
import { ModalComponent } from "app/shared/components/modalV2/modal.component";
import { ModalService } from "app/shared/components/modalV2/modal.service";
import { GlobalStateDataSource } from "app/state/global-state.datasource";

export interface EvolutionConfirmationModalCloseEvent {
  refreshGraph: boolean
}

@Component({
  selector: 'app-evolution-confirmation-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, TranslocoModule],
  templateUrl: './evolution-confirmation-modal.component.html',
  styleUrl: './evolution-confirmation-modal.component.scss',
})
export class EvolutionConfirmationModalComponent {
  mainDigimon = input<Digimon | BaseDigimon>();
  selectedDigimon = input<BaseDigimon | null>(null);
  selectedPossibleEvolutionStats = input<any | null>(null);

  id = signal('evolution-confirmation-modal')
  isEvolving = signal<boolean>(false);

  globalState = inject(GlobalStateDataSource);

  constructor(private modalService: ModalService) { }

  close() {
    this.modalService.close(this.id(), {
      refreshGraph: false
    });
  }

  isDigimon(digimon: Digimon | BaseDigimon | undefined): digimon is Digimon {
    if (!digimon) return false;
    return digimon.hasOwnProperty('id');
  }

  async evolveDigimon() {
    if (!this.mainDigimon() || !this.selectedDigimon() || !this.isDigimon(this.mainDigimon())) return;

    this.isEvolving.set(true)

    await this.globalState.evolveDigimon(
      this.mainDigimon()! as Digimon,
      this.selectedDigimon()?.seed!
    );

    this.isEvolving.set(false)
    this.modalService.close(this.id(), {
      refreshGraph: true
    });
  }
}
