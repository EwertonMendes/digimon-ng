import { Component, DestroyRef, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AudioService } from '@services/audio.service';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { StorageModalComponent } from '@shared/components/storage-modal/storage-modal.component';
import { PlayerInfoModalComponent } from '@shared/components/player-info-modal/player-info-modal.component';
import { DebugModalComponent } from './debug-modal/debug-modal.component';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { ToastService } from '@shared/components/toast/toast.service';
import { environment } from 'app/environments/environment';
import { ConfigModalComponent } from './config-modal/config-modal.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TooltipDirective } from 'app/directives/tooltip.directive';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { IconComponent } from "@shared/components/icon/icon.component";
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [
    TranslocoModule,
    TooltipDirective,
    IconComponent,
    CommonModule
  ],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ActionBarComponent implements OnInit {
  playerInfoModalId = 'player-info-modal';
  digimonStorageModalId = 'digimon-storage-modal';
  debugModalId = 'debug-modal';
  configModalId = 'config-modal';
  isDevMode = !environment.production;

  protected currentRoute = signal<string>('');

  private modalService = inject(ModalService);
  private audioService = inject(AudioService);
  private router = inject(Router);
  protected globalState = inject(GlobalStateDataSource);
  private toastService = inject(ToastService);
  private translocoService = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.urlAfterRedirects.split('/')[1]);
    });
  }

  openDigimonStorageModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.digimonStorageModalId, StorageModalComponent);
  }

  openPlayerInfoModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.playerInfoModalId, PlayerInfoModalComponent);
  }

  openDebugModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.debugModalId, DebugModalComponent);
  }

  openConfigModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.configModalId, ConfigModalComponent);
  }

  navigateTo(url: string) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.router.navigate([url]);
  }

  async saveGame() {
    this.audioService.playAudio(AudioEffects.CLICK);
    try {
      await this.globalState.saveCurrentPlayerData();
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.TOAST.GAME_SAVED_SUCCESSFULLY'), 'success');

    } catch (err) {
      this.toastService.showToast(this.translocoService.translate('COMMON.ACTION_BAR.TOAST.GAME_SAVE_FAILED'), 'error');
    }
  }
}
