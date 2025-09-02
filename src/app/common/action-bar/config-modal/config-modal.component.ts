import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from "@shared/components/checkbox/checkbox.component";
import { AudioService } from 'app/services/audio.service';
import { SelectComponent } from 'app/shared/components/select/select.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { ModalComponent } from 'app/shared/components/modal/modal.component';
import { ThemeService } from 'app/services/theme.service';
import { ConfigService } from 'app/services/config.service';
import { WindowService } from '@services/window.service';

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

  form!: FormGroup;

  languageOptions = [
    { label: 'English', value: 'en', icon: 'assets/flags/en.svg' },
    { label: 'Español', value: 'es', icon: 'assets/flags/es.svg' },
    { label: 'Português Brasil', value: 'pt-br', icon: 'assets/flags/pt-br.svg' },
  ];

  themeOptions = signal<{ label: string; value: string }[]>([]);

  private fb = inject(FormBuilder);
  private windowService = inject(WindowService);
  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);
  private themeService = inject(ThemeService);
  private configService = inject(ConfigService);

  private translationSubscription?: Subscription;

  async ngOnInit() {
    this.form = this.fb.group({
      enableAudio: [this.audioService.isAudioEnabled],
      selectedLanguage: [this.translocoService.getActiveLang() ?? 'en'],
      selectedTheme: [this.themeService.getCurrentTheme().name],
      toggleFullscreen: [false],
    });

    const isFullscreen = await this.windowService.isFullscreen();

    this.form.patchValue({
      toggleFullscreen: isFullscreen,
    });

    this.setTranslatedThemeOptions();

    this.translationSubscription = this.translocoService
      .selectTranslation()
      .subscribe(() => {
        this.setTranslatedThemeOptions();
      });

    this.form.get('toggleFullscreen')?.valueChanges.subscribe(async (value) => {
      await this.windowService.toggleFullscreen();
      this.configService.updateConfig("toggleFullscreen", value);
    });

    this.form.get('enableAudio')?.valueChanges.subscribe(value => {
      this.audioService.isAudioEnabled = value;
      this.configService.updateConfig("enableAudio", value);
    });

    this.form.get('selectedLanguage')?.valueChanges.subscribe(lang => {
      this.translocoService.setActiveLang(lang);
      this.configService.updateConfig("language", lang);
    });

    this.form.get('selectedTheme')?.valueChanges.subscribe(themeName => {
      this.themeService.setTheme(themeName);
    });
  }

  ngOnDestroy(): void {
    this.translationSubscription?.unsubscribe();
  }

  setTranslatedThemeOptions(): void {
    const options = this.themeService.getThemes().map(t => ({
      label: this.translocoService.translate(
        `COMMON.ACTION_BAR.CONFIG_MODAL.THEME.${t.name.toUpperCase()}`
      ),
      value: t.name,
    }));
    this.themeOptions.set(options);
  }
}
