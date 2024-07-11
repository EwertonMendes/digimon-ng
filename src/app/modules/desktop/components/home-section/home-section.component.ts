import { Component } from '@angular/core';
import { DigiStatusCardComponent } from '../../../../shared/components/digi-status-card/digi-status-card.component';
import { Digimon } from '../../../../core/interfaces/digimon.interface';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [DigiStatusCardComponent],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.scss'
})
export class HomeSectionComponent {
  myDigimonList: Digimon[] = [
    {
      id: '4e2b6e8a-9c10-4abe-b2c1-2f0f9b9a1e45',
      name: 'Agumon',
      img: 'assets/digimons/Agumon.webp',
      rank: 'Rookie',
      hp: 20,
      mp: 15,
      atk: 10,
      def: 5,
      exp: 100,
      level: 5
    },
    {
      id: '5d3a8b3e-6f00-4e7b-8e77-a9b5b8f5e3f4',
      name: 'Angemon',
      rank: 'Champion',
      img: 'assets/digimons/Angemon.webp',
      hp: 25,
      mp: 20,
      atk: 15,
      def: 10,
      exp: 150,
      level: 6
    },
    {
      id: 'b9a2e6c4-4d6b-4c1f-8f9e-0b6c0b2f1a3e',
      name: 'Aquilamon',
      rank: 'Champion',
      img: 'assets/digimons/Aquilamon.webp',
      hp: 30,
      mp: 25,
      atk: 20,
      def: 15,
      exp: 200,
      level: 7
    },
    {
      id: 'c8e9b7d6-3e2a-4b1c-9e8f-1a0e2b3c4d6b',
      name: 'Apemon',
      rank: 'Champion',
      img: 'assets/digimons/Apemon.webp',
      hp: 35,
      mp: 30,
      atk: 25,
      def: 20,
      exp: 250,
      level: 8
    }
  ]
}
