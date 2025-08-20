import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { THEMES } from './themes';
import { CheckboxComponent } from "../../../shared/components/checkbox/checkbox.component";
import { AudioService } from 'app/services/audio.service';
import { SelectComponent } from 'app/shared/components/select/select.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { ModalComponent } from 'app/shared/components/modal/modal.component';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [
    ModalComponent,
    CheckboxComponent,
    SelectComponent,
    ReactiveFormsModule,
    TranslocoModule,
  ],
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.scss'],
})
export class ConfigModalComponent implements OnInit, OnDestroy {
  configModalId = 'config-modal';

  languageOptions = [
    { label: 'English', value: 'en', icon: 'assets/flags/en.svg' },
    { label: 'Español', value: 'es', icon: 'assets/flags/es.svg' },
    { label: 'Português Brasil', value: 'pt-br', icon: 'assets/flags/pt-br.svg' },
  ];

  themes = THEMES;
  themeOptions = signal<{ label: string; value: string }[]>([]);

  form!: FormGroup;

  private fb = inject(FormBuilder);
  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);
  private translationSubscription: Subscription | undefined;

  ngOnInit() {
    this.form = this.fb.group({
      enableAudio: [this.audioService.isAudioEnabled],
      selectedLanguage: [this.translocoService.getActiveLang() ?? 'en'],
      selectedTheme: [this.themes[0].name],
    });

    this.setTranslatedThemeOptions();

    this.translationSubscription = this.translocoService
      .selectTranslation()
      .subscribe(() => {
        this.setTranslatedThemeOptions();
      });

    this.form.get('enableAudio')?.valueChanges.subscribe(value => {
      this.audioService.isAudioEnabled = value;
    });

    this.form.get('selectedLanguage')?.valueChanges.subscribe(lang => {
      this.changeLanguage(lang);
    });

    this.form.get('selectedTheme')?.valueChanges.subscribe(themeName => {
      this.onThemeChange(themeName);
    });

    this.onThemeChange(this.form.get('selectedTheme')?.value);
  }

  ngOnDestroy(): void {
    this.translationSubscription?.unsubscribe();
  }

  setTranslatedThemeOptions(): void {
    const options = this.themes.map(t => ({
      label: this.translocoService.translate(
        `COMMON.ACTION_BAR.CONFIG_MODAL.THEME.${t.name.toUpperCase()}`
      ),
      value: t.name,
    }));
    this.themeOptions.set(options);
  }

  onThemeChange(themeName: string): void {
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
}
