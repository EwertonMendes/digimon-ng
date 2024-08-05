import { Component } from '@angular/core';
import { ExploreSectionComponent } from './components/explore-section/explore-section.component';
import { DigimonDetailsModalComponent } from '../../shared/components/digimon-details-modal/digimon-details-modal.component';

@Component({
  selector: 'app-adventure',
  standalone: true,
  imports: [ExploreSectionComponent, DigimonDetailsModalComponent],
  templateUrl: './adventure.component.html',
  styleUrl: './adventure.component.scss'
})
export class AdventureComponent {

}
