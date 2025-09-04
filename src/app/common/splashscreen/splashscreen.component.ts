import { Component, OnInit } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-splashscreen',
  imports: [],
  templateUrl: './splashscreen.component.html',
  styleUrl: './splashscreen.component.scss'
})
export class SplashscreenComponent implements OnInit {

  ngOnInit() {
    setTimeout(() => {
      invoke('close_splashscreen');
    }, 5000);
  }

}
