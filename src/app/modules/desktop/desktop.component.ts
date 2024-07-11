import { Component } from '@angular/core';
import { HomeSectionComponent } from './components/home-section/home-section.component';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [HomeSectionComponent],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.scss'
})
export class DesktopComponent {

}
