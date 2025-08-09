import { Component, inject, model } from '@angular/core';
import { ModalComponent } from 'app/shared/components/modal/modal.component';
import { CheckboxComponent } from "../../../shared/components/checkbox/checkbox.component";
import { FormsModule } from '@angular/forms';
import { AudioService } from 'app/services/audio.service';
import { SelectComponent } from 'app/shared/components/select/select.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [ModalComponent, CheckboxComponent, SelectComponent, FormsModule, TranslocoModule],
  templateUrl: './config-modal.component.html',
  styleUrl: './config-modal.component.scss'
})
export class ConfigModalComponent {
  configModalId = 'config-modal';
  enableAudio = model(true);
  languageOptions = [
    { label: 'English', value: 'en', icon: 'assets/flags/en.svg' },
    { label: 'Español', value: 'es', icon: 'assets/flags/es.svg' },
    { label: 'Português Brasil', value: 'pt-br', icon: 'assets/flags/pt-br.svg' },
  ];
  selectedLanguage = model('en');

  audioService = inject(AudioService);
  translocoService = inject(TranslocoService);

  constructor() {
    this.enableAudio.set(this.audioService.isAudioEnabled);
  }

  toggleAudio(): void {
    this.audioService.isAudioEnabled = !this.audioService.isAudioEnabled;
  }

  changeLanguage(language: string): void {
    this.translocoService.setActiveLang(language);
    this.selectedLanguage.set(language);
  }
}
