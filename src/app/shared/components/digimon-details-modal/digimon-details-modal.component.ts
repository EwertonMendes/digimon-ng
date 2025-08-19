import { Component, computed, effect, inject, signal } from '@angular/core';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { CommonModule } from '@angular/common';
import { EvolutionRouteComponent } from '../evolution-route/evolution-route.component';
import { ButtonComponent } from '../button/button.component';
import { EvolutionTreeModalComponent } from '../evolution-tree-modal/evolution-tree-modal.component';
import { BaseDigimon } from '../../../core/interfaces/digimon.interface';
import { AudioEffects } from '../../../core/enums/audio-tracks.enum';
import { AudioService } from '../../../services/audio.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ModalV2Component } from '../modalV2/modal.component';
import { ModalV2Service } from '../modalV2/modal.service';

@Component({
  standalone: true,
  selector: 'app-digimon-details-modal',
  templateUrl: './digimon-details-modal.component.html',
  styleUrl: './digimon-details-modal.component.scss',
  imports: [
    ModalV2Component,
    CommonModule,
    EvolutionRouteComponent,
    ButtonComponent,
    TranslocoModule
  ],
})
export class DigimonDetailsModalComponent {
  digimonDetailsModalId = signal('digimon-details-modal');
  evolutionTreeModalId = 'evolution-tree-modal';

  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalV2Service);
  audioService = inject(AudioService);
  translocoService = inject(TranslocoService);

  digimonDetailedAge = computed(() => {
    if (!this.globalState.selectedDigimonOnDetailsAccessor) return;

    return this.formatAge(
      this.calculateDetailedAge(
        this.globalState.selectedDigimonOnDetailsAccessor.birthDate ??
        new Date()
      )
    );
  });

  neededExpForNextLevel = computed(() =>
    this.globalState.getDigimonNeededExpForNextLevel()
  );

  evolutionRoute = signal<BaseDigimon[]>([]);

  constructor() {
    effect(
      () => {
        this.globalState.selectedDigimonOnDetailsAccessor;
        const evolutionList = this.globalState.getDigimonCurrentEvolutionRoute(
          this.globalState.selectedDigimonOnDetailsAccessor!
        );

        if (!evolutionList) {
          this.evolutionRoute.set([]);
          return;
        }

        this.evolutionRoute.set(evolutionList);
      }
    );
  }

  calculateDetailedAge(birthDate: Date): {
    years: number;
    months: number;
    days: number;
    hours: number;
  } {
    const currentDate = new Date();
    const birth = new Date(birthDate);

    let years = currentDate.getFullYear() - birth.getFullYear();
    let months = currentDate.getMonth() - birth.getMonth();
    let days = currentDate.getDate() - birth.getDate();
    let hours = currentDate.getHours() - birth.getHours();

    const HOURS_IN_A_DAY = 24;
    const MONTHS_IN_A_YEAR = 12;

    if (hours < 0) {
      hours += HOURS_IN_A_DAY;
      days--;
    }

    if (days < 0) {
      const previousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += previousMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += MONTHS_IN_A_YEAR;
      years--;
    }

    return { years, months, days, hours };
  }

  formatAge(age: { years: number; months: number; days: number; hours: number }): string {
    const t = this.translocoService;
    const parts: string[] = [];

    const addPart = (value: number, key: string) => {
      if (value > 0) {
        const pluralKey = value === 1
          ? `SHARED.COMPONENTS.DIGIMON_DETAILS_MODAL.${key}`
          : `SHARED.COMPONENTS.DIGIMON_DETAILS_MODAL.${key}_PLURAL`;
        parts.push(t.translate(pluralKey, { count: value }));
      }
    };

    addPart(age.years, 'YEAR');
    addPart(age.months, 'MONTH');
    addPart(age.days, 'DAY');
    addPart(age.hours, 'HOUR');

    return parts.length > 0
      ? parts.join(', ')
      : t.translate('SHARED.COMPONENTS.DIGIMON_DETAILS_MODAL.LESS_THAN_HOUR');
  }

  openEvolutionTreeModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.evolutionTreeModalId, EvolutionTreeModalComponent, {
      mainDigimon: this.globalState.selectedDigimonOnDetailsAccessor
    });
  }
}
