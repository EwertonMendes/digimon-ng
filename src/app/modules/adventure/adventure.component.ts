import { Component } from '@angular/core';
import { ExploreSectionComponent } from './components/explore-section/explore-section.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-adventure',
  standalone: true,
  imports: [ExploreSectionComponent, TranslocoModule],
  templateUrl: './adventure.component.html',
  styleUrl: './adventure.component.scss'
})
export class AdventureComponent {

}
