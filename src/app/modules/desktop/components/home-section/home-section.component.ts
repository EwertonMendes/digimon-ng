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
      name: 'Agumon',
      img: 'assets/digimons/Agumon.webp',
      hp: 20,
      mp: 15,
      atk: 10,
      def: 5,
      exp: 100,
      level: 5
    },
    {
      name: 'Angemon',
      img: 'assets/digimons/Angemon.webp',
      hp: 25,
      mp: 20,
      atk: 15,
      def: 10,
      exp: 150,
      level: 6
    },
    {
      name: 'Aquilamon',
      img: 'assets/digimons/Aquilamon.webp',
      hp: 30,
      mp: 25,
      atk: 20,
      def: 15,
      exp: 200,
      level: 7
    },
    {
      name: 'Apemon',
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
