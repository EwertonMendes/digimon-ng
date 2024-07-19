import { Component } from '@angular/core';

@Component({
  selector: 'app-explore-section',
  standalone: true,
  imports: [],
  templateUrl: './explore-section.component.html',
  styleUrl: './explore-section.component.scss',
})
export class ExploreSectionComponent {
  locations = [
    {
      name: 'Login Mountain',
      img: 'assets/environments/loginmountain.png',
    },
    {
      name: 'Pixel Desert',
      img: 'assets/environments/pixeldesert.png',
    },
    {
      name: 'Register Jungle',
      img: 'assets/environments/registerjungle.png',
    },
    {
      name: 'Proxy Island',
      img: 'assets/environments/proxyisland.png',
    },
  ];
}
