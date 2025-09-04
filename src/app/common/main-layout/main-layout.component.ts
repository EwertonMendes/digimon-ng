import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActionBarComponent } from '../action-bar/action-bar.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet,
    ActionBarComponent,],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

}
