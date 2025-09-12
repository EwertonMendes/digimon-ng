import { Component, HostListener, inject, input, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Digimon } from '@core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';
import { ModalService } from '@shared/components/modal/modal.service';
import { DeletionConfirmationModalComponent } from '@shared/deletion-confirmation-modal/deletion-confirmation-modal.component';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { IconComponent } from "@shared/components/icon/icon.component";

@Component({
  selector: 'app-digimon-farm-card',
  standalone: true,
  imports: [TranslocoModule, CommonModule, IconComponent],
  templateUrl: './digimon-farm-card.component.html',
  styleUrl: './digimon-farm-card.component.scss'
})
export class DigimonFarmCardComponent {
  digimon = input.required<Digimon>();

  protected isHovered = signal(false);
  protected isDeletable = signal(false);

  private globalState = inject(GlobalStateDataSource);
  private modalService = inject(ModalService);

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isHovered.set(true);
    const allPlayerDigimons = this.globalState.allPlayerDigimonList();
    const isPlayerDigimon = allPlayerDigimons.some(digimon => digimon.id === this.digimon().id);
    const hasMultipleDigimons = allPlayerDigimons.length > 1;
    this.isDeletable.set(isPlayerDigimon && hasMultipleDigimons && !this.globalState.isBattleActive);
  }

  @HostListener('mouseleave')
  public mouseleaveListener(): void {
    this.isHovered.set(false);
    this.isDeletable.set(false);
  }

  openDeleteConfirmationModal() {
    this.modalService.open('deletion-confirmation-modal', DeletionConfirmationModalComponent, {
      digimon: this.digimon()
    });
  }
}
