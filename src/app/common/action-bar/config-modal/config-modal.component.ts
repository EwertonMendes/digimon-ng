import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { SelectComponent } from 'app/shared/components/select/select.component';
import { ModalComponent } from 'app/shared/components/modal/modal.component';
import { ThemeService } from 'app/services/theme.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { ModalService } from '@shared/components/modal/modal.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@shared/components/toast/toast.service';
import { LanguageOption, languageOptions } from '@core/consts/languages';
import { ConfigStateDataSource } from '@state/config-state.datasource';
import { openUrl } from '@tauri-apps/plugin-opener';

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

  languageOptions: LanguageOption[] = languageOptions;
  themeOptions = signal<{ label: string; value: string }[]>([]);

  private fb = inject(FormBuilder);
  private translocoService = inject(TranslocoService);
  private themeService = inject(ThemeService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  protected configState = inject(ConfigStateDataSource);

  ngOnInit(): void {
    this.form = this.fb.group({
      enableAudio: [this.configState.audioEnabled()],
      selectedLanguage: [this.configState.languageCode()],
      selectedTheme: [this.configState.themeName()],
      toggleFullscreen: [this.configState.fullscreenEnabled()],
      enableLocalAi: [this.configState.localAiEnabled()],
    });

    this.setTranslatedThemeOptions();

    this.translocoService
      .selectTranslation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setTranslatedThemeOptions();
      });

    this.form
      .get('toggleFullscreen')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: boolean) => {
        this.configState.setFullscreenEnabled(!!value);
      });

    this.form
      .get('enableAudio')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: boolean) => {
        this.configState.setAudioEnabled(!!value);
      });

    this.form
      .get('selectedLanguage')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang: string) => {
        this.configState.setLanguage(lang);
      });

    this.form
      .get('selectedTheme')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((themeName: string) => {
        this.configState.setTheme(themeName);
      });

    this.form
      .get('enableLocalAi')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: boolean) => {
        this.configState.setLocalAiEnabled(!!value);
      });

    this.modalService
      .onClose(this.deleteSavedDataModalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (shouldDelete) => {
        if (!shouldDelete) return;
        this.modalService.close(this.configModalId);
        this.toastService.showToast(
          this.translocoService.translate(
            'COMMON.ACTION_BAR.CONFIG_MODAL.DELETE_DATA_MODAL.DELETED_SAVED_DATA_TOAST'
          ),
          'success'
        );
      });
  }

  setTranslatedThemeOptions(): void {
    const options = this.themeService.getThemes().map((t) => ({
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
      cancelButtonColor: 'dark',
    });
  }

  protected openOllamaPage() {
    openUrl('https://ollama.com/download');
  }

  protected installAIModel() {
    this.configState.installModel('gemma3n:e4b');
  }
}
