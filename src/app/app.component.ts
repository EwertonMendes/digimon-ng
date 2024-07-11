import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopComponent } from './modules/desktop/desktop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DesktopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'digi-angular';
}
