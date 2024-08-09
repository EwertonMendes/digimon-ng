import { Component, computed, inject, input } from '@angular/core';
import { Digimon } from '../../../core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';

@Component({
  selector: 'app-digi-status-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './digi-status-card.component.html',
  styleUrl: './digi-status-card.component.scss',
  animations: [
    trigger('damage', [
      state('normal', style({ transform: 'translateX(0)' })),
      state('attacked', style({ transform: 'translateX(10px)' })),
      transition('normal => attacked', [
        animate('0.1s ease-in', style({ transform: 'translateX(20px)' })),
        animate('0.1s ease-out', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class DigiStatusCardComponent {
  digimon = input.required<Digimon>();
  globalState = inject(GlobalStateDataSource);
  damageState = computed(() => {
    return this.globalState.currentDefendingDigimon()?.id === this.digimon().id
      ? 'attacked'
      : 'normal' ?? 'normal';
  });

  resetDamageState() {
    this.globalState.currentDefendingDigimon.set(null);
  }
}
