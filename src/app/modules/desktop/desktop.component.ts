import { Component } from '@angular/core';
import { HomeSectionComponent } from './components/home-section/home-section.component';
import { FarmSectionComponent } from './components/farm-section/farm-section.component';
import { DigimonDetailsModalComponent } from '../../shared/components/digimon-details-modal/digimon-details-modal.component';
import { ExploreSectionComponent } from './components/explore-section/explore-section.component';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [
    HomeSectionComponent,
    FarmSectionComponent,
    ExploreSectionComponent,
    DigimonDetailsModalComponent
  ],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.scss',
})
export class DesktopComponent {
}
