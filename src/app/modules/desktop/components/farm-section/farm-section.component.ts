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
    {
      id: '7b8d5e6f-9ca0-4d7b-af21-cb25d8e9fa06',
      name: 'Greymon',
      img: '/assets/digimons/Greymon.webp',
      rank: 'Champion',
      hp: 100,
      mp: 50,
      atk: 30,
      def: 20,
      exp: 0,
      level: 1
    },
    {
      id: '9i2ece6f-9ca0-4d7b-af21-cb25d8fr87a6',
      name: 'Greymon',
      img: '/assets/digimons/Greymon.webp',
      rank: 'Champion',
      hp: 100,
      mp: 50,
      atk: 30,
      def: 20,
      exp: 0,
      level: 1
    },
  ]
}
