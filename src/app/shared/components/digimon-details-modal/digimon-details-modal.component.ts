import { Component, computed, effect, inject, signal } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import { Digimon } from '../../../core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';
import { EvolutionTreeComponent } from '../evolution-tree/evolution-tree.component';

@Component({
  standalone: true,
  selector: 'app-digimon-details-modal',
  templateUrl: './digimon-details-modal.component.html',
  styleUrl: './digimon-details-modal.component.scss',
  imports: [ModalComponent, CommonModule, EvolutionTreeComponent],
})
export class DigimonDetailsModalComponent {
  digimonDetailsModalId = 'digimon-details-modal';

  globalState = inject(GlobalStateDataSource);

  digimonDetailedAge = computed(() => {
    if (!this.globalState.selectedDigimonOnDetailsAccessor) return;

    return this.formatAge(
      this.calculateDetailedAge(
        this.globalState.selectedDigimonOnDetailsAccessor.birthDate ??
          new Date()
      )
    );
  });

  neededExpForNextLevel = computed(() => {
    if (!this.globalState.selectedDigimonOnDetailsAccessor) return;
    return this.globalState.getNeededExpForNextLevel(
      this.globalState.selectedDigimonOnDetailsAccessor
    );
  });

  evolutions = signal<Digimon[]>([]);

  constructor() {
    effect(
      () => {
        this.globalState.selectedDigimonOnDetailsAccessor;
        const evolutionList = this.globalState.getDigimonCompleteEvolutionTree(
          this.globalState.selectedDigimonOnDetailsAccessor!
        );

        if (!evolutionList) return;

        this.evolutions.set(evolutionList.mainEvolutionTree);
      },
      {
        allowSignalWrites: true,
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

  formatAge(age: {
    years: number;
    months: number;
    days: number;
    hours: number;
  }): string {
    const parts = [];

    if (age.years > 0) {
      parts.push(`${age.years} year${age.years > 1 ? 's' : ''}`);
    }
    if (age.months > 0) {
      parts.push(`${age.months} month${age.months > 1 ? 's' : ''}`);
    }
    if (age.days > 0) {
      parts.push(`${age.days} day${age.days > 1 ? 's' : ''}`);
    }
    if (age.hours > 0) {
      parts.push(`${age.hours} hour${age.hours > 1 ? 's' : ''}`);
    }

    return parts.join(', ') || 'less than an hour';
  }
}
