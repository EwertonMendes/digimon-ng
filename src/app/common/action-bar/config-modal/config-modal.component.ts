import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from "@shared/components/checkbox/checkbox.component";
import { AudioService } from 'app/services/audio.service';
import { SelectComponent } from 'app/shared/components/select/select.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ModalComponent } from 'app/shared/components/modal/modal.component';
import { ThemeService } from 'app/services/theme.service';
import { ConfigService } from 'app/services/config.service';
import { WindowService } from '@services/window.service';
import { ButtonComponent } from "@shared/components/button/button.component";
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { ModalService } from '@shared/components/modal/modal.service';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@shared/components/toast/toast.service';
import { PlayerDataService } from '@services/player-data.service';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [
    ModalComponent,
    CheckboxComponent,
    SelectComponent,
    ReactiveFormsModule,
    TranslocoModule,
    ButtonComponent,
],
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.scss'],
})
export class ConfigModalComponent implements OnInit {
  configModalId = 'config-modal';
  deleteSavedDataModalId = 'delete-saved-data-modal';

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
  private playerDataService = inject(PlayerDataService);
  private themeService = inject(ThemeService);
  private configService = inject(ConfigService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);
  private globalState = inject(GlobalStateDataSource);
  private destroyRef = inject(DestroyRef);

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

    this.translocoService
      .selectTranslation().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setTranslatedThemeOptions();
      });

    this.form.get('toggleFullscreen')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async (value) => {
      await this.windowService.toggleFullscreen();
      this.configService.updateConfig("toggleFullscreen", value);
    });

    this.form.get('enableAudio')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.audioService.isAudioEnabled = value;
      this.configService.updateConfig("enableAudio", value);
    });

    this.form.get('selectedLanguage')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(lang => {
      this.translocoService.setActiveLang(lang);
      this.configService.updateConfig("language", lang);
    });

    this.form.get('selectedTheme')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(themeName => {
      this.themeService.setTheme(themeName);
    });

    this.modalService.onClose(this.deleteSavedDataModalId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async (shouldDelete) => {
      if (!shouldDelete) return;
      this.modalService.close(this.configModalId);
      await this.configService.deleteConfigFile();
      await this.playerDataService.deletePlayerData();
      this.globalState.resetGameToInitialSetup();
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.CONFIG_MODAL.DELETE_DATA_MODAL.DELETED_SAVED_DATA_TOAST'), 'success');
    });
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

  protected openDeleteDataConfirmationModal() {
    this.modalService.open(this.deleteSavedDataModalId, ConfirmModalComponent, {
      title: 'COMMON.ACTION_BAR.CONFIG_MODAL.DELETE_DATA_MODAL.TITLE',
      text: 'COMMON.ACTION_BAR.CONFIG_MODAL.DELETE_DATA_MODAL.TEXT',
      confirmText: 'COMMON.ACTION_BAR.CONFIG_MODAL.DELETE_DATA_MODAL.CONFIRM',
      cancelText: 'COMMON.ACTION_BAR.CONFIG_MODAL.DELETE_DATA_MODAL.CANCEL',
      backgroundColor: 'danger',
      confirmButtonColor: 'warning',
      cancelButtonColor: 'dark'
    });
  }
}
