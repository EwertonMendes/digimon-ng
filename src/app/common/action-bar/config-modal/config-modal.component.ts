import { Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { THEMES } from './themes';
import { CheckboxComponent } from "../../../shared/components/checkbox/checkbox.component";
import { FormsModule } from '@angular/forms';
import { AudioService } from 'app/services/audio.service';
import { SelectComponent } from 'app/shared/components/select/select.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { ModalComponent } from 'app/shared/components/modalV2/modal.component';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [ModalComponent, CheckboxComponent, SelectComponent, FormsModule, TranslocoModule],
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.scss']
})
export class ConfigModalComponent implements OnInit, OnDestroy {
  configModalId = 'config-modal';
  enableAudio = model(true);
  languageOptions = [
    { label: 'English', value: 'en', icon: 'assets/flags/en.svg' },
    { label: 'Español', value: 'es', icon: 'assets/flags/es.svg' },
    { label: 'Português Brasil', value: 'pt-br', icon: 'assets/flags/pt-br.svg' },
  ];
  selectedLanguage = model('en');

  themeOptions = signal<{ label: string; value: string }[]>([]);
  themes = THEMES;
  selectedTheme = signal(THEMES[0]);

  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);

  private translationSubscription: Subscription | undefined;

  ngOnInit() {
    this.enableAudio.set(this.audioService.isAudioEnabled);
    this.onThemeChange(this.selectedTheme().name);

    this.translationSubscription = this.translocoService.selectTranslation().subscribe(() => {
      this.setTranslatedThemeOptions();
    });
  }

  ngOnDestroy(): void {
    this.translationSubscription?.unsubscribe();
  }

  setTranslatedThemeOptions(): void {
    const options = this.themes.map(t => ({
      label: this.translocoService.translate(`COMMON.ACTION_BAR.CONFIG_MODAL.THEME.${t.name.toUpperCase()}`),
      value: t.name
    }));
    this.themeOptions.set(options);
  }

  onThemeChange(themeName: string): void {
    const newTheme = this.themes.find(t => t.name === themeName);
    if (newTheme) {
      this.selectedTheme.set(newTheme);
    }

    const themeToRemove = document.body.className.match(/theme-[a-z0-9]+(?:-[a-z0-9]+)*$/);
    if (themeToRemove) {
      document.body.classList.remove(themeToRemove[0]);
    }

    const themeClass = this.themes.find(t => t.name === themeName)?.className ?? '';
    if (themeClass) {
      document.body.classList.add(themeClass);
    }
  }

  changeLanguage(language: string): void {
    this.translocoService.setActiveLang(language);
  }

  toggleAudio(): void {
    this.audioService.isAudioEnabled = !this.audioService.isAudioEnabled;
  }
}
