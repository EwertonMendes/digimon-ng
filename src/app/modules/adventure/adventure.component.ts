import { Component } from '@angular/core';
import { ExploreSectionComponent } from './components/explore-section/explore-section.component';
import { DigimonDetailsModalComponent } from '../../shared/components/digimon-details-modal/digimon-details-modal.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-adventure',
  standalone: true,
  imports: [ExploreSectionComponent, DigimonDetailsModalComponent, TranslocoModule],
  templateUrl: './adventure.component.html',
  styleUrl: './adventure.component.scss'
})
export class AdventureComponent {

}
