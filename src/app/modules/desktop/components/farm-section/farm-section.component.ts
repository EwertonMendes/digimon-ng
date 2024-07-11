import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';

@Component({
  selector: 'app-farm-section',
  standalone: true,
  imports: [ButtonComponent, DigiStatusCardComponent],
  templateUrl: './farm-section.component.html',
  styleUrl: './farm-section.component.scss'
})
export class FarmSectionComponent {
  inTrainingDigimonList: Digimon[] = [
    { name: 'Greymon', img: '/assets/digimons/Greymon.webp', hp: 100, mp: 50, atk: 30, def: 20, exp: 0, level: 1 },
    { name: 'Greymon', img: '/assets/digimons/Greymon.webp', hp: 100, mp: 50, atk: 30, def: 20, exp: 0, level: 1 },
    { name: 'Greymon', img: '/assets/digimons/Greymon.webp', hp: 100, mp: 50, atk: 30, def: 20, exp: 0, level: 1 },
    { name: 'Greymon', img: '/assets/digimons/Greymon.webp', hp: 100, mp: 50, atk: 30, def: 20, exp: 0, level: 1 },
  ]
}
