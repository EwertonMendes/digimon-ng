import { Component, inject, model } from '@angular/core';
import { ModalComponent } from 'app/shared/components/modal/modal.component';
import { CheckboxComponent } from "../../../shared/components/checkbox/checkbox.component";
import { FormsModule } from '@angular/forms';
import { AudioService } from 'app/services/audio.service';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [ModalComponent, CheckboxComponent, FormsModule],
  templateUrl: './config-modal.component.html',
  styleUrl: './config-modal.component.scss'
})
export class ConfigModalComponent {
  configModalId = 'config-modal';
  enableAudio = model(true);

  audioService = inject(AudioService);

  constructor() {
    this.enableAudio.set(this.audioService.isAudioEnabled);
  }

  toggleAudio(): void {
    this.audioService.isAudioEnabled = !this.audioService.isAudioEnabled;
  }
}
